from clients import ModuleClient
from src.speech_rec_module.services import Recognizer
from paths import path_resolver
from utils.EnvHelper import getenv
from utils.LogService import get_logger, log_crash, log_error, log_info
from enums.Events import EventsType, EventsTopic

def run(stop_event):
    logger = get_logger()
    module_name = "speech_rec_module"
    
    logger.info("Starting speech recognition module", module_name)
    
    import os
    from pathlib import Path
    
    try:
        assistant_name = getenv('ASSISTANT_NAME', 'Ассистент').strip('"')
        model_path = path_resolver['voice_model_path']
        
        logger.info(f"Assistant name: '{assistant_name}'", module_name)
        logger.info(f"Model path from resolver: '{model_path}'", module_name)
        logger.info(f"Model path exists: {Path(model_path).exists()}", module_name)
        
        if Path(model_path).exists():
            contents = list(Path(model_path).iterdir())[:5]
            logger.info(f"Model directory contents (first 5): {[str(p.name) for p in contents]}", module_name)
        else:
            logger.error(f"Model path does not exist: {model_path}", module_name)
            potential_paths = [
                Path(os.getcwd()) / "resources" / "models" / "voice_small",
                Path(__file__).parent.parent.parent.parent / "resources" / "models" / "voice_small",
                Path(os.getenv('APP_ROOT', '.')) / "resources" / "models" / "voice_small"
            ]
            for p in potential_paths:
                logger.info(f"Checking potential path: {p} - exists: {p.exists()}", module_name)
        
        logger.info(f"Initializing recognizer...", module_name)
        
        _active_dialog_id = {'value': None}

        client = ModuleClient(
            service_name='speech_rec_module',
            manifest_file='manifest.json',
            subscribes=[EventsTopic.ACTION_ACTIVE_DIALOG_SET.value],
            heartbeat_interval=5.0,
            max_reconnect_attempts=10,
            log_prefix='speech'
        )

        def set_active_dialog(msg: dict):
            dialog_id = (msg.get('payload') or {}).get('dialog_id')
            if dialog_id:
                _active_dialog_id['value'] = dialog_id

        client.on(EventsTopic.ACTION_ACTIVE_DIALOG_SET.value, set_active_dialog)

        recognizer = Recognizer(
            name=assistant_name,
            VOICE_RECOGNITION_MODEL_DIR_PATH=model_path,
        )
        
        logger.info("Recognizer initialized successfully", module_name)
        
    except Exception as e:
        log_crash(
            "Failed to initialize speech recognition module", 
            module_name, 
            e, 
            {
                "assistant_name": getenv('ASSISTANT_NAME', 'NOT_SET'),
                "model_path": path_resolver.get('voice_model_path', 'NOT_FOUND'),
                "available_paths": list(path_resolver.keys())
            }
        )
        return

    client.start(stop_event, block=False)
    logger.info("Client started, beginning recognition loop", module_name)

    try:
        for item in recognizer.run(stop_event):
            if stop_event.is_set():
                break
            if isinstance(item, dict):
                payload = dict(item.get('payload') or {})
                if _active_dialog_id['value'] and 'dialog_id' not in payload:
                    payload['dialog_id'] = _active_dialog_id['value']
                client.emit({
                    'type': item.get('type'),
                    'topic': item.get('topic'),
                    'from': 'speech_rec_module',
                    'payload': payload
                })
    except Exception as e:
        log_crash("Error in main recognition loop", module_name, e)
    finally:
        logger.info("Cleaning up speech recognition module", module_name)
        try:
            recognizer.cleanup()
            logger.info("Recognizer cleanup completed", module_name)
        except Exception as e2:
            log_error(f"Error during recognizer cleanup: {e2}", module_name, e2)
        try:
            client.stop()
            logger.info("Client stopped successfully", module_name)
        except Exception as e3:
            log_error(f"Error during client cleanup: {e3}", module_name, e3)


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
