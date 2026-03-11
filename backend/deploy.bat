@echo off
REM Script de despliegue para Windows
REM Este script configura e inicia el servidor en producción

echo 🚀 Iniciando despliegue del backend de likes...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instálalo primero.
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor instálalo primero.
    pause
    exit /b 1
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install --production

REM Crear directorio de datos si no existe
if not exist "data" mkdir data

REM Establecer variables de entorno
set NODE_ENV=production
set PORT=3001
set HOST=0.0.0.0

REM Iniciar servidor
echo 🌐 Iniciando servidor en producción...
echo 📍 El servidor estará disponible en: http://0.0.0.0:3001
echo 🔗 API endpoints disponibles:
echo    GET    /api/likes - Obtener todos los likes
echo    GET    /api/likes/:imageId - Obtener likes de una imagen
echo    POST   /api/likes/:imageId - Agregar like
echo    DELETE /api/likes/:imageId - Quitar like
echo.

REM Iniciar con Node.js
echo 🔄 Iniciando con Node.js...
start /B node server.js > server.log 2>&1

echo.
echo 🎉 Despliegue completado!
echo 📊 Para monitorear el servidor, revisa los logs en server.log
echo ⚠️  Mantén esta ventana abierta o usa un gestor de procesos como PM2
pause
