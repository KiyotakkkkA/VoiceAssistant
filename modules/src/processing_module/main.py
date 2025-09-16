import time
from datetime import datetime
from clients import ModuleClient
from src.processing_module.services import Excecutor
from enums.Events import EventsType, EventsTopic
from store.ToolsStore import ToolsStore
from store.RuntimeCacheStore import RuntimeCacheStore
from utils.EnvHelper import getenv_float
from utils.LogService import get_logger, log_crash, log_error, log_info
from utils import CacheService

def run(stop_event):
    logger = get_logger()
    module_name = "processing_module"
    
    logger.info("Starting processing module", module_name)

    try:
        client = ModuleClient(
            service_name='processing_module',
            manifest_file='manifest.json',
            subscribes=[EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value],
            heartbeat_interval=5.0,
            max_reconnect_attempts=10,
            log_prefix='processing'
        )

        executor = Excecutor(
            prediction_threshold=getenv_float('TEXT_CLASSIFICATION_PREDICTION_THRESHOLD', 0.85)
        )

        executor.set_socket_client(client)
        logger.info("Processing module initialized successfully", module_name)
        
    except Exception as e:
        log_crash("Failed to initialize processing module", module_name, e)
        return

    def handle_tool_off(msg):
        ToolsStore.update_tool_status(msg.get('payload', {}).get('toolName'), False)
        ToolsStore.refetch_tools()

    def handle_tool_on(msg):
        ToolsStore.update_tool_status(msg.get('payload', {}).get('toolName'), True)
        ToolsStore.refetch_tools()
    
    def handle_dialog_created(msg):
        dialog_id = msg.get('payload', {}).get('dialog_id')
        
        if dialog_id:
            dialogs_cache = CacheService().getInstance().get_cache('dialogs_cache', {})
            
            if dialogs_cache is None:
                dialogs_cache = {}

            if dialog_id not in dialogs_cache:
                dialogs_cache[dialog_id] = {
                    'title': 'Новый диалог',
                    'create_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat(),
                    'messages': []
                }
                CacheService().getInstance().set_cache('dialogs_cache', dialogs_cache)

                client.emit({
                    'type': EventsType.EVENT.value,
                    'topic': EventsTopic.JSON_ACTIVE_DIALOG_SET.value,
                    'payload': {
                        'dialog_id': dialog_id
                    },
                    'from': 'processing_module'
                })

    def handle_dialog_renamed(msg):
        dialog_id = msg.get('payload', {}).get('dialog_id')
        new_title = msg.get('payload', {}).get('new_title')
        
        if dialog_id and new_title is not None:
            dialogs_cache = CacheService().getInstance().get_cache('dialogs_cache', {})
            
            if dialog_id in dialogs_cache:

                if dialogs_cache is None:
                    dialogs_cache = {}

                dialogs_cache[dialog_id]['title'] = new_title
                dialogs_cache[dialog_id]['updated_at'] = datetime.now().isoformat()
                CacheService().getInstance().set_cache('dialogs_cache', dialogs_cache)

    def handle_dialog_deleted(msg):
        dialog_id = msg.get('payload', {}).get('dialog_id')
        
        if dialog_id:
            dialogs_cache = CacheService().getInstance().get_cache('dialogs_cache', {})
            
            if dialogs_cache and dialog_id in dialogs_cache:
                del dialogs_cache[dialog_id]
                CacheService().getInstance().set_cache('dialogs_cache', dialogs_cache)
                
                if dialogs_cache:
                    first_dialog_id = list(dialogs_cache.keys())[0]
                    client.emit({
                        'type': EventsType.EVENT.value,
                        'topic': EventsTopic.JSON_ACTIVE_DIALOG_SET.value,
                        'payload': {
                            'dialog_id': first_dialog_id
                        },
                        'from': 'processing_module'
                    })

    def handle_raw_text(msg):

        if stop_event.is_set():
            return

        for out in executor.run(msg):

            service = executor.services["ai_service"]

            client.emit({
                'type': EventsType.SERVICE_ACTION.value,
                'topic': out['event'] if out.get("event") else EventsTopic.ACTION_TRANSCRIPT.value,
                'payload': out,
                'from': 'processing_module'
            })

            if msg.get('payload', {}).get('dialog_id') is not None:
                dialogs_cache = CacheService().getInstance().get_cache('dialogs_cache', {})
                current_dialog_cache = dialogs_cache.get(msg.get('payload', {}).get('dialog_id'), {}) # type: ignore

                current_dialog_cache['create_at'] = current_dialog_cache.get('create_at', datetime.now().isoformat())
                current_dialog_cache['updated_at'] = datetime.now().isoformat()
                current_dialog_cache['title'] = current_dialog_cache.get('title', None)

                current_dialog_cache['messages'] = current_dialog_cache.get('messages', [])
                current_dialog_cache['messages'].append({
                    'user_prompt': msg.get('payload', {}).get('text'),
                    'assistant_response': out,
                    'timestamp': datetime.now().isoformat(),
                    'model_name': executor.current_model_name or 'Неизвестная модель'
                })
                dialogs_cache[msg.get('payload', {}).get('dialog_id')] = current_dialog_cache # type: ignore
                CacheService().getInstance().set_cache('dialogs_cache', dialogs_cache)

            for side_effect in service.get_socket_messages_queue():
                client.emit({
                    'type': side_effect.get('type', EventsType.SERVICE_ACTION.value),
                    'topic': side_effect.get('topic', EventsTopic.ACTION_TRANSCRIPT.value),
                    'payload': side_effect.get('payload', {}),
                    'from': 'processing_module'
                })

            service.clear_socket_messages_queue()

    def handle_model_change(msg):
        executor.get_current_model_data_from_json(msg.get('payload', {}).get('data', {}).get('settings', {}).get('current.ai.model.id'))

    client.on(EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value, handle_raw_text)
    client.on(EventsTopic.HAVE_TO_BE_REFETCHED_SETTINGS_DATA.value, handle_model_change)
    client.on(EventsTopic.ACTION_TOOL_OFF.value, handle_tool_off)
    client.on(EventsTopic.ACTION_TOOL_ON.value, handle_tool_on)
    client.on(EventsTopic.ACTION_DIALOG_RENAMED.value, handle_dialog_renamed)
    client.on(EventsTopic.ACTION_DIALOG_DELETED.value, handle_dialog_deleted)
    client.on(EventsTopic.ACTION_DIALOG_CREATED.value, handle_dialog_created)

    client.start(stop_event, block=False)

    while not (client._ws and client._ws.sock and client._ws.sock.connected):
        time.sleep(0.1)
        if stop_event.is_set():
            return

    RuntimeCacheStore.from_settings_to_cache([
        {
            'key_from': 'current.account.data',
            'key_to': 'account_data',
        }
    ])

    print(RuntimeCacheStore.get_cache('current.account.data'))

    ToolsStore.init_available_tools(executor.services['ai_service']) # type: ignore

    tools_representations = ToolsStore.refetch_tools()

    client.emit({
        'type': EventsType.EVENT.value,
        'topic': EventsTopic.JSON_TOOLS_DATA_SET.value,
        'payload': {
            'data': {
                'settings': {
                    'current.ai.tools': tools_representations
                }
            }
        },
        'from': 'processing_module'
    })

    cache = CacheService().getInstance()
    dialogs_data = cache.get_cache('dialogs_cache', {})
    
    client.emit({
        'type': EventsType.EVENT.value,
        'topic': EventsTopic.JSON_DIALOGS_DATA_SET.value,
        'payload': {
            'data': {
                'dialogs': dialogs_data
            }
        },
        'from': 'processing_module'
    })

    if dialogs_data:
        first_dialog_id = next(iter(dialogs_data.keys()))
        client.emit({
            'type': EventsType.EVENT.value,
            'topic': EventsTopic.JSON_ACTIVE_DIALOG_SET.value,
            'payload': {
                'dialog_id': first_dialog_id
            },
            'from': 'processing_module'
        })


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
