# Guía de Despliegue para Likes Globales

## 🌐 Opciones de Hosting para el Backend

### Opciones Gratuitas

#### 1. **Render** (Recomendado)
- **Costo**: Gratis con límites
- **Facilidad**: ⭐⭐⭐⭐⭐
- **Ventajas**: 
  - Soporte nativo para Node.js
  - Despliegue automático desde GitHub
  - SSL gratuito
  - Base de datos gratuita
- **Límites**: 750 horas/mes, se duerme después de 15min de inactividad
- **URL**: `https://render.com`

#### 2. **Railway**
- **Costo**: Gratis con límites
- **Facilidad**: ⭐⭐⭐⭐
- **Ventajas**: 
  - Despliegue fácil desde GitHub
  - Soporte para Node.js
  - $5 crédito mensual gratis
- **Límites**: 500 horas/mes
- **URL**: `https://railway.app`

#### 3. **Glitch**
- **Costo**: Gratis
- **Facilidad**: ⭐⭐⭐⭐⭐
- **Ventajas**: 
  - Editor online
  - Despliegue instantáneo
  - Colaboración en tiempo real
- **Límites**: 1000 horas/mes, se duerme después de 5min
- **URL**: `https://glitch.com`

#### 4. **Vercel**
- **Costo**: Gratis para frontend
- **Facilidad**: ⭐⭐⭐⭐⭐
- **Ventajas**: 
  - Excelente para frontend
  - Serverless functions para backend
  - CDN global
- **Limitaciones**: Requiere adaptar el backend a serverless
- **URL**: `https://vercel.com`

### Opciones de Pago (Recomendado para producción)

#### 1. **DigitalOcean**
- **Costo**: $4-6/mes
- **Facilidad**: ⭐⭐⭐
- **Ventajas**: 
  - Control total
  - IP dedicada
  - Alto rendimiento
- **URL**: `https://digitalocean.com`

#### 2. **Heroku**
- **Costo**: $5-7/mes
- **Facilidad**: ⭐⭐⭐⭐
- **Ventajas**: 
  - Fácil de usar
  - Despliegue automático
  - Confiable
- **URL**: `https://heroku.com`

#### 3. **AWS EC2**
- **Costo**: $3.50/mes (t2.micro)
- **Facilidad**: ⭐⭐
- **Ventajas**: 
  - Muy escalable
  - 1 año gratis
  - Industria estándar
- **URL**: `https://aws.amazon.com/ec2`

## 🚀 Instrucciones de Despliegue

### Opción 1: Render (Recomendado para empezar)

1. **Crear cuenta en Render**
   - Ve a https://render.com
   - Regístrate con GitHub

2. **Fork del repositorio**
   - Fork tu repositorio en GitHub
   - Asegúrate que el backend esté en la carpeta `/backend`

3. **Crear Web Service**
   - Dashboard → New + → Web Service
   - Conecta tu repositorio de GitHub
   - Configura:
     ```
     Build Command: cd backend && npm install
     Start Command: cd backend && node server.js
     ```

4. **Variables de entorno**
   - Agrega las variables necesarias:
     ```
     NODE_ENV=production
     PORT=3001
     ```

5. **Despliegue automático**
   - Render desplegará automáticamente
   - Obtendrás una URL como: `https://tu-app.onrender.com`

### Opción 2: Railway

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Regístrate con GitHub

2. **Nuevo proyecto**
   - Dashboard → New Project → Deploy from GitHub repo
   - Selecciona tu repositorio

3. **Configuración**
   - Railway detectará automáticamente Node.js
   - Configura el directorio de trabajo como `/backend`

4. **Variables de entorno**
   - Agrega las variables necesarias en la sección "Variables"

### Opción 3: Servidor Propio (VPS)

1. **Contratar VPS**
   - DigitalOcean, Vultr, Linode, etc.
   - Ubuntu 20.04 o superior recomendado

2. **Configurar servidor**
   ```bash
   # Actualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Instalar PM2
   sudo npm install -g pm2
   ```

3. **Subir archivos**
   ```bash
   # Clonar repositorio
   git clone tu-repositorio.git
   cd tu-repositorio/backend
   
   # Instalar dependencias
   npm install --production
   ```

4. **Iniciar con PM2**
   ```bash
   pm2 start server.js --name math-likes-api
   pm2 save
   pm2 startup
   ```

## 🔧 Configuración del Frontend

Una vez que tengas la URL de tu backend, actualiza el frontend:

### Método 1: Configuración automática (ya implementado)
El frontend detectará automáticamente la URL del backend basándose en el dominio actual.

### Método 2: Configuración manual
Si necesitas especificar una URL diferente:

```javascript
// En likes-manager.js
constructor() {
    this.backendUrl = 'https://tu-backend-url.onrender.com/api';
    // ... resto del código
}
```

## 📋 Checklist de Despliegue

- [ ] Backend desplegado en servidor real
- [ ] Base de datos configurada (archivo likes.json)
- [ ] CORS configurado para permitir tu dominio
- [ ] Frontend actualizado con URL del backend
- [ ] HTTPS configurado (SSL)
- [ ] Probar que los likes funcionen entre diferentes usuarios
- [ ] Configurar monitoreo y logs

## 🧪 Pruebas

1. **Abre la galería en dos navegadores diferentes**
2. **Da like en una imagen en el primer navegador**
3. **Espera hasta 30 segundos**
4. **Verifica que el like aparezca en el segundo navegador**

## 🔄 Mantenimiento

- **Monitorear logs**: Revisa server.log regularmente
- **Backups**: Haz backup del archivo likes.json
- **Actualizaciones**: Mantén Node.js actualizado
- **Seguridad**: Configura firewall y actualizaciones de seguridad

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que el puerto 3001 esté abierto
3. Confirma que CORS esté configurado correctamente
4. Prueba la API directamente: `https://tu-backend.com/api/likes`
