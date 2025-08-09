@echo off

set PY_ACTIVATE_PATH=%cd%\src\assistant\.venv\Scripts\activate
set PY_MAIN_PATH=%cd%\src\assistant\main.py
set PYTHON_PATH=%cd%\src\assistant\.venv\Scripts\python.exe

call %PY_ACTIVATE_PATH%

if "%1"=="--tr" (
    %PYTHON_PATH% %PY_MAIN_PATH% --train
) else if "%1"=="--dev" (
    npm run dev
)   