# 🚀 Sistema de Likes Orientado a Servidor - Guía de Instalación

## 📋 Resumen

Sistema de likes **orientado a servidor** para galería de imágenes con:
- ✅ **Backend Node.js** como fuente principal de datos
- ✅ **Mínimo uso de localStorage** (solo para estado de usuario)
- ✅ **Sincronización real-time** con servidor
- ✅ **Soporte offline** con cola de sincronización
- ✅ **Likes individuales** por imagen
- ✅ **Persistencia centralizada** en servidor

## 🎯 Filosofía de Diseño

Este sistema está diseñado para **servidores web** donde:
- **El backend es la fuente de verdad** (single source of truth)
- **LocalStorage es solo fallback** para desconexiones
- **Todas las operaciones** intentan comunicarse con el servidor primero
- **Los datos persisten** en el servidor, no en el cliente

## 🔧 Instalación del Backend

1. **Navegar a la carpeta del backend:**
```bash
cd backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar el servidor:**
```bash
npm start
```

El servidor se iniciará en `http://localhost:3001`

## 🌐 Configuración del Frontend

1. **El frontend ya está configurado** para comunicación con backend

2. **Archivos involucrados:**
   - `likes-manager.js` - Sistema cliente optimizado para servidor
   - `script.js` - Funcionalidades con monitoreo de conexión
   - `galeria.html` - Galería con botones de like

## 📡 API del Servidor

### **Endpoints Principales:**
- `GET /api/likes` - Obtener todos los likes del servidor
- `GET /api/likes/:imageId` - Obtener likes de una imagen específica
- `POST /api/likes/:imageId` - Agregar un like al servidor
- `DELETE /api/likes/:imageId` - Quitar un like del servidor

### **Flujo de Comunicación:**
1. **Cliente solicita** → Siempre intenta backend primero
2. **Servidor responde** → Datos actualizados y persistidos
3. **Cliente actualiza** → UI refleja cambios del servidor
4. **Fallback offline** → Solo si no hay conexión

## 💾 Uso de LocalStorage (Mínimo)

### **Solo para:**
- `userLikes` - Estado de like del usuario actual (me gusta/no me gusta)
- `fallbackLikes` - Datos temporales solo si el servidor está caído

### **No se usa para:**
- Almacenamiento principal de datos
- Contadores globales de likes
- Persistencia a largo plazo

## 🔄 Características Orientadas a Servidor

### **Comunicación Constante:**
- **Sincronización cada 30 segundos** con el servidor
- **Actualización inmediata** al reestablecer conexión
- **Validación server-side** de todas las operaciones

### **Manejo de Conexión:**
- **Detección automática** de online/offline
- **Cola de sincronización** para operaciones offline
- **Indicadores visuales** del estado de conexión

### **Resiliencia:**
- **Reintentos automáticos** en fallas de conexión
- **Estado optimista** para feedback instantáneo
- **Rollback visual** si las operaciones fallan

## 🛠️ Estructura para Producción

```
Math/
├── backend/                    # Servidor Node.js
│   ├── package.json            # Dependencias
│   ├── server.js              # API REST
│   ├── data/
│   │   └── likes.json        # Base de datos centralizada
│   └── README.md             # Docs del backend
├── likes-manager.js           # Cliente optimizado para servidor
├── script.js                 # Funcionalidades con monitoreo
├── galeria.html              # Galería conectada a backend
├── styles.css                # Estilos
└── [imágenes].jpg           # Recursos de la galería
```

## 🚀 Despliegue en Servidor Web

### **Producción:**
1. **Subir archivos** del backend al servidor
2. **Instalar dependencias** con `npm install`
3. **Iniciar servicio** con `npm start` o PM2
4. **Configurar dominio** para apuntar al backend
5. **Actualizar URL** en `likes-manager.js` si es necesario

### **Configuración de Producción:**
```javascript
// En likes-manager.js cambiar la URL
this.backendUrl = 'https://tu-dominio.com/api';
```

## 📱 Flujo de Usuario

1. **Carga inicial:** Frontend solicita todos los likes al servidor
2. **Interacción:** Cada like se envía inmediatamente al servidor
3. **Confirmación:** UI se actualiza con respuesta del servidor
4. **Offline:** Las acciones se encolan y sincronizan después
5. **Sincronización:** Periódica y al reestablecer conexión

## 🔧 Personalización

### **Cambiar URL del Servidor:**
```javascript
// likes-manager.js línea 4
this.backendUrl = 'https://tu-servidor.com/api';
```

### **Ajustar Intervalo de Sincronización:**
```javascript
// script.js línea 64
}, 30000); // 30 segundos, ajustar según necesites
```

## 🚨 Solución de Problemas

### **Servidor no responde:**
- Verificar que el backend esté corriendo
- Comprobar CORS configuration
- Revisar logs del servidor

### **Likes no se sincronizan:**
1. Verificar conexión a internet
2. Revisar consola para errores de red
3. Limpiar cola: `likesManager.clearSyncQueue()`

### **Conexión intermitente:**
- El sistema maneja automáticamente reconexiones
- Los cambios se sincronizan cuando vuelva la conexión
- Los indicadores muestran estado actual

## ✅ Ventajas del Enfoque Orientado a Servidor

- ✅ **Datos centralizados** y consistentes
- ✅ **Multiusuario real** sin conflictos
- ✅ **Persistencia garantizada** en servidor
- ✅ **Escalabilidad** para múltiples usuarios
- ✅ **Seguridad** de datos en backend
- ✅ **Analytics** posibles desde servidor

## 🎯 Listo para Producción

El sistema está optimizado para **despliegue en servidores web** con comunicación constante entre cliente y servidor, uso mínimo de localStorage y manejo robusto de conexiones.
