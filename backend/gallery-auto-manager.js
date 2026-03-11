const fs = require('fs-extra');
const path = require('path');

class GalleryAutoManager {
    constructor(galleryHtmlPath, imagesDir = './images/') {
        this.galleryHtmlPath = galleryHtmlPath;
        this.imagesDir = imagesDir;
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    }

    // Obtener todas las imágenes en el directorio
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

    // Obtener imágenes actualmente en la galería HTML
    async getCurrentGalleryImages() {
        try {
            const htmlContent = await fs.readFile(this.galleryHtmlPath, 'utf8');
            const imgMatches = htmlContent.match(/<img src="([^"]+)" alt="[^"]*">/g);
            
            if (!imgMatches) return [];
            
            return imgMatches.map(match => {
                const srcMatch = match.match(/src="([^"]+)"/);
                return srcMatch ? srcMatch[1] : null;
            }).filter(src => src && src !== '#');
        } catch (error) {
            console.error('Error leyendo HTML:', error);
            return [];
        }
    }

    // Generar HTML para un nuevo item de galería
    generateGalleryItem(imageName, title, description) {
        const imagePath = `images/${imageName}`;
        return `                <div class="gallery-item" >
                    <img src="${imagePath}" alt="${title}">
                    <div class="gallery-overlay">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <div class="gallery-actions">
                            <button class="gallery-btn like-btn" data-image="${imagePath}" title="Me gusta">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="gallery-btn download-btn" data-image="${imagePath}" title="Descargar imagen">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
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
    generateMetadata(imageName) {
        const nameWithoutExt = path.basename(imageName, path.extname(imageName));
        
        // Si el nombre es numérico, generar títulos genéricos
        if (/^\d+$/.test(nameWithoutExt)) {
            const titles = [
                'Evento Especial', 'Actividad Académica', 'Taller Educativo',
                'Reunión de Equipo', 'Celebración', 'Conferencia',
                'Sesión de Trabajo', 'Presentación', 'Feria Tecnológica',
                'Capacitación', 'Encuentro Social', 'Proyecto Especial'
            ];
            
            const descriptions = [
                'Momentos importantes de nuestra comunidad',
                'Actividades académicas y formativas',
                'Trabajo en equipo y colaboración',
                'Celebración de logros y achievements',
                'Aprendizaje y desarrollo continuo',
                'Innovación y creatividad en acción'
            ];
            
            const randomIndex = parseInt(nameWithoutExt) % titles.length;
            return {
                title: titles[randomIndex],
                description: descriptions[randomIndex % descriptions.length]
            };
        }
        
        // Para nombres con texto, usar el nombre como título
        return {
            title: nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1),
            description: 'Actividad destacada de nuestra comunidad'
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
            
            // Encontrar imágenes nuevas (que están en directorio pero no en galería)
            const newImages = availableImages.filter(img => {
                const imagePath = `images/${img}`;
                return !currentImages.includes(img) && 
                       !currentImages.includes(imagePath);
            });

            console.log('📋 Imágenes nuevas:', newImages);

            if (newImages.length === 0) {
                console.log('✅ No hay imágenes nuevas para agregar');
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
            
            // Generar HTML para nuevas imágenes
            let newItemsHtml = '';
            const addedImages = [];
            
            for (const imageName of newImages) {
                const metadata = this.generateMetadata(imageName);
                const itemHtml = this.generateGalleryItem(imageName, metadata.title, metadata.description);
                newItemsHtml += itemHtml + '\n';
                addedImages.push({ name: imageName, path: `images/${imageName}`, ...metadata });
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
            
            console.log(`✅ Se agregaron ${newImages.length} imágenes nuevas:`);
            addedImages.forEach(img => {
                console.log(`   📸 ${img.name} - ${img.title}`);
            });

            return { added: newImages.length, images: addedImages };

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
                console.log(`🔄 Cambio detectado: ${filename}`);
                
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
