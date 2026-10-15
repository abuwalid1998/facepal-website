@echo off
setlocal
set PYTHONUNBUFFERED=1
cd /d "%~dp0"
title GENEVA LIBRARY - FacePal Local Launcher

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    python launch.py
    if %ERRORLEVEL% neq 0 pause
    exit /b %ERRORLEVEL%
)

where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    py -3 launch.py
    if %ERRORLEVEL% neq 0 pause
    exit /b %ERRORLEVEL%
)

for %%P in (
    "%LocalAppData%\Programs\Python\Python313\python.exe"
    "%LocalAppData%\Programs\Python\Python312\python.exe"
    "%LocalAppData%\Programs\Python\Python311\python.exe"
    "%LocalAppData%\Programs\Python\Python310\python.exe"
    "%ProgramFiles%\Python313\python.exe"
    "%ProgramFiles%\Python312\python.exe"
    "%ProgramFiles%\Python311\python.exe"
    "%ProgramFiles%\Python310\python.exe"
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
    "C:\Python310\python.exe"
) do (
    if exist "%%~P" (
        "%%~P" launch.py
        if %ERRORLEVEL% neq 0 pause
        exit /b %ERRORLEVEL%
    )
)

echo ===============================================================================
echo   GENEVA LIBRARY - FacePal Biometric Checkout Launcher
echo ===============================================================================
echo.
echo [ERROR] Python 3 was not detected on this system.
echo Python 3.10 or newer is required to run the local AI models.
echo.
echo Opening the official Python download page: https://www.python.org/downloads/
start https://www.python.org/downloads/
echo.
echo Please install Python (be sure to check "Add python.exe to PATH") and run again.
echo.
pause
exit /b 1
