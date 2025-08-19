import os
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

    def handle_state_change(msg):
        new_state = msg.get('payload', {}).get('data', {}).get('additional', {}).get('mode_to')
        recognizer.current_state = new_state

    client.on(EventsTopic.ACTION_MODE_SET.value, handle_state_change)

    client.start(stop_event, block=False)

    for item in recognizer.run():
        if isinstance(item, dict):
            client.emit({'type': item.get('type'), 'topic': item.get('topic'), 'from': 'speech_rec_module', 'payload': item.get('payload')})


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
