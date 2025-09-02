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

## 🧩 Схема взаимодействий
<img src='public/images/VoiceAssistant.png'>

## 🧩 Интерфейс

### Стадия инициализации:
<img src='public/images/init.png'>

### Стадия ожидания
<img src='public/images/waiting.png'>


## 🧩 Внутренняя Архитектура
```
┌──────────────────────────────────┐
│            Electron              │
│  (main.js)                       │
│  • Окно приложения               │
│  • WebSocketServer (ws://:8765)  │
│  • Запуск Python процесса        │
└──────────────┬───────────────────┘
               │ JSON события
┌──────────────▼───────────────────┐
│  Renderer (React + Vite)         │
│  • SocketClient.ts (reconnect)   │
│  • UI / визуализация / логи      │
└──────────────┬───────────────────┘
               │ WS сообщения
┌──────────────▼─────────────────────────────────────────────────────────┐
│                    Python (Оркестратор + Модули)                       │
│  ┌───────────────────────────┐          Shared                         │
│  │ Orchestrator (modules/    │          • clients/ModuleClient.py      │
│  │ master.py)                │          • enums/Events.py              │
│  │  • Загрузка manifest'ов   │          • paths.py                     │
│  │  • Старт/стоп модулей     │                                         │
│  │  • Реестр сервисов        │──────────┬                              │
│  └───────────────┬───────────┘          │                              │
│                  │ запускает            │                              │
│  ┌───────────────▼───────────┐     ┌────▼─────────────────────────┐    │
│  │ speech_rec_module         │     │ processing_module            │    │
│  │  • main.py                │     │  • main.py                   │    │
│  │  • Recognizer (Vosk)      │     │  • Executor                  │    │
│  │  • SpeechRecognitionSvc   │     │  • AiService, Tools          │    │
│  └───────────────────────────┘     └──────────────────────────────┘    │
│  Каждый модуль = WS‑клиент (ModuleClient: heartbeat, reconnect, route) │
└────────────────────────────────────────────────────────────────────────┘
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
```bash
git clone https://github.com/KiyotakkkkA/VoiceAssistant.git
cd ElectronApp
# Windows
.\start --install
```

(На Windows для PyAudio может потребоваться предварительно установить wheel: см. https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio)

### 2. Модели Vosk
В случае отсутствия модели распознавания речи - вам будет предложено автоматически скачать
её (Блок в левой части главного экрана), однако, вы можете сделать это и вручную

Скачайте нужную русскую модель (например `vosk-model-small-ru-0.22`) и распакуйте в:
```
resources/models/voice_small
```

После этого в файле
```
resources/global/config.json
```
установите название модели соответствующее её относительному пути для папки resources/models

## ▶️ Запуск (режим разработки)
Одной командой (запустит Vite, tsc watcher и Electron):
```bash
# Windows
.\start --dev
```
Electron автоматически поднимет WebSocket сервер и процесс Python.

## 🏗️ Продакшн сборка
```bash
npm run build
npm run start:prod
```
`vite build` соберёт фронтенд в `dist/`, Electron загрузит локальный файл.

# Функционал

## Визуальный
1. Смена цветовых тем

## Работа с файловой системой
1. Создание и редактирование заметок (.txt файлы по правилам Markdown)

## Инструменты голосового ассистента
1. Поиск информации в интернете
2. Сбор и вывод информации о сети и сетевых интерфейсах ПК
3. Сбор и вывод информации о характеристиках ПК
4. Управления заметками
5. Сбор и вывод информации Github пользователя (при ссылки и PAT в разделе "Учётные записи")
6. Управление Docker средой (запуск, остановка контейнеров, просмотр информации о контейнерах и образах)

# Доступ к AI
Осуществляется посредством интеграции сервиса Ollama (на данные момент через API Ключ)

Получить его можно на сайте ollama.com

НАСТОЯТЕЛЬНО РЕКОМЕНДУЮ ИСПОЛЬЗОВАТЬ МОДЕЛЬ <b>gpt-oss:20b</b>