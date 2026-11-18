@echo off
title Rahul A. - Full Stack Portfolio Server
color 0B
echo ========================================================
echo   Launching Rahul A. - Full Stack Portfolio Engine
echo ========================================================
echo.
cd /d "%~dp0"
echo Starting Node.js / Express Server on port 5000...
start "" "http://localhost:5000"
npm start
pause

