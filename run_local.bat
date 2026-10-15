@echo off
title GENEVA LIBRARY - FacePal Local Server (Port 7777)
echo =========================================================================
echo   📚 GENEVA LIBRARY مكتبة جنيفا | Powered by FacePal Biometric Checkout
echo   Running Local FastAPI Server on Port 7777
echo =========================================================================
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 7777 --reload
pause
