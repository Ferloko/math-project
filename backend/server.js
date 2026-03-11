const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware con CORS mejorado
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost', 'http://127.0.0.1', 
             'file://', '*', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    safeFileNames: true,
    preserveExtension: true
}));

// Archivo para almacenar los likes
const LIKES_FILE = path.join(__dirname, 'data', 'likes.json');

// Inicializar archivo de likes si no existe
async function initializeLikesFile() {
    try {
        await fs.ensureDir(path.dirname(LIKES_FILE));
        if (!await fs.pathExists(LIKES_FILE)) {
            await fs.writeJson(LIKES_FILE, {});
        }
    } catch (error) {
        console.error('Error inicializando archivo de likes:', error);
    }
}

// Obtener todos los likes
app.get('/api/likes', async (req, res) => {
    try {
        const likes = await fs.readJson(LIKES_FILE);
        res.json(likes);
    } catch (error) {
        console.error('Error obteniendo likes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener likes de una imagen específica
app.get('/api/likes/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const likes = await fs.readJson(LIKES_FILE);
        const imageLikes = likes[imageId] || 0;
        res.json({ imageId, likes: imageLikes });
    } catch (error) {
        console.error('Error obteniendo likes de imagen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Agregar un like a una imagen
app.post('/api/likes/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const likes = await fs.readJson(LIKES_FILE);
        
        // Incrementar likes
        likes[imageId] = (likes[imageId] || 0) + 1;
        
        // Guardar en archivo
        await fs.writeJson(LIKES_FILE, likes);
        
        res.json({ imageId, likes: likes[imageId] });
    } catch (error) {
        console.error('Error agregando like:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Quitar un like de una imagen
app.delete('/api/likes/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const likes = await fs.readJson(LIKES_FILE);
        
        // Decrementar likes (no menor a 0)
        likes[imageId] = Math.max(0, (likes[imageId] || 0) - 1);
        
        // Guardar en archivo
        await fs.writeJson(LIKES_FILE, likes);
        
        res.json({ imageId, likes: likes[imageId] });
    } catch (error) {
        console.error('Error quitando like:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Resetear todos los likes (solo para desarrollo)
app.delete('/api/likes', async (req, res) => {
    try {
        await fs.writeJson(LIKES_FILE, {});
        res.json({ message: 'Todos los likes han sido reseteados' });
    } catch (error) {
        console.error('Error reseteando likes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ===== API PARA GESTIÓN DE GALERÍA =====

// Obtener todas las imágenes disponibles
app.get('/api/gallery/images', async (req, res) => {
    try {
        const imagesDir = path.join(__dirname, '../images/');
        const files = await fs.readdir(imagesDir);
        
        const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return supportedFormats.includes(ext);
            })
            .map(file => ({
                name: file,
                path: `/images/${file}`,
                size: fs.statSync(path.join(imagesDir, file)).size,
                modified: fs.statSync(path.join(imagesDir, file)).mtime
            }));
        
        res.json(images);
    } catch (error) {
        console.error('Error obteniendo imágenes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar galería automáticamente
app.post('/api/gallery/update', async (req, res) => {
    try {
        const GalleryAutoManager = require('./gallery-auto-manager');
        const galleryManager = new GalleryAutoManager(
            path.join(__dirname, '../galeria.html'),
            path.join(__dirname, '../images/')
        );
        
        const result = await galleryManager.updateGallery();
        res.json(result);
    } catch (error) {
        console.error('Error actualizando galería:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Subir nueva imagen
app.post('/api/gallery/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }
        
        const uploadedFile = req.files.image;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(uploadedFile.mimetype)) {
            return res.status(400).json({ error: 'Tipo de archivo no permitido' });
        }
        
        const uploadPath = path.join(__dirname, '../images/', uploadedFile.name);
        await uploadedFile.mv(uploadPath);
        
        // Actualizar galería automáticamente después de subir
        const GalleryAutoManager = require('./gallery-auto-manager');
        const galleryManager = new GalleryAutoManager(
            path.join(__dirname, '../galeria.html'),
            path.join(__dirname, '../images/')
        );
        
        await galleryManager.updateGallery();
        
        res.json({ 
            message: 'Imagen subida y galería actualizada',
            filename: uploadedFile.name 
        });
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../')));

// Inicializar y arrancar servidor
async function startServer() {
    await initializeLikesFile();
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor de likes corriendo en http://localhost:${PORT}`);
        console.log(`📁 Archivo de likes: ${LIKES_FILE}`);
        console.log(`🔗 API endpoints:`);
        console.log(`   GET    /api/likes - Obtener todos los likes`);
        console.log(`   GET    /api/likes/:imageId - Obtener likes de una imagen`);
        console.log(`   POST   /api/likes/:imageId - Agregar like`);
        console.log(`   DELETE /api/likes/:imageId - Quitar like`);
        console.log(`   DELETE /api/likes - Resetear todos los likes`);
        console.log(`   GET    /api/gallery/images - Obtener imágenes disponibles`);
        console.log(`   POST   /api/gallery/update - Actualizar galería automáticamente`);
        console.log(`   POST   /api/gallery/upload - Subir nueva imagen`);
    });
}

startServer().catch(console.error);
