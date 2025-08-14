@echo off

:: For valid russian characters you need to convert it to CP 866 in editor
chcp 866 >nul

for /F %%A in ('echo prompt $E ^| cmd') do set "ESC=%%A"

set "BASE_DIR=%cd%"
set "PY_BASE_DIR=%BASE_DIR%\modules"

set "PY_VENV_PATH=%PY_BASE_DIR%\.venv"
set "PY_ACTIVATE_PATH=%PY_VENV_PATH%\Scripts\activate"
set "PY_TRAINER_PATH=%PY_BASE_DIR%\training.py"
set "NODE_MODULES_PATH=%BASE_DIR%\node_modules"

set "BLACK=%ESC%[30m"
set "RED=%ESC%[31m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[38;5;226m"
set "BLUE=%ESC%[34m"
set "MAGENTA=%ESC%[35m"
set "CYAN=%ESC%[36m"
set "WHITE=%ESC%[37m"

set "BRIGHT_BLACK=%ESC%[90m"
set "BRIGHT_RED=%ESC%[91m"
set "BRIGHT_GREEN=%ESC%[92m"
set "BRIGHT_YELLOW=%ESC%[93m"
set "BRIGHT_BLUE=%ESC%[94m"
set "BRIGHT_MAGENTA=%ESC%[95m"
set "BRIGHT_CYAN=%ESC%[96m"
set "BRIGHT_WHITE=%ESC%[97m"

set "RESET=%ESC%[0m"

set "IS_VENV_INSTALLED=%RED%НЕТ%RESET%"
set "IS_NODE_MODULES_INSTALLED=%RED%НЕТ%RESET%"

if exist "%PY_VENV_PATH%" (
    set "IS_VENV_INSTALLED=%GREEN%ДА%RESET%"
)
if exist "%NODE_MODULES_PATH%" (
    set "IS_NODE_MODULES_INSTALLED=%GREEN%ДА%RESET%"
)

if exist "%PY_VENV_PATH%" (
    call "%PY_ACTIVATE_PATH%"
)

if "%~1"=="" (
    echo %YELLOW%=========================================%RESET%
    echo %BRIGHT_GREEN%        CLI Голосового Ассистента        %RESET%
    echo %YELLOW%=========================================%RESET%
    echo.
    echo %BRIGHT_YELLOW% Статус установки: %RESET%
    echo   Виртуальное окружение:%RESET% %IS_VENV_INSTALLED%
    echo   Node.js модули:%RESET%        %IS_NODE_MODULES_INSTALLED%
    echo.
    echo %BRIGHT_YELLOW% Список команд: %RESET%
    echo %BLUE%  --tr       %RESET%- Запуск режима обучения
    echo %BLUE%  --dev      %RESET%- Запуск режима разработки
    echo %BLUE%  --install  %RESET%- Установка зависимостей Python и Node.js
    echo.
    exit /b
)

if "%1"=="--tr" (
    python "%PY_TRAINER_PATH%"
) else if "%1"=="--dev" (
    npm run dev
) else if "%1"=="--install" (
    echo %BRIGHT_YELLOW%[ШАГ 1]%RESET% Создание виртуального окружения...%RESET%
    python -m venv "%PY_VENV_PATH%"
    
    if exist "%PY_ACTIVATE_PATH%" (
        call "%PY_ACTIVATE_PATH%"
        echo %GREEN%[УСПЕХ]%RESET% Виртуальное окружение активировано%RESET%
    ) else (
        echo %RED%[ОШИБКА]%RESET% Не удалось создать виртуальное окружение%RESET%
        exit /b 1
    )

    echo %BRIGHT_YELLOW%[ШАГ 2]%RESET% Установка Python зависимостей...%RESET%
    pip install -r "%PY_BASE_DIR%\requirements.txt"

    echo %BRIGHT_YELLOW%[ШАГ 3]%RESET% Установка Node.js зависимостей...%RESET%
    npm install
    
    echo %GREEN%[УСПЕХ]%RESET% Все зависимости успешно установлены!%RESET%
    
) else (
    echo %BRIGHT_RED%[ОШИБКА]%RESET% Неизвестная команда "%1"
    echo Используйте --tr, --dev или --install
)