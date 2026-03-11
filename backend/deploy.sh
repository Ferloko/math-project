#!/bin/bash

# Script de despliegue para el backend de likes
# Este script configura e inicia el servidor en producción

echo "🚀 Iniciando despliegue del backend de likes..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instálalo primero."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# Crear directorio de datos si no existe
mkdir -p data

# Establecer variables de entorno
export NODE_ENV=production
export PORT=3001
export HOST=0.0.0.0

# Iniciar servidor
echo "🌐 Iniciando servidor en producción..."
echo "📍 El servidor estará disponible en: http://0.0.0.0:3001"
echo "🔗 API endpoints disponibles:"
echo "   GET    /api/likes - Obtener todos los likes"
echo "   GET    /api/likes/:imageId - Obtener likes de una imagen"
echo "   POST   /api/likes/:imageId - Agregar like"
echo "   DELETE /api/likes/:imageId - Quitar like"
echo ""

# Iniciar con PM2 si está disponible, sino con node directamente
if command -v pm2 &> /dev/null; then
    echo "🔄 Iniciando con PM2..."
    pm2 start server.js --name "math-likes-api" --env production
    pm2 save
    pm2 startup
    echo "✅ Servidor iniciado con PM2"
else
    echo "🔄 Iniciando con Node.js..."
    nohup node server.js > server.log 2>&1 &
    echo $! > server.pid
    echo "✅ Servidor iniciado en segundo plano"
    echo "📋 PID guardado en server.pid"
fi

echo ""
echo "🎉 Despliegue completado!"
echo "📊 Para monitorear el servidor, revisa los logs en server.log"
