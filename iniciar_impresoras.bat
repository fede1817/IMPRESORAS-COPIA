@echo off
echo Iniciando servidor backend...
start /min cmd /k "cd backend && npm start"

timeout /t 3

echo Iniciando interfaz React...
start /min cmd /k "call set BROWSER=none && call set PORT=3000 && call npm start"

exit