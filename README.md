# Desktop Voice Assistant

<div id="badges">

<img src="https://img.shields.io/badge/Electron-47848F?logo=electron&logoColor=white" alt="Electron" />
<img src="https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/JavaScript-3178C6?logo=javascript&logoColor=white" alt="JavaScript" />
<img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/TailwindCSS-0EA5E9?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
<img src="https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=white" alt="Node.js" />

<img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/Vosk-ASR-orange" alt="Vosk" />
<img src="https://img.shields.io/badge/PyAudio-FFB000" alt="PyAudio" />

<img src="https://img.shields.io/badge/WebSocket-ws-3B82F6" alt="WebSocket" />
<img src="https://img.shields.io/badge/dotenv-ECF0F1" alt="dotenv" />
<img src="https://img.shields.io/badge/concurrently-444?logo=npm&logoColor=fff" alt="concurrently" />
<img src="https://img.shields.io/badge/cross--env-2F855A" alt="cross-env" />

<img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white" alt="ESLint" />
<img src="https://img.shields.io/badge/WS_Server-ws%208.x-0A84FF" alt="ws" />

<img src="https://img.shields.io/badge/License-MIT-green" alt="License: MIT" />

</div>

Интерактивный голосовой ассистент: фронтенд на Electron + React + TypeScript + Tailwind, бэкенд-логика и распознавание речи на Python (Vosk). Между частями — WebSockets.

<img src='public/images/preview.png'>

## 🧩 Архитектура
```
┌──────────────────────────────────┐
│            Electron              │
│  (main.js)                       │
│  • Запуск окна                   │
│  • Запуск Python процесса        │
│  • WebSocketServer (ws://:8765)  │
└──────────────┬───────────────────┘
               │ JSON события
┌──────────────▼───────────────────┐
│  Renderer (React + Vite)         │
│  • SocketClient.ts (reconnect)   │
│  • Атомарный UI + визуализация   │
│  • Лог, состояния, матрица       │
└──────────────┬───────────────────┘
               │ ws сообщения
┌──────────────▼───────────────────┐
│   Python (assistant/)            │
│   • main.py                      │
│   • SocketClient.py (HB, echo)   │
│   • SpeechRecognitionService     │
│   • Assistant (orchestrator)     │
└──────────────────────────────────┘
```

## 🚀 Возможности
- Автозапуск и завершение Python процесса из Electron.
- Двусторонний канал WebSocket.
- Vosk оффлайн распознавание.
- Atomic Design (atoms / molecules / organisms / templates).

## 🛠️ Стек
| Слой | Технологии |
|------|------------|
| Desktop оболочка | Electron |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Realtime | ws (Node), websocket-client (Python) |
| Речь | Vosk, PyAudio |
| Прочее | dotenv, concurrently, cross-env |

## 📦 Установка
### 1. Клонирование
```bash
git clone ...
cd ElectronApp
```

### 2. Node / npm
Требуется Node 18+.
```bash
npm install
```

### 3. Python окружение
Перейти в папку ассистента и создать venv:
```bash
cd src/assistant
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
# Linux / macOS
source .venv/bin/activate
pip install -r requirements.txt
```
Базовые пакеты (если файла пока нет):
```
websocket-client
vosk
pyaudio
python-dotenv
colorama
```
(На Windows для PyAudio может потребоваться предварительно установить wheel: см. https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio)

### 4. Модели Vosk
Скачайте нужную русскую модель (например `vosk-model-small-ru-0.22`) и распакуйте в:
```
resources/models/voice_small
```
Проверь путь в `.env` (VOICE_RECOGNITION_MODEL_DIR_PATH).

## ▶️ Запуск (режим разработки)
Одной командой (запустит Vite, tsc watcher и Electron):
```bash
npm run dev
```
Electron автоматически поднимет WebSocket сервер и процесс Python.

Если нужно запустить только UI без Electron:
```bash
npm run dev:renderer
```

## 🏗️ Продакшн сборка
```bash
npm run build
npm run start:prod
```
`vite build` соберёт фронтенд в `dist/`, Electron загрузит локальный файл.

## 🔌 Протокол сообщений
Пример формата:
```jsonc
{
  "type": "wake" | "transcript" | "python_heartbeat" | "ui_message" | "python_shutdown" | "server_ack" | ...,
  "from": "python" | "ui" | "server",
  "payload": any
}
```
События:
- `server_welcome` – приветствие сервера при подключении.
- `server_ack` – подтверждение любого полученного сообщения.
- `python_heartbeat` – регулярный пинг от Python.
- `wake` – ассистент активирован (слово-пробудитель / начало речевого сегмента).
- `transcript` – финальная расшифровка фразы.
- `python_shutdown` – корректное завершение.
- `ui_message` – отправлено из интерфейса вручную.
