import os
import time
from clients import ModuleClient
from src.speech_rec_module.services import Recognizer
from paths import path_resolver
from enums.Events import EventsTopic

recognizer = Recognizer(
    name=os.getenv('ASSISTANT_NAME', 'Ассистент').strip('"'),
    VOICE_RECOGNITION_MODEL_DIR_PATH=path_resolver['voice_model_path'],
)

def run(stop_event):
    client = ModuleClient(
        service_name='speech_rec_module',
        manifest_file='manifest.json',
        subscribes=[],
        heartbeat_interval=5.0,
        max_reconnect_attempts=10,
        log_prefix='speech'
    )

    try:
        client.start(stop_event, block=False)
        
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
                    print(f"[speech_rec_module] error emitting message: {e}")
                    if stop_event.is_set():
                        break
        
    except Exception as e:
        print(f"[speech_rec_module] error in main loop: {e}")
    finally:
        try:
            recognizer.cleanup()
        except Exception as e:
            print(f"[speech_rec_module] error during recognizer cleanup: {e}")
        
        try:
            client.stop()
        except Exception as e:
            print(f"[speech_rec_module] error during client cleanup: {e}")


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
