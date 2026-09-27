@echo off
REM ============================================================
REM  BiLim AI - one-click start (backend + frontend + browser)
REM ============================================================

REM Project folder without trailing backslash
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

REM Start PostgreSQL service if it is not running
sc query postgresql-x64-17 | find "RUNNING" >nul || net start postgresql-x64-17 >nul 2>&1

REM Backend - explicit working dir + full path to exe
start "BiLim Backend" /min /D "%ROOT%\backend" cmd /k "%ROOT%\backend\main.exe"

REM Frontend - explicit working dir
start "BiLim Frontend" /min /D "%ROOT%" cmd /k npm run dev

REM Wait for Vite to come up, then open the browser
ping -n 9 127.0.0.1 >nul
start "" "http://localhost:5173"

exit
