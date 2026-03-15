const fs = require('fs-extra');
const path = require('path');

class GalleryAutoManager {
    constructor(galleryHtmlPath, imagesDir = './images/') {
        this.galleryHtmlPath = galleryHtmlPath;
        this.imagesDir = imagesDir;
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mov', '.webm'];
    }

    // Obtener todas las imágenes y videos en el directorio
    async getImagesInDirectory() {
        try {
            const files = await fs.readdir(this.imagesDir);
            return files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return this.supportedFormats.includes(ext) && 
                       !file.startsWith('thumbnail_') &&
                       !file.startsWith('logo');
            });
        } catch (error) {
            console.error('Error leyendo directorio:', error);
            return [];
        }
    }

    // Obtener imágenes y videos actualmente en la galería HTML
    async getCurrentGalleryImages() {
        try {
            const htmlContent = await fs.readFile(this.galleryHtmlPath, 'utf8');
            // Buscar tanto imágenes como videos
            const imgMatches = htmlContent.match(/<img src="([^"]+)" alt="[^"]*">/g) || [];
            const videoMatches = htmlContent.match(/<video src="([^"]+)"/g) || [];
            
            const extractSrc = (match) => {
                const srcMatch = match.match(/src="([^"]+)"/);
                return srcMatch ? srcMatch[1] : null;
            };
            
            const imgSources = imgMatches.map(extractSrc).filter(src => src && src !== '#');
            const videoSources = videoMatches.map(extractSrc).filter(src => src && src !== '#');
            
            return [...imgSources, ...videoSources];
        } catch (error) {
            console.error('Error leyendo HTML:', error);
            return [];
        }
    }

    // Generar HTML para un nuevo item de galería (imagen o video)
    generateGalleryItem(fileName, title, description) {
        const filePath = `images/${fileName}`;
        const isVideo = ['.mp4', '.avi', '.mov', '.webm'].includes(path.extname(fileName).toLowerCase());
        
        if (isVideo) {
            return `                <div class="gallery-item video-item" >
                    <video src="${filePath}" alt="${title}" muted loop playsinline></video>
                    <div class="gallery-overlay">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <div class="gallery-actions">
                            <button class="gallery-btn like-btn" data-image="${filePath}" title="Me gusta">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="gallery-btn download-btn" data-image="${filePath}" title="Descargar video">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        } else {
            return `                <div class="gallery-item" >
                    <img src="${filePath}" alt="${title}">
                    <div class="gallery-overlay">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <div class="gallery-actions">
                            <button class="gallery-btn like-btn" data-image="${filePath}" title="Me gusta">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="gallery-btn download-btn" data-image="${filePath}" title="Descargar imagen">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        }
    }

    // Eliminar items con # de la galería
    async removeHashItems() {
        try {
            let htmlContent = await fs.readFile(this.galleryHtmlPath, 'utf8');
            
            // Expresión regular para encontrar gallery-items con src="#"
            const hashItemRegex = /                <div class="gallery-item"[^>]*>[\s\S]*?<img src="#"[^>]*>[\s\S]*?<\/div>/g;
            
            const removedItems = htmlContent.match(hashItemRegex) || [];
            
            // Eliminar los items con #
            htmlContent = htmlContent.replace(hashItemRegex, '');
            
            // Guardar el HTML limpio
            await fs.writeFile(this.galleryHtmlPath, htmlContent);
            
            if (removedItems.length > 0) {
                console.log(`🗑️  Se eliminaron ${removedItems.length} items con # de la galería`);
            }
            
            return removedItems.length;
        } catch (error) {
            console.error('Error eliminando items con #:', error);
            return 0;
        }
    }

    // Generar título y descripción automáticamente basados en el nombre
    generateMetadata(fileName) {
        const nameWithoutExt = path.basename(fileName, path.extname(fileName));
        const isVideo = ['.mp4', '.avi', '.mov', '.webm'].includes(path.extname(fileName).toLowerCase());
        
        // Si el nombre es numérico, generar títulos genéricos
        if (/^\d+$/.test(nameWithoutExt)) {
            const imageTitles = [
                'Evento Especial', 'Actividad Académica', 'Taller Educativo',
                'Reunión de Equipo', 'Celebración', 'Conferencia',
                'Sesión de Trabajo', 'Presentación', 'Feria Tecnológica',
                'Capacitación', 'Encuentro Social', 'Proyecto Especial'
            ];
            
            const videoTitles = [
                'Video Educativo', 'Presentación Multimedia', 'Taller Video',
                'Conferencia Grabada', 'Demostración Práctica', 'Evento Especial',
                'Sesión Interactiva', 'Proyecto Video', 'Actividad Multimedia'
            ];
            
            const descriptions = [
                'Momentos importantes de nuestra comunidad',
                'Actividades académicas y formativas',
                'Trabajo en equipo y colaboración',
                'Celebración de logros y achievements',
                'Aprendizaje y desarrollo continuo',
                'Innovación y creatividad en acción'
            ];
            
            const titles = isVideo ? videoTitles : imageTitles;
            const randomIndex = parseInt(nameWithoutExt) % titles.length;
            
            return {
                title: titles[randomIndex],
                description: descriptions[randomIndex % descriptions.length]
            };
        }
        
        // Para nombres con texto, usar el nombre como título
        return {
            title: nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1),
            description: isVideo ? 'Video destacado de nuestra comunidad' : 'Actividad destacada de nuestra comunidad'
        };
    }

    // Actualizar la galería con nuevas imágenes
    async updateGallery() {
        try {
            // Primero eliminar items con #
            await this.removeHashItems();
            
            const currentImages = await this.getCurrentGalleryImages();
            const availableImages = await this.getImagesInDirectory();
            
            // Debug info
            console.log('📋 Imágenes en directorio:', availableImages);
            console.log('📋 Imágenes en galería:', currentImages);
            
            // Encontrar imágenes/videos nuevos (que están en directorio pero no en galería)
            const newFiles = availableImages.filter(file => {
                const filePath = `images/${file}`;
                return !currentImages.includes(file) && 
                       !currentImages.includes(filePath);
            });

            console.log('📋 Archivos nuevos:', newFiles);

            if (newFiles.length === 0) {
                console.log('✅ No hay archivos nuevos para agregar');
                return { added: 0, images: [], removed: 0 };
            }

            // Leer HTML actual
            let htmlContent = await fs.readFile(this.galleryHtmlPath, 'utf8');
            
            // Método más robusto: buscar el gallery-grid y su contenido
            const galleryGridStart = htmlContent.indexOf('<div class="gallery-grid">');
            if (galleryGridStart === -1) {
                throw new Error('No se encontró el inicio del gallery-grid');
            }
            
            // Buscar el cierre del gallery-grid (el </div> antes del cierre de section)
            const sectionStart = htmlContent.indexOf('</section>', galleryGridStart);
            if (sectionStart === -1) {
                throw new Error('No se encontró el cierre de la sección');
            }
            
            // Encontrar el último </div> antes del cierre de section
            let lastDivIndex = -1;
            let searchIndex = galleryGridStart;
            
            while (searchIndex < sectionStart) {
                const divIndex = htmlContent.indexOf('</div>', searchIndex);
                if (divIndex === -1 || divIndex >= sectionStart) break;
                
                lastDivIndex = divIndex;
                searchIndex = divIndex + 6; // +6 para saltar </div>
            }
            
            if (lastDivIndex === -1) {
                throw new Error('No se encontró el cierre del gallery-grid');
            }
            
            // Extraer el contenido actual del gallery-grid
            const gridContentStart = galleryGridStart + '<div class="gallery-grid">'.length;
            const currentGridContent = htmlContent.substring(gridContentStart, lastDivIndex);
            
            // Generar HTML para nuevos archivos
            let newItemsHtml = '';
            const addedFiles = [];
            
            for (const fileName of newFiles) {
                const metadata = this.generateMetadata(fileName);
                const itemHtml = this.generateGalleryItem(fileName, metadata.title, metadata.description);
                newItemsHtml += itemHtml + '\n';
                addedFiles.push({ name: fileName, path: `images/${fileName}`, ...metadata });
            }
            
            // Construir el nuevo contenido del gallery-grid
            const newGridContent = currentGridContent + newItemsHtml;
            
            // Construir el nuevo HTML completo
            const newHtmlContent = 
                htmlContent.substring(0, gridContentStart) + 
                newGridContent + 
                htmlContent.substring(lastDivIndex);

            // Guardar HTML actualizado
            await fs.writeFile(this.galleryHtmlPath, newHtmlContent);
            
            console.log(`✅ Se agregaron ${newFiles.length} archivos nuevos:`);
            addedFiles.forEach(file => {
                const fileType = ['.mp4', '.avi', '.mov', '.webm'].includes(path.extname(file.name).toLowerCase()) ? '🎥' : '📸';
                console.log(`   ${fileType} ${file.name} - ${file.title}`);
            });

            return { added: newFiles.length, images: addedFiles };

        } catch (error) {
            console.error('❌ Error actualizando galería:', error);
            throw error;
        }
    }

    // Modo observador: detecta cambios automáticamente
    async startWatcher() {
        console.log('👀 Iniciando observador de imágenes...');
        
        // Actualizar inicialmente
        await this.updateGallery();
        
        // Configurar observador de cambios
        fs.watch(this.imagesDir, async (eventType, filename) => {
            if (!filename) return;
            
            const ext = path.extname(filename).toLowerCase();
            if (this.supportedFormats.includes(ext)) {
                const fileType = ['.mp4', '.avi', '.mov', '.webm'].includes(ext) ? '🎥 Video' : '📸 Imagen';
                console.log(`🔄 Cambio detectado: ${fileType} ${filename}`);
                
                // Esperar un poco para asegurar que el archivo esté completamente copiado
                setTimeout(async () => {
                    await this.updateGallery();
                }, 1000);
            }
        });
    }
}

// Uso
if (require.main === module) {
    const galleryManager = new GalleryAutoManager('../galeria.html', '../images/');
    
    // Modo 1: Actualización única
    galleryManager.updateGallery()
        .then(result => {
            console.log(`Actualización completada: ${result.added} imágenes agregadas`);
        })
        .catch(console.error);
    
    // Modo 2: Observador automático (comentar la línea anterior y descomentar esta)
    // galleryManager.startWatcher().catch(console.error);
}

module.exports = GalleryAutoManager;
