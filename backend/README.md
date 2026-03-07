# Backend para Sistema de Likes

Backend básico con Node.js y Express para gestionar el sistema de likes de la galería de imágenes.

## 🚀 Instalación

1. Navegar a la carpeta del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor:
```bash
npm start
```

Para desarrollo (con auto-reload):
```bash
npm run dev
```

## 📡 API Endpoints

### Obtener todos los likes
```
GET /api/likes
```
Retorna un objeto con todos los likes por imagen.

### Obtener likes de una imagen específica
```
GET /api/likes/:imageId
```
Retorna el número de likes para una imagen específica.

### Agregar un like
```
POST /api/likes/:imageId
```
Incrementa en 1 el contador de likes de la imagen.

### Quitar un like
```
DELETE /api/likes/:imageId
```
Decrementa en 1 el contador de likes de la imagen (no menor a 0).

### Resetear todos los likes (solo desarrollo)
```
DELETE /api/likes
```
Elimina todos los likes del sistema.

## 💾 Almacenamiento

Los likes se almacenan en el archivo `backend/data/likes.json` en formato:
```json
{
  "image1.jpg": 15,
  "image2.jpg": 8,
  "image3.jpg": 23
}
```

## 🔧 Configuración

- **Puerto**: 3001 (por defecto)
- **CORS**: Habilitado para todos los orígenes
- **Datos**: Almacenados localmente en archivo JSON

## 📝 Notas

- El servidor sirve archivos estáticos desde la carpeta raíz del proyecto
- Los datos persisten entre reinicios del servidor
- No se requiere base de datos externa
