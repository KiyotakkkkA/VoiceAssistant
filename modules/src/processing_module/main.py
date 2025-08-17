import os
from clients import ModuleClient
from src.processing_module.services import Excecutor
from paths import path_resolver
from enums.Events import EventsType, EventsTopic

executor = Excecutor(
    TEXT_CLASSIFICATION_DATASETS_DIR_PATH=path_resolver['cl_datasets_path'],
    TEXT_CLASSIFICATION_MODEL_DIR_PATH=path_resolver['cl_model_path'],
    prediction_threshold=float(os.getenv('TEXT_CLASSIFICATION_PREDICTION_THRESHOLD', '0.85'))
)

def run(stop_event):

    client = ModuleClient(
        service_name='processing_module',
        manifest_file='manifest.json',
        subscribes=[EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value],
        heartbeat_interval=5.0,
        max_reconnect_attempts=10,
        log_prefix='processing'
    )

    def handle_raw_text(msg):
        for out in executor.run(msg):
            client.emit({
                'type': EventsType.SERVICE_ACTION.value,
                'topic': out['event'] if out.get("event") else EventsTopic.ACTION_TRANSCRIPT.value,
                'payload': out,
                'from': 'processing_module'
            })

    client.on(EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value, handle_raw_text)

    client.start(stop_event, block=True)


ORC_STOP = globals().get('ORC_STOP')
if ORC_STOP is None:
    import threading
    ORC_STOP = threading.Event()
run(ORC_STOP)
