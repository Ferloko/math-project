# Sistema de Automatización de Galería

He creado un sistema completo para automatizar el agregado de fotos nuevas a tu galería. Hay varias formas de usarlo:

## 🚀 **Opción 1: Script Automático (Recomendada)**

Ejecuta este comando para actualizar la galería automáticamente:

```bash
cd backend
npm install
npm run update-gallery
```

O para modo observador (detecta nuevos archivos automáticamente):

```bash
npm run watch
```

## 🌐 **Opción 2: Interfaz Web de Administración**

1. Inicia el servidor backend:
```bash
cd backend
npm install
npm start
```

2. Abre `admin.html` en tu navegador
3. Desde allí puedes:
   - Arrastrar y soltar imágenes
   - Ver estadísticas
   - Actualizar galería con un clic
   - Monitorear imágenes pendientes

## 📡 **Opción 3: API REST**

El servidor expone estos endpoints:

- `GET /api/gallery/images` - Lista todas las imágenes disponibles
- `POST /api/gallery/update` - Actualiza la galería automáticamente
- `POST /api/gallery/upload` - Sube nuevas imágenes

## 🔄 **¿Cómo funciona?**

1. **Detección automática**: El sistema escanea la carpeta principal en busca de imágenes (.jpg, .png, .gif, .webp)
2. **Comparación inteligente**: Compara las imágenes existentes con las que ya están en galería.html
3. **Generación HTML**: Crea automáticamente el código HTML para las nuevas imágenes
4. **Metadatos automáticos**: Genera títulos y descripciones apropiados
5. **Integración completa**: Mantiene los botones de like y descarga funcionando

## 📋 **Características**

- ✅ Detección automática de nuevas imágenes
- ✅ Generación inteligente de títulos
- ✅ Mantenimiento de funcionalidad (likes, descargas)
- ✅ Soporte para múltiples formatos de imagen
- ✅ Interfaz web amigable
- ✅ API REST para integración
- ✅ Modo observador en tiempo real

## 🎯 **Uso Recomendado**

Para mejor experiencia:

1. Inicia el servidor: `cd backend && npm start`
2. Abre `admin.html` en tu navegador
3. Arrastra nuevas imágenes al área de subida
4. Las imágenes se agregarán automáticamente a la galería

¡Ahora solo necesitas agregar las fotos a la carpeta y el sistema hace el resto!
