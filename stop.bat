@echo off
REM Stop local BiLim server (backend + frontend)
echo Stopping BiLim...

REM Backend (Go)
taskkill /F /IM main.exe >nul 2>&1

REM Frontend / windows by title
taskkill /F /FI "WINDOWTITLE eq BiLim Frontend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq BiLim Backend*" >nul 2>&1

echo Done. Server stopped.
ping -n 2 127.0.0.1 >nul
exit
