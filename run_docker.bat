@echo off
title GENEVA LIBRARY - Powered by FacePal (Docker Port 7777)
echo =========================================================================
echo   📚 GENEVA LIBRARY مكتبة جنيفا | Powered by FacePal Biometric Checkout
echo   Running inside Single Docker Container on Port 7777
echo =========================================================================

REM Check Docker availability
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in system PATH.
    echo Please install Docker Desktop or run run_local.bat instead.
    pause
    exit /b 1
)

echo.
echo [1/3] Stopping any previous container instance...
docker stop geneva_facepal_app juthoor_facepal_app >nul 2>&1
docker rm geneva_facepal_app juthoor_facepal_app >nul 2>&1

echo.
echo [2/3] Building GENEVA LIBRARY FacePal Docker Image...
docker build -t geneva-facepal:latest .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker build failed.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Container on http://localhost:7777 with persistent Data/ folder...
docker run -d --name geneva_facepal_app -p 7777:7777 -v "%cd%\Data:/app/Data" geneva-facepal:latest

echo.
echo =========================================================================
echo   SUCCESS! GENEVA LIBRARY FacePal is running on:
echo   --^> http://localhost:7777
echo   Data is persistently stored in: %cd%\Data
echo =========================================================================
echo.
timeout /t 3 >nul
start http://localhost:7777
echo Container logs (Press Ctrl+C to detach):
docker logs -f geneva_facepal_app
