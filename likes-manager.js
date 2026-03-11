// ===== SISTEMA DE LIKES ORIENTADO A SERVIDOR =====
class LikesManager {
    constructor() {
        // Configuración automática de URL del backend
        this.backendUrl = this.detectBackendUrl();
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.serverAvailable = false; // Nuevo flag para detectar si el servidor está disponible
        
        // Detectar estado de conexión
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Detectar automáticamente la URL del backend
    detectBackendUrl() {
        // Temporalmente forzar localhost para evitar problemas
        return 'http://localhost:3001/api';
        
        // Código original (comentado temporalmente)
        /*
        // En producción, usar el mismo dominio que el frontend
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Si el sitio está en un dominio real, usar el mismo dominio con puerto 3001
            return `${window.location.protocol}//${window.location.hostname}:3001/api`;
        }
        
        // En desarrollo, intentar diferentes puertos comunes
        const possiblePorts = [3001, 3002, 8000, 8080];
        const hostname = window.location.hostname || 'localhost';
        
        // Para desarrollo, usar localhost:3001 por defecto
        return `http://${hostname}:3001/api`;
        */
    }

    // Verificar si el servidor está disponible
    async checkServerAvailability() {
        try {
            const response = await fetch(`${this.backendUrl}/likes`, { 
                method: 'HEAD',
                timeout: 3000 
            });
            this.serverAvailable = response.ok;
            return this.serverAvailable;
        } catch (error) {
            this.serverAvailable = false;
            return false;
        }
    }

    // Obtener likes de una imagen (intenta backend, fallback a localStorage)
    async getLikes(imageId) {
        // Primero verificar si el servidor está disponible
        if (this.isOnline && this.serverAvailable) {
            try {
                const response = await fetch(`${this.backendUrl}/likes/${encodeURIComponent(imageId)}`);
                if (response.ok) {
                    const data = await response.json();
                    return data.likes;
                } else {
                    console.warn('Error en respuesta del servidor:', response.status);
                    return this.getFallbackLikes(imageId);
                }
            } catch (error) {
                console.error('Error obteniendo likes del backend:', error);
                this.serverAvailable = false; // Marcar como no disponible
                return this.getFallbackLikes(imageId);
            }
        } else {
            // Usar localStorage si el servidor no está disponible
            return this.getFallbackLikes(imageId);
        }
    }

    // Obtener todos los likes (intenta backend, fallback a localStorage)
    async getAllLikes() {
        // Primero verificar si el servidor está disponible
        if (this.isOnline) {
            await this.checkServerAvailability();
        }
        
        if (this.isOnline && this.serverAvailable) {
            try {
                const response = await fetch(`${this.backendUrl}/likes`);
                if (response.ok) {
                    const data = await response.json();
                    // Actualizar fallback con datos del servidor
                    this.setAllFallbackLikes(data);
                    return data;
                } else {
                    console.warn('Error obteniendo todos los likes:', response.status);
                    return this.getFallbackAllLikes();
                }
            } catch (error) {
                console.error('Error obteniendo todos los likes del backend:', error);
                this.serverAvailable = false; // Marcar como no disponible
                return this.getFallbackAllLikes();
            }
        } else {
            // Usar localStorage si el servidor no está disponible
            return this.getFallbackAllLikes();
        }
    }

    // Agregar un like (intenta backend, fallback a localStorage)
    async addLike(imageId) {
        if (this.isOnline && this.serverAvailable) {
            try {
                const response = await fetch(`${this.backendUrl}/likes/${encodeURIComponent(imageId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Actualizar fallback
                    this.setFallbackLikes(imageId, data.likes);
                    return data.likes;
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error agregando like:', error);
                this.serverAvailable = false; // Marcar como no disponible
                // Agregar a cola de sincronización
                this.syncQueue.push({ action: 'add', imageId, timestamp: Date.now() });
                // Devolver valor optimista desde localStorage
                const currentLikes = this.getFallbackLikes(imageId);
                this.setFallbackLikes(imageId, currentLikes + 1);
                return currentLikes + 1;
            }
        } else {
            // Usar localStorage directamente
            const currentLikes = this.getFallbackLikes(imageId);
            this.setFallbackLikes(imageId, currentLikes + 1);
            // Agregar a cola de sincronización para cuando vuelva el servidor
            this.syncQueue.push({ action: 'add', imageId, timestamp: Date.now() });
            return currentLikes + 1;
        }
    }

    // Quitar un like (intenta backend, fallback a localStorage)
    async removeLike(imageId) {
        if (this.isOnline && this.serverAvailable) {
            try {
                const response = await fetch(`${this.backendUrl}/likes/${encodeURIComponent(imageId)}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Actualizar fallback
                    this.setFallbackLikes(imageId, data.likes);
                    return data.likes;
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error quitando like:', error);
                this.serverAvailable = false; // Marcar como no disponible
                // Agregar a cola de sincronización
                this.syncQueue.push({ action: 'remove', imageId, timestamp: Date.now() });
                // Devolver valor optimista desde localStorage
                const currentLikes = this.getFallbackLikes(imageId);
                const newLikes = Math.max(0, currentLikes - 1);
                this.setFallbackLikes(imageId, newLikes);
                return newLikes;
            }
        } else {
            // Usar localStorage directamente
            const currentLikes = this.getFallbackLikes(imageId);
            const newLikes = Math.max(0, currentLikes - 1);
            this.setFallbackLikes(imageId, newLikes);
            // Agregar a cola de sincronización para cuando vuelva el servidor
            this.syncQueue.push({ action: 'remove', imageId, timestamp: Date.now() });
            return newLikes;
        }
    }

    // Verificar si una imagen tiene like del usuario (mínimo localStorage)
    hasUserLike(imageId) {
        const userLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
        return userLikes[imageId] || false;
    }

    // Marcar que usuario dio like a una imagen (único uso de localStorage)
    setUserLike(imageId, liked = true) {
        const userLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
        userLikes[imageId] = liked;
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
    }

    // Sincronizar cola de pendientes
    async syncQueue() {
        if (this.syncQueue.length === 0 || !this.isOnline) return;
        
        const queue = [...this.syncQueue];
        this.syncQueue = [];
        
        for (const item of queue) {
            try {
                if (item.action === 'add') {
                    await fetch(`${this.backendUrl}/likes/${encodeURIComponent(item.imageId)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else if (item.action === 'remove') {
                    await fetch(`${this.backendUrl}/likes/${encodeURIComponent(item.imageId)}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                console.log(`Sincronizado: ${item.action} para ${item.imageId}`);
            } catch (error) {
                console.error('Error sincronizando item:', item, error);
                // Re-agregar a la cola si falla
                this.syncQueue.push(item);
            }
        }
    }

    // Obtener estado de conexión
    getConnectionStatus() {
        return this.isOnline;
    }

    // Forzar sincronización manual
    async forceSync() {
        await this.syncQueue();
    }

    // Limpiar cola de sincronización
    clearSyncQueue() {
        this.syncQueue = [];
    }

    // Métodos de fallback (ahora principales cuando el servidor no está disponible)
    getFallbackLikes(imageId) {
        const fallbackLikes = JSON.parse(localStorage.getItem('fallbackLikes') || '{}');
        return fallbackLikes[imageId] || 0;
    }

    getFallbackAllLikes() {
        return JSON.parse(localStorage.getItem('fallbackLikes') || '{}');
    }

    setFallbackLikes(imageId, count) {
        const fallbackLikes = this.getFallbackAllLikes();
        fallbackLikes[imageId] = count;
        localStorage.setItem('fallbackLikes', JSON.stringify(fallbackLikes));
    }

    setAllFallbackLikes(likesData) {
        localStorage.setItem('fallbackLikes', JSON.stringify(likesData));
    }

    // Limpiar datos de fallback
    clearFallbackData() {
        localStorage.removeItem('fallbackLikes');
        localStorage.removeItem('userLikes');
    }
}

// Crear instancia global
const likesManager = new LikesManager();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LikesManager;
}
