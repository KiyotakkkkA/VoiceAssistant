@echo off

:: For valid russian characters you need to convert it to CP 866 in editor
chcp 866 >nul

for /F %%A in ('echo prompt $E ^| cmd') do set "ESC=%%A"

set "BASE_DIR=%cd%"
set "PY_BASE_DIR=%BASE_DIR%\modules"

set "PY_VENV_PATH=%PY_BASE_DIR%\.venv"
set "PY_ACTIVATE_PATH=%PY_VENV_PATH%\Scripts\activate"
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

set "IS_VENV_INSTALLED=%RED%���%RESET%"
set "IS_NODE_MODULES_INSTALLED=%RED%���%RESET%"

if exist "%PY_VENV_PATH%" (
    set "IS_VENV_INSTALLED=%GREEN%��%RESET%"
)
if exist "%NODE_MODULES_PATH%" (
    set "IS_NODE_MODULES_INSTALLED=%GREEN%��%RESET%"
)

if exist "%PY_VENV_PATH%" (
    call "%PY_ACTIVATE_PATH%"
)

if "%~1"=="" (
    echo %YELLOW%=========================================%RESET%
    echo %BRIGHT_GREEN%        CLI ����ᮢ��� ����⥭�        %RESET%
    echo %YELLOW%=========================================%RESET%
    echo.
    echo %BRIGHT_YELLOW% ����� ��⠭����: %RESET%
    echo   ����㠫쭮� ���㦥���:%RESET% %IS_VENV_INSTALLED%
    echo   Node.js ���㫨:%RESET%        %IS_NODE_MODULES_INSTALLED%
    echo.
    echo %BRIGHT_YELLOW% ���᮪ ������: %RESET%
    echo %BLUE%  --dev      %RESET%- ����� ०��� ࠧࠡ�⪨
    echo %BLUE%  --install  %RESET%- ��⠭���� ����ᨬ��⥩ Python � Node.js
    echo %BLUE%  --build    %RESET%- ���ઠ �ਫ������
    echo.
    exit /b
)

if "%1"=="--dev" (
    npm run dev
) else if "%1"=="--build" (
    npm run dist:dir
) else if "%1"=="--install" (
    echo %BRIGHT_YELLOW%[��� 1]%RESET% �������� ����㠫쭮�� ���㦥���...%RESET%
    python -m venv "%PY_VENV_PATH%"
    
    if exist "%PY_ACTIVATE_PATH%" (
        call "%PY_ACTIVATE_PATH%"
        echo %GREEN%[�����]%RESET% ����㠫쭮� ���㦥��� ��⨢�஢���%RESET%
    ) else (
        echo %RED%[������]%RESET% �� 㤠���� ᮧ���� ����㠫쭮� ���㦥���%RESET%
        exit /b 1
    )

    echo %BRIGHT_YELLOW%[��� 2]%RESET% ��⠭���� Python ����ᨬ��⥩...%RESET%
    pip install -r "%PY_BASE_DIR%\requirements.txt"

    echo %BRIGHT_YELLOW%[��� 3]%RESET% ��⠭���� Node.js ����ᨬ��⥩...%RESET%
    npm install
    
    echo %GREEN%[�����]%RESET% �� ����ᨬ��� �ᯥ譮 ��⠭������!%RESET%
    
) else (
    echo %BRIGHT_RED%[������]%RESET% �������⭠� ������� "%1"
    echo �ᯮ���� --tr, --dev ��� --install
)