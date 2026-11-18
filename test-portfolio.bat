@echo off
title Rahul A. - Test Suite
color 0A
echo ========================================================
echo   Running Automated Test Suite
echo ========================================================
echo.
cd /d "%~dp0"
npm test
pause

