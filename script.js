// ===== VARIABLES GLOBALES =====
const navbar = document.querySelector('.navbar');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.querySelector('.hamburger');
const sections = document.querySelectorAll('section');
const galleryItems = document.querySelectorAll('.gallery-item');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDescription = document.getElementById('lightbox-description');
const lightboxClose = document.querySelector('.lightbox-close');
const contactForm = document.getElementById('contactForm');

// Carousel variables
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;
let slideInterval;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initGallery();
    initLightbox();
    initContactForm();
    initAnimations();
    initFAQ();
    initNewsletter();
    initCarousel();
    initGalleryButtons();
    initLikesSystem(); // Sistema de likes orientado a servidor
    initConnectionMonitoring(); // Monitoreo de conexión
});

// ===== MONITOREO DE CONEXIÓN =====
function initConnectionMonitoring() {
    // Asegurarse de que likesManager esté disponible
    if (typeof likesManager === 'undefined') {
        console.warn('LikesManager no disponible, monitoreo de conexión desactivado');
        return;
    }
    
    // Mostrar estado de conexión cuando cambia
    window.addEventListener('online', () => {
        showConnectionStatus();
        // Sincronizar automáticamente cuando vuelve la conexión
        setTimeout(() => {
            refreshAllLikes();
        }, 1000);
    });
    
    window.addEventListener('offline', () => {
        showConnectionStatus();
    });
    
    // Refrescar likes periódicamente (cada 30 segundos)
    setInterval(() => {
        if (likesManager.getConnectionStatus()) {
            refreshAllLikes();
        }
    }, 30000);
}

// ===== NAVEGACIÓN =====
function initNavigation() {
    if (!navbar || !navMenu || !hamburger || !navLinks) return;
    
    // Menú móvil
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Scrollspy
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ===== EFECTOS DE SCROLL =====
function initScrollEffects() {
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            navMenu.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            navMenu.classList.remove('scrolled');
        }
    });
    
    // Animación de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    const animateElements = document.querySelectorAll('.info-card, .timeline-item, .gallery-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== GALERÍA =====
function initGallery() {
    if (!filterBtns) return;
    
    // Filtrado de galería por categorías/días
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botón activo
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtrar elementos
            const filter = btn.getAttribute('data-filter');
            filterGalleryItems(filter);
        });
    });
}

// Función para filtrar elementos de la galería
function filterGalleryItems(filter) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const imgSrc = img ? img.src : '';
        const imgAlt = img ? img.alt : '';
        
        // Determinar si el elemento coincide con el filtro
        let shouldShow = false;
        
        if (filter === 'all') {
            shouldShow = true;
        } else if (filter.startsWith('dia-')) {
            // Filtrar por día - buscar en el src o alt del nombre de archivo
            const dayNumber = filter.replace('dia-', '');
            shouldShow = isImageFromDay(imgSrc, imgAlt, dayNumber);
        }
        
        // Aplicar el filtro con animación
        if (shouldShow) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Función para determinar si una imagen pertenece a un día específico
function isImageFromDay(imgSrc, imgAlt, dayNumber) {
    // Lógica para asignar imágenes a días basado en el nombre del archivo
    const fileName = imgSrc.split('/').pop() || imgAlt;
    
    // Aquí puedes definir la lógica específica para tus imágenes
    // Por ahora, usaré una lógica basada en el orden de las imágenes
    
    const dayMappings = {
        '1': ['WhatsApp Image 2026-03-09 at 17.38.56.jpeg'], // Día 1
        '2': ['WhatsApp Image 2026-03-09 at 17.38.56 (1).jpeg'], // Día 2
        '3': ['WhatsApp Image 2026-03-09 at 17.38.56 (2).jpeg'], // Día 3
        '4': ['WhatsApp Image 2026-03-09 at 17.38.57.jpeg'], // Día 4
        '5': [] // Día 5 - vacío por ahora
    };
    
    return dayMappings[dayNumber] && dayMappings[dayNumber].some(pattern => 
        fileName.toLowerCase().includes(pattern.toLowerCase())
    );
}

// ===== LIGHTBOX =====
function initLightbox() {
    if (!galleryItems || !lightbox || !lightboxImg || !lightboxTitle || !lightboxDescription) return;
    
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Verificar si el clic fue en un botón de la galería
            if (e.target.closest('.gallery-btn')) {
                return; // No abrir el lightbox si se hizo clic en un botón
            }
            
            const img = item.querySelector('img');
            const title = item.querySelector('h3').textContent;
            const description = item.querySelector('p').textContent;
            
            lightboxImg.src = img.src;
            lightboxTitle.textContent = title;
            lightboxDescription.textContent = description;
            
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Cerrar lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ===== FORMULARIO DE CONTACTO =====
function initContactForm() {
    if (!contactForm) return; // Salir si no hay formulario de contacto
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Validación básica
        if (!validateForm(data)) {
            return;
        }
        
        // Simular envío del formulario
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Simular delay de envío
        setTimeout(() => {
            // Mostrar mensaje de éxito
            showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
            
            // Resetear formulario
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
    
    // Validación en tiempo real
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

function validateForm(data) {
    let isValid = true;
    
    // Validar nombre
    if (data.name.trim().length < 2) {
        showFieldError('name', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFieldError('email', 'Por favor, ingresa un email válido');
        isValid = false;
    }
    
    // Validar asunto
    if (data.subject.trim().length < 3) {
        showFieldError('subject', 'El asunto debe tener al menos 3 caracteres');
        isValid = false;
    }
    
    // Validar mensaje
    if (data.message.trim().length < 10) {
        showFieldError('message', 'El mensaje debe tener al menos 10 caracteres');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            break;
        case 'text':
            isValid = value.length >= (field.id === 'name' ? 2 : 3);
            break;
        case 'textarea':
            isValid = value.length >= 10;
            break;
    }
    
    if (isValid) {
        field.classList.remove('error');
        removeFieldError(field.id);
    } else {
        field.classList.add('error');
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    // Eliminar mensaje de error anterior si existe
    removeFieldError(fieldId);
    
    // Crear y mostrar nuevo mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// ===== SISTEMA DE NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos de notificación mejorados
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    });
    
    // Color según tipo
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
    }
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===== ANIMACIONES ADICIONALES =====
function initAnimations() {
    // Animación de números en estadísticas
    animateNumbers();
    
    // Efecto parallax suave en el hero
    const parallaxEffect = () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    };
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(parallaxEffect);
    });
    
    // Animación de escritura para títulos (opcional)
    const typeWriter = (element, text, speed = 100) => {
        let i = 0;
        element.textContent = '';
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    };
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Función separada para animación de números
function animateNumbers() {
    const numbers = document.querySelectorAll('.animate-number');
    numbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateNumber = () => {
            current += step;
            if (current < target) {
                num.textContent = Math.floor(current);
                requestAnimationFrame(updateNumber);
            } else {
                num.textContent = target;
                // Agregar símbolo de porcentaje si es necesario
                if (num.getAttribute('data-target') === '95') {
                    num.textContent = target + '%';
                }
            }
        };
        
        // Iniciar animación cuando el elemento sea visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(num);
    });
}

// ===== FAQ =====
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Cerrar otros items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ===== NEWSLETTER =====
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Simular suscripción
            showNotification('¡Gracias por suscribirte! Te enviaremos las últimas novedades.', 'success');
            
            // Resetear formulario
            newsletterForm.reset();
        });
    }
}

// ===== CAROUSEL =====
function initCarousel() {
    if (!slides || slides.length === 0) return;
    
    // Start auto-play
    startAutoSlide();
    
    // Pause on hover
    const carousel = document.querySelector('.hero-carousel');
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
}

function showSlide(index) {
    // Hide all slides
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        indicators[i].classList.remove('active');
    });
    
    // Show current slide
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    
    currentSlide = index;
}

function changeSlide(direction) {
    let newSlide = currentSlide + direction;
    
    if (newSlide >= slides.length) {
        newSlide = 0;
    } else if (newSlide < 0) {
        newSlide = slides.length - 1;
    }
    
    showSlide(newSlide);
}

function goToSlide(index) {
    showSlide(index);
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    clearInterval(slideInterval);
}

// ===== UTILIDADES =====
// Función para debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para throttling
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Aplicar throttling al scroll para mejor rendimiento
window.addEventListener('scroll', throttle(() => {
    // Aquí pueden ir funciones que se ejecutan en el scroll
}, 100));

// ===== PRELOADER (opcional) =====
window.addEventListener('load', () => {
    // Si se desea agregar un preloader, se puede implementar aquí
    document.body.style.opacity = '1';
});

// ===== DETECCIÓN DE DISPOSITIVO =====
const isMobile = () => {
    return window.innerWidth <= 768;
};

const isTablet = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
};

const isDesktop = () => {
    return window.innerWidth > 1024;
};

// ===== SISTEMA DE LIKES ORIENTADO A SERVIDOR =====
async function initLikesSystem() {
    // Asegurarse de que likesManager esté disponible
    if (typeof likesManager === 'undefined') {
        console.warn('LikesManager no disponible, el sistema de likes no funcionará');
        return;
    }

    // Cargar todos los likes desde el backend al inicio
    try {
        await likesManager.getAllLikes();
    } catch (error) {
        console.warn('No se pudieron cargar likes iniciales:', error);
    }

    // Inicializar botones de like
    const likeButtons = document.querySelectorAll('.like-btn');
    
    for (const button of likeButtons) {
        const imageSrc = button.getAttribute('data-image');
        if (!imageSrc || imageSrc === '#') continue;
        
        // Obtener likes actuales desde backend
        try {
            const likes = await likesManager.getLikes(imageSrc);
            const countSpan = button.querySelector('.like-count');
            const icon = button.querySelector('i');
            
            // Actualizar contador
            if (countSpan) countSpan.textContent = likes;
            
            // Verificar si usuario ya dio like
            const hasLike = likesManager.hasUserLike(imageSrc);
            if (hasLike) {
                button.classList.add('liked');
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        } catch (error) {
            console.error('Error cargando likes iniciales para', imageSrc, error);
        }
        
        // Agregar event listener
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleLike(button);
        });
    }
}

async function handleLike(button) {
    // Asegurarse de que likesManager esté disponible
    if (typeof likesManager === 'undefined') {
        console.warn('LikesManager no disponible');
        return;
    }

    const imageSrc = button.getAttribute('data-image');
    if (!imageSrc || imageSrc === '#') return;
    
    const icon = button.querySelector('i');
    const countSpan = button.querySelector('.like-count');
    const hasLike = likesManager.hasUserLike(imageSrc);
    
    // Deshabilitar botón temporalmente para evitar doble click
    button.disabled = true;
    
    try {
        if (hasLike) {
            // Quitar like
            const newLikes = await likesManager.removeLike(imageSrc);
            button.classList.remove('liked');
            icon.classList.remove('fas');
            icon.classList.add('far');
            likesManager.setUserLike(imageSrc, false);
            if (countSpan) countSpan.textContent = newLikes;
            showNotification('Quitaste tu like', 'info');
        } else {
            // Agregar like
            const newLikes = await likesManager.addLike(imageSrc);
            button.classList.add('liked');
            icon.classList.remove('far');
            icon.classList.add('fas');
            likesManager.setUserLike(imageSrc, true);
            if (countSpan) countSpan.textContent = newLikes;
            showNotification('¡Te gustó esta imagen!', 'success');
        }
    } catch (error) {
        console.error('Error procesando like:', error);
        showNotification('Error al procesar tu like', 'error');
        
        // Revertir estado visual si hay error
        if (hasLike) {
            button.classList.add('liked');
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            button.classList.remove('liked');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    } finally {
        // Rehabilitar botón
        setTimeout(() => {
            button.disabled = false;
        }, 300);
    }
}

// Función para refrescar todos los contadores desde el servidor
async function refreshAllLikes() {
    // Asegurarse de que likesManager esté disponible
    if (typeof likesManager === 'undefined') {
        console.warn('LikesManager no disponible');
        return;
    }
    
    const likeButtons = document.querySelectorAll('.like-btn');
    
    for (const button of likeButtons) {
        const imageSrc = button.getAttribute('data-image');
        if (!imageSrc || imageSrc === '#') continue;
        
        try {
            const likes = await likesManager.getLikes(imageSrc);
            const countSpan = button.querySelector('.like-count');
            if (countSpan) countSpan.textContent = likes;
            
            // Actualizar estado del botón
            const hasLike = likesManager.hasUserLike(imageSrc);
            const icon = button.querySelector('i');
            
            if (hasLike) {
                button.classList.add('liked');
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                button.classList.remove('liked');
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        } catch (error) {
            console.error('Error refrescando likes para', imageSrc, error);
        }
    }
}

// Función para mostrar estado de conexión
function showConnectionStatus() {
    // Asegurarse de que likesManager esté disponible
    if (typeof likesManager === 'undefined') {
        console.warn('LikesManager no disponible');
        return;
    }
    
    const isOnline = likesManager.getConnectionStatus();
    const statusElement = document.createElement('div');
    statusElement.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
    statusElement.innerHTML = `
        <i class="fas fa-${isOnline ? 'wifi' : 'wifi-slash'}"></i>
        <span>${isOnline ? 'Conectado' : 'Sin conexión'}</span>
    `;
    
    // Estilos para el indicador
    Object.assign(statusElement.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        zIndex: '1000',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    });
    
    if (isOnline) {
        statusElement.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        statusElement.style.color = 'white';
    } else {
        statusElement.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        statusElement.style.color = 'white';
    }
    
    document.body.appendChild(statusElement);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (statusElement.parentNode) {
            statusElement.parentNode.removeChild(statusElement);
        }
    }, 3000);
}

// ===== BOTONES DE GALERÍA =====
function initGalleryButtons() {
    // Inicializar botones de descarga
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDownload(btn);
        });
    });
}

// Función mejorada para descargar imágenes
async function downloadImage(imageSrc, nameOfDownload) {
    try {
        const response = await fetch(imageSrc);
        if (!response.ok) {
            throw new Error('No se pudo descargar la imagen');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nameOfDownload;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Error en downloadImage:', error);
        return false;
    }
}

function handleDownload(button) {
    const imageSrc = button.getAttribute('data-image');
    const fileName = imageSrc.split('/').pop() || 'imagen.jpg';
    
    if (imageSrc === '#') {
        showNotification('Esta imagen no está disponible para descarga', 'error');
        return;
    }
    
    // Verificar si es una URL local (file://) - omitir fetch por CORS
    if (window.location.protocol === 'file:' || imageSrc.startsWith('file://')) {
        // Para archivos locales, ir directamente al método de nueva pestaña
        const newWindow = window.open(imageSrc, '_blank');
        if (newWindow) {
            setTimeout(() => {
                showNotification('Imagen abierta en nueva pestaña. Haz clic derecho → "Guardar imagen como..."', 'info');
            }, 300);
        } else {
            // Fallback si el popup es bloqueado
            const link = document.createElement('a');
            link.href = imageSrc;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('Imagen abierta en nueva pestaña. Haz clic derecho → "Guardar imagen como..."', 'info');
        }
        return;
    }
    
    // Para URLs remotas (http/https), usar la función mejorada
    downloadImage(imageSrc, fileName).then(success => {
        if (success) {
            showNotification('Imagen descargada exitosamente', 'success');
        } else {
            showNotification('Error al descargar la imagen', 'error');
        }
    });
}

function updateAllLikeCounts() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(btn => {
        const imageSrc = btn.getAttribute('data-image');
        const countSpan = btn.querySelector('.like-count');
        const icon = btn.querySelector('i');
        
        if (likedImages[imageSrc] && likedImages[imageSrc] > 0) {
            countSpan.textContent = likedImages[imageSrc];
            btn.classList.add('liked');
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            countSpan.textContent = '0';
            btn.classList.remove('liked');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

// ===== ACCESIBILIDAD =====
// Navegación por teclado para la galería
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Navegación entre imágenes (se puede implementar)
            e.preventDefault();
        }
    }
});

// Focus management para mejor accesibilidad
const manageFocus = () => {
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    // Implementar trampilla de foco para modales
    if (lightbox.style.display === 'flex') {
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        lightbox.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
};
