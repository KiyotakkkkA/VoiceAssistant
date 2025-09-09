from clients import ModuleClient
from src.speech_rec_module.services import Recognizer
from paths import path_resolver
from utils.EnvHelper import getenv
from utils.LogService import get_logger, log_crash, log_error, log_info

def run(stop_event):
    logger = get_logger()
    module_name = "speech_rec_module"
    
    logger.info("Starting speech recognition module", module_name)
    
    # Диагностическая информация о путях
    import os
    from pathlib import Path
    
    logger.info(f"Current working directory: {os.getcwd()}", module_name)
    logger.info(f"APP_ROOT from environment: {os.getenv('APP_ROOT', 'NOT_SET')}", module_name)
    logger.info(f"Available path_resolver keys: {list(path_resolver.keys())}", module_name)
    
    try:
        assistant_name = getenv('ASSISTANT_NAME', 'Ассистент').strip('"')
        model_path = path_resolver['voice_model_path']
        
        logger.info(f"Assistant name: '{assistant_name}'", module_name)
        logger.info(f"Model path from resolver: '{model_path}'", module_name)
        logger.info(f"Model path exists: {Path(model_path).exists()}", module_name)
        
        if Path(model_path).exists():
            contents = list(Path(model_path).iterdir())[:5]  # First 5 items
            logger.info(f"Model directory contents (first 5): {[str(p.name) for p in contents]}", module_name)
        else:
            logger.error(f"Model path does not exist: {model_path}", module_name)
            # Try to find where resources actually are
            potential_paths = [
                Path(os.getcwd()) / "resources" / "models" / "voice_small",
                Path(__file__).parent.parent.parent.parent / "resources" / "models" / "voice_small",
                Path(os.getenv('APP_ROOT', '.')) / "resources" / "models" / "voice_small"
            ]
            for p in potential_paths:
                logger.info(f"Checking potential path: {p} - exists: {p.exists()}", module_name)
        
        logger.info(f"Initializing recognizer...", module_name)
        
        client = ModuleClient(
            service_name='speech_rec_module',
            manifest_file='manifest.json',
            subscribes=[],
            heartbeat_interval=5.0,
            max_reconnect_attempts=10,
            log_prefix='speech'
        )

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

    try:
        client.start(stop_event, block=False)
        logger.info("Client started, beginning recognition loop", module_name)
        
        for item in recognizer.run(stop_event):
            if stop_event.is_set():
                break
                
            if isinstance(item, dict):
                try:
                    client.emit({
                        'type': item.get('type'), 
                        'topic': item.get('topic'), 
                        'from': 'speech_rec_module', 
                        'payload': item.get('payload')
                    })
                except Exception as e:
                    log_error(f"Error emitting message: {e}", module_name, e)
                    if stop_event.is_set():
                        break
        
    except Exception as e:
        log_crash("Error in main recognition loop", module_name, e)
    finally:
        logger.info("Cleaning up speech recognition module", module_name)
        try:
            recognizer.cleanup()
            logger.info("Recognizer cleanup completed", module_name)
        except Exception as e:
            log_error(f"Error during recognizer cleanup: {e}", module_name, e)
        
        try:
            client.stop()
            logger.info("Client stopped successfully", module_name)
        except Exception as e:
            log_error(f"Error during client cleanup: {e}", module_name, e)


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
