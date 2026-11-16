@echo off
title Personal Portfolio - Local Wi-Fi Web Server
cd /d "%~dp0"
echo ========================================================
echo   Srey ArunRatha Portfolio - Local Wi-Fi Server
echo ========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if %errorlevel% neq 0 (
    echo.
    echo Server stopped with error.
    pause
)

