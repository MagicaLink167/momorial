// ============================================
// MEMORIAL INTERACTIVO - ABUELA v3
// ============================================

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window)
    || window.innerWidth < 768;

// ========== ENTRADA ==========
function enterMemorial() {
    const intro = document.getElementById('intro-screen');
    const videoOverlay = document.getElementById('video-overlay');
    const introVideo = document.getElementById('intro-video');
    const main = document.getElementById('main-content');

    intro.classList.add('fade-out');

    setTimeout(() => {
        intro.style.display = 'none';
        videoOverlay.classList.remove('hidden');
        void videoOverlay.offsetWidth;
        videoOverlay.classList.add('show');
        introVideo.play();

        introVideo.onended = () => {
            videoOverlay.classList.add('fade-out');
            setTimeout(() => {
                videoOverlay.style.display = 'none';
                main.classList.remove('hidden');
                void main.offsetWidth;
                main.classList.add('visible');
                window.scrollTo(0, 0);
                initAll();
            }, 1000);
        };
    }, 1200);
}

// ========== INIT ==========
function initAll() {
    initScrollObserver();
    initFinalPetals();
    initMagicSparkles();
    initCarousel();

    if (!isMobile) {
        initHeroParallax();
        initMemoryParallax();
    }
}

// ========== HERO PARALLAX 3D (solo escritorio) ==========
function initHeroParallax() {
    const section = document.querySelector('.hero-section');
    const image3d = document.getElementById('hero-image');
    if (!section || !image3d) return;

    let targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;

    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRY = x * 18;
        targetRX = -y * 12;
    });

    section.addEventListener('mouseleave', () => {
        targetRX = 0;
        targetRY = 0;
    });

    function animate() {
        currentRX += (targetRX - currentRX) * 0.08;
        currentRY += (targetRY - currentRY) * 0.08;
        image3d.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(10px)`;
        requestAnimationFrame(animate);
    }
    animate();
}

// ========== MAGIC SPARKLES ==========
function initMagicSparkles() {
    const container = document.getElementById('magic-sparkles');
    if (!container) return;

    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'magic-sparkle';

        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * 3;

        sparkle.style.cssText = `
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        container.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), (duration + delay) * 1000);
    }

    setInterval(() => {
        for (let i = 0; i < (isMobile ? 2 : 5); i++) createSparkle();
    }, isMobile ? 1500 : 800);

    for (let i = 0; i < (isMobile ? 6 : 15); i++) createSparkle();
}

// ========== CAROUSEL CIRCULAR ==========
let carouselIndex = 0;
let carouselTotal = 0;
let carouselInterval = null;
let carouselPaused = false;
let touchStartX = 0;
let touchDeltaX = 0;

function initCarousel() {
    const track = document.getElementById('gallery-track');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.gallery-card');
    carouselTotal = cards.length;

    if (carouselTotal === 0) return;

    // Crear dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < carouselTotal; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir al recuerdo ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    // Marcarda primera como activa
    cards[0].classList.add('active');

    // Swipe en mobile
    const viewport = track.closest('.carousel-viewport');
    if (viewport) {
        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchDeltaX = 0;
            pauseCarousel();
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            touchDeltaX = e.touches[0].clientX - touchStartX;
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            if (Math.abs(touchDeltaX) > 50) {
                if (touchDeltaX < 0) {
                    moveCarousel(1);
                } else {
                    moveCarousel(-1);
                }
            }
            resumeCarousel();
        }, { passive: true });
    }

    // Pausar en hover (desktop)
    const container = track.closest('.carousel-container');
    if (container && !isMobile) {
        container.addEventListener('mouseenter', pauseCarousel);
        container.addEventListener('mouseleave', resumeCarousel);
    }

    // Iniciar auto-rotación
    startCarousel();
}

function goToSlide(index) {
    const track = document.getElementById('gallery-track');
    const cards = track.querySelectorAll('.gallery-card');
    const dots = document.querySelectorAll('.carousel-dot');

    if (index < 0) index = carouselTotal - 1;
    if (index >= carouselTotal) index = 0;

    // Quitar active de anterior
    cards[carouselIndex].classList.remove('active');
    dots[carouselIndex].classList.remove('active');

    carouselIndex = index;

    // Mover track
    const offset = -carouselIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    // Marcarda nueva
    cards[carouselIndex].classList.add('active');
    dots[carouselIndex].classList.add('active');
}

function moveCarousel(direction) {
    goToSlide(carouselIndex + direction);
    resetCarouselTimer();
}

function startCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        if (!carouselPaused) {
            goToSlide(carouselIndex + 1);
        }
    }, 3500);
}

function resetCarouselTimer() {
    if (carouselInterval) clearInterval(carouselInterval);
    startCarousel();
}

function pauseCarousel() {
    carouselPaused = true;
}

function resumeCarousel() {
    carouselPaused = false;
}

// ========== FUNERAL VIDEO ==========
function showFuneralVideo() {
    const warning = document.getElementById('funeral-warning');
    const funeralContent = document.getElementById('funeral-content');
    const video = document.getElementById('funeral-video');

    if (!warning || !funeralContent || !video) return;

    warning.classList.add('hidden-warning');

    setTimeout(() => {
        warning.style.display = 'none';
        funeralContent.style.display = 'flex';

        void funeralContent.offsetWidth;

        funeralContent.classList.add('show-video');

        startTypewriter();

        setTimeout(() => {
            video.play().catch(() => {});
        }, 800);
    }, 800);
}

function skipFuneralVideo() {
    const warning = document.getElementById('funeral-warning');
    const funeralContent = document.getElementById('funeral-content');
    const video = document.getElementById('funeral-video');

    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    if (warning) warning.style.display = 'none';
    if (funeralContent) funeralContent.style.display = 'none';

    const letterSection = document.getElementById('letter');
    if (letterSection) {
        letterSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========== TYPEWRITER EFFECT ==========
function startTypewriter() {
    const lines = [
        'Hoy el cielo se viste de luz...',
        'Cada estrella eres tú, brillando para siempre.',
        'Tu voz ecoa en el viento,',
        'tu abrazo vive en nuestro corazón.',
        'Porque el amor que nos diste nunca muere.'
    ];

    const elements = [
        document.getElementById('typewriter-1'),
        document.getElementById('typewriter-2'),
        document.getElementById('typewriter-3'),
        document.getElementById('typewriter-4'),
        document.getElementById('typewriter-5')
    ];

    let currentLine = 0;

    function typeLine(index) {
        if (index >= lines.length) return;

        const el = elements[index];
        const text = lines[index];

        el.classList.add('active');
        el.classList.add('typing');

        const charCount = text.length;
        el.style.width = charCount + 'ch';
        el.textContent = '';

        let charIndex = 0;

        function typeChar() {
            if (charIndex < charCount) {
                el.textContent = text.substring(0, charIndex + 1);
                charIndex++;
                const delay = charIndex === 1 ? 300 : (45 + Math.random() * 35);
                setTimeout(typeChar, delay);
            } else {
                el.classList.remove('typing');
                el.classList.add('done');
                el.style.width = 'auto';
                el.style.whiteSpace = 'normal';

                setTimeout(() => {
                    typeLine(index + 1);
                }, 900);
            }
        }

        typeChar();
    }

    typeLine(0);
}

// ========== SCROLL OBSERVER ==========
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    const targets = [
        '.memory-photo-3d',
        '.memory-text-content',
        '.section-heading',
        '.gallery-card',
        '.letter-paper',
        '.final-image-wrapper',
        '.final-phrase',
        '.final-title',
        '.final-subtitle',
        '.final-divider',
        '.magic-image-wrapper',
        '.magic-text'
    ];

    targets.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => observer.observe(el));
    });
}

// ========== MEMORY PARALLAX (solo escritorio) ==========
function initMemoryParallax() {
    const photos = document.querySelectorAll('.memory-photo-3d');

    function onScroll() {
        photos.forEach(photo => {
            const rect = photo.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            const offset = (centerY - viewCenter) / window.innerHeight;

            const rotateY = offset * 12;
            const translateY = offset * -30;
            const scale = 1 - Math.abs(offset) * 0.06;

            if (photo.classList.contains('in-view')) {
                photo.style.transform = `
                    translateY(${translateY}px)
                    rotateY(${rotateY}deg)
                    rotateX(${offset * -6}deg)
                    scale(${Math.max(scale, 0.88)})
                `;
            }
        });

        const heroLayers = document.querySelectorAll('.hero-layer');
        heroLayers.forEach((layer, i) => {
            const speed = (i + 1) * 0.025;
            layer.style.transform = `translateY(${window.scrollY * speed}px)`;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
}

// ========== FINAL PETALS ==========
function initFinalPetals() {
    const container = document.getElementById('final-petals');
    if (!container) return;

    const maxPetals = isMobile ? 4 : 8;

    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'petal';

        const left = Math.random() * 100;
        const size = Math.random() * 8 + 6;
        const duration = Math.random() * 6 + 6;
        const delay = Math.random() * 3;
        const hue = 35 + Math.random() * 15;

        petal.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background: hsl(${hue}, 50%, 75%);
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        container.appendChild(petal);
        setTimeout(() => petal.remove(), (duration + delay) * 1000);
    }

    setInterval(() => {
        const count = isMobile ? 1 : 3;
        for (let i = 0; i < count; i++) createPetal();
    }, isMobile ? 4000 : 2500);

    for (let i = 0; i < maxPetals; i++) createPetal();
}

// ========== PERFORMANCE ==========
document.addEventListener('visibilitychange', () => {
    const anims = document.getAnimations();
    if (document.hidden) {
        anims.forEach(a => a.pause());
    } else {
        anims.forEach(a => a.play());
    }
});

// ========== CONSOLE ==========
console.log('%c✿ Memorial creado con amor', 'color: #c9a96e; font-size: 16px; font-family: serif;');
