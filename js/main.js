/**
 * Cooperative Education Web App - Interactive UI & Effects
 * Features:
 * 0. Interactive Dark Cyber Network Canvas Background
 * 1. Scroll Progress Bar
 * 2. 3D Card Tilt & Dynamic Cursor Glow Effect
 * 3. Scroll-to-Top Floating Button
 * 4. Scroll Reveal Animations (IntersectionObserver)
 * 5. One-Click Address / Info Copy with Toast Notifications
 * 6. Profile Avatar Image Lightbox Modal
 * 7. Dark / Light Mode Theme Toggle
 */

// Immediate Theme Application (Prevents Flash of Unstyled Theme)
(function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initInteractiveBackground();
    initScrollProgressBar();
    initBackToTop();
    init3DCardGlow();
    initScrollReveal();
    initCopyButtons();
    initImageLightbox();
});

/* --------------------------------------------------------------------------
   0. INTERACTIVE DARK CYBER NETWORK CANVAS BACKGROUND
   -------------------------------------------------------------------------- */
function initInteractiveBackground() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.createElement('canvas');
    canvas.id = 'bg-network-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 28 : 58;
    const maxConnectionDistance = isMobile ? 95 : 140;

    const mouse = {
        x: null,
        y: null,
        radius: isMobile ? 90 : 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 150);
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.radius = Math.random() * 1.6 + 1;
            const colors = [
                'rgba(139, 92, 246, ', // Violet
                'rgba(99, 102, 241, ',  // Indigo
                'rgba(56, 189, 248, '   // Cyan
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.4 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);
                if (distance < mouse.radius) {
                    const force = (1 - distance / mouse.radius) * 0.035;
                    this.x -= dx * force;
                    this.y -= dy * force;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color}${this.alpha})`;
            ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const lineBaseColor = isLight ? 'rgba(124, 58, 237, ' : 'rgba(139, 92, 246, ';
        const mouseLineColor = isLight ? 'rgba(14, 165, 233, ' : 'rgba(56, 189, 248, ';

        // Draw node connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxConnectionDistance) {
                    const alpha = (1 - dist / maxConnectionDistance) * (isLight ? 0.18 : 0.2);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `${lineBaseColor}${alpha})`;
                    ctx.lineWidth = 0.75;
                    ctx.stroke();
                }
            }
        }

        // Draw mouse lines
        if (mouse.x !== null && mouse.y !== null) {
            for (let i = 0; i < particles.length; i++) {
                const dx = mouse.x - particles[i].x;
                const dy = mouse.y - particles[i].y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * (isLight ? 0.28 : 0.32);
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(particles[i].x, particles[i].y);
                    ctx.strokeStyle = `${mouseLineColor}${alpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                }
            }
        }

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        if (!prefersReducedMotion) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

/* --------------------------------------------------------------------------
   1. SCROLL PROGRESS BAR
   -------------------------------------------------------------------------- */
function initScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }, { passive: true });
}

/* --------------------------------------------------------------------------
   2. BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', 'เลื่อนขึ้นด้านบน');
    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
    `;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 280) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* --------------------------------------------------------------------------
   3. 3D CARD TILT & MOUSE SPOTLIGHT GLOW
   -------------------------------------------------------------------------- */
function init3DCardGlow() {
    // Only run on desktop devices with hover & mouse pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const interactiveCards = document.querySelectorAll('.card, .profile-header, .location-info, .details-section');

    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Subtle 3D tilt calculation for cards
            if (card.classList.contains('card')) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('card')) {
                card.style.transform = '';
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. SCROLL REVEAL ANIMATIONS
   -------------------------------------------------------------------------- */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.card, .details-section, .profile-header, .page-header');
    
    revealElements.forEach((el, index) => {
        el.classList.add('reveal-item');
        el.style.transitionDelay = `${(index % 4) * 0.08}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. COPY ADDRESS BUTTON WITH TOAST NOTIFICATION & STATE FEEDBACK
   -------------------------------------------------------------------------- */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.btn-copy-address');

    copyButtons.forEach(btn => {
        const originalHTML = btn.innerHTML;

        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy') || 
                               btn.closest('.location-info')?.querySelector('.location-address')?.innerText.trim();

            if (!textToCopy) return;

            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual button feedback
                btn.classList.add('copied');
                btn.innerHTML = `
                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span class="btn-copy-text">คัดลอกแล้ว! ✓</span>
                `;

                showToast('คัดลอกที่อยู่เรียบร้อยแล้ว!\u00A0📋');

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalHTML;
                }, 2200);
            } catch (err) {
                showToast('คัดลอก: ' + textToCopy);
            }
        });
    });
}

function showToast(message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    if (toast.hideTimeout) {
        clearTimeout(toast.hideTimeout);
    }

    toast.hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

/* --------------------------------------------------------------------------
   6. PROFILE IMAGE LIGHTBOX MODAL
   -------------------------------------------------------------------------- */
function initImageLightbox() {
    const images = document.querySelectorAll('.profile-header img, .card img');
    if (images.length === 0) return;

    // Create Modal element
    const modal = document.createElement('div');
    modal.className = 'image-lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'รูปภาพขนาดเต็ม');
    modal.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <button class="lightbox-close-btn" aria-label="ปิด">&times;</button>
            <img src="" alt="รูปภาพขยายใหญ่" class="lightbox-img">
            <p class="lightbox-caption"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const lightboxImg = modal.querySelector('.lightbox-img');
    const lightboxCaption = modal.querySelector('.lightbox-caption');
    const overlay = modal.querySelector('.lightbox-overlay');
    const closeBtn = modal.querySelector('.lightbox-close-btn');

    function openModal(src, alt) {
        lightboxImg.src = src;
        lightboxCaption.textContent = alt || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.setAttribute('title', 'คลิกเพื่อดูรูปภาพขนาดใหญ่');
        img.addEventListener('click', () => {
            openModal(img.currentSrc || img.src, img.alt);
        });
    });

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* --------------------------------------------------------------------------
   7. DARK / LIGHT MODE THEME TOGGLE
   -------------------------------------------------------------------------- */
function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    if (toggleBtns.length === 0) return;

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('theme', nextTheme);
            showToast(nextTheme === 'light' ? 'เปลี่ยนเป็นธีมสว่างแล้ว\u00A0☀️' : 'เปลี่ยนเป็นธีมมืดแล้ว\u00A0🌙');
        });
    });
}
