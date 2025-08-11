import sys
import signal
import time
import os
import argparse
from utils import SocketClient
from Assistant import Assistant
from paths import path_resolver

running = True

parser = argparse.ArgumentParser(description="Голосовой ассистент")
parser.add_argument("--train", action="store_true", help="Обучить модель")
args = parser.parse_args()

assistant = Assistant(
    name=os.getenv('ASSISTANT_NAME', 'Ассистент').strip('"'),
    VOICE_RECOGNITION_MODEL_DIR_PATH=path_resolver['voice_model_path'],
    TEXT_CLASSIFICATION_DATASETS_DIR_PATH=path_resolver['cl_datasets_path'],
    TEXT_CLASSIFICATION_MODEL_DIR_PATH=path_resolver['cl_model_path'],
    prediction_threshold=float(os.getenv('TEXT_CLASSIFICATION_PREDICTION_THRESHOLD', '0.85'))
)

def handle_signal(signum, frame):
	global running
	running = False

signal.signal(signal.SIGINT, handle_signal)

def setup_signals():
	signal.signal(signal.SIGINT, handle_signal)
	if hasattr(signal, 'SIGTERM'):
		signal.signal(signal.SIGTERM, handle_signal)


def main():
	client = SocketClient(log=True, auto_heartbeat=True, heartbeat_interval=5, echo_ui=True)

	setup_signals()

	def on_msg(msg):
		pass

	client.on_message(on_msg)
	client.connect()

	def speech_loop():
		for item in assistant.run():
			if not running:
				break
			if isinstance(item, dict):
				if item.get('event') == 'wake':
					client.send({'type': 'wake', 'from': 'python', 'payload': { 'name': assistant.name }})
				elif item.get('event') == 'transcript':
					client.send({'type': 'transcript', 'from': 'python', 'payload': item.get('text')})
				else:
					client.send({"type": item.get('event', 'unknown'), "from": "python", "payload": item})

	import threading
	t = threading.Thread(target=speech_loop, daemon=True)
	t.start()

	try:
		while running:
			time.sleep(0.3)
	finally:
		client.send({'type': 'python_shutdown', 'from': 'python', 'payload': 'stopping'})
		client.close()
	return 0


if __name__ == '__main__':
	if args.train:
		sys.exit(assistant.train())
	else:
		sys.exit(main())
