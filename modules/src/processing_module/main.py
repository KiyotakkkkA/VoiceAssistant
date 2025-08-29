import os
import time
from clients import ModuleClient
from src.processing_module.services import Excecutor
from paths import path_resolver
from enums.Events import EventsType, EventsTopic

def run(stop_event):

    client = ModuleClient(
        service_name='processing_module',
        manifest_file='manifest.json',
        subscribes=[EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value],
        heartbeat_interval=5.0,
        max_reconnect_attempts=10,
        log_prefix='processing'
    )

    executor = Excecutor(
        prediction_threshold=float(os.getenv('TEXT_CLASSIFICATION_PREDICTION_THRESHOLD', '0.85'))
    )

    avaliable_tools = executor.services['ai_service'].get_tools() # type: ignore

    def handle_raw_text(msg):

        if stop_event.is_set():
            return

        for out in executor.run(msg):
            client.emit({
                'type': EventsType.SERVICE_ACTION.value,
                'topic': out['event'] if out.get("event") else EventsTopic.ACTION_TRANSCRIPT.value,
                'payload': out,
                'from': 'processing_module'
            })

    def handle_model_change(msg):
        executor.get_current_model_data_from_json(msg.get('payload', {}).get('modelId'))

    client.on(EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value, handle_raw_text)
    client.on(EventsTopic.HAVE_TO_BE_REFETCHED_SETTINGS_DATA.value, handle_model_change)

    client.start(stop_event, block=False)

    while not (client._ws and client._ws.sock and client._ws.sock.connected):
        time.sleep(0.1)
        if stop_event.is_set():
            return

    client.emit({
        'type': EventsType.EVENT.value,
        'topic': EventsTopic.JSON_TOOLS_DATA_SET.value,
        'payload': {
            'data': {
                'tools': avaliable_tools
            }
        },
        'from': 'processing_module'
    })


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
