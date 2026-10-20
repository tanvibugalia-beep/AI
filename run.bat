@echo off
title Daksh Intelligence - PC AI Assistant
color 0b

echo ================================================================
echo       DAKSH INTELLIGENCE - PERSONAL PC AI COPILOT
echo                Python Workstation Edition
echo ================================================================
echo.

:: Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on your system PATH!
    echo Please install Python 3.10+ from python.org and check "Add Python to PATH".
    pause
    exit /b 1
)

echo [*] Checking dependencies...
python -c "import streamlit, pydantic" >nul 2>nul
if %errorlevel% neq 0 (
    echo [*] Installing required Python libraries from requirements.txt...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [!] pip install reported a warning, proceeding to launch...
    )
)

echo.
echo [*] Launching Daksh Intelligence Workstation App...
echo [*] The app will open in your default browser at http://localhost:3000
echo.
python server.py

pause

