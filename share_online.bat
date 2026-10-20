@echo off
title Share Daksh Intelligence Online
color 0a

echo ================================================================
echo     MAKING DAKSH INTELLIGENCE ACCESSIBLE ON THE INTERNET
echo ================================================================
echo.
echo [*] Checking that server.py is running on port 3000...
echo [*] Generating public HTTPS link...
echo.

python share_online.py

pause
