// ===== DOM Elements =====
const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const animatedValues = document.querySelectorAll('[data-value]');

// ===== Header Scroll Effect =====
let lastScrollY = 0;
let ticking = false;

function handleScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateHeader();
            ticking = false;
        });
        ticking = true;
    }
}

function updateHeader() {
    if (lastScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// ===== Mobile Menu Toggle =====
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-nav-link, .mobile-nav-list .btn').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Active Navigation Link Highlight =====
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.scrollY;
    const headerHeight = header.offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink, { passive: true });

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// ===== Animated Counter =====
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateValue(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5
});

animatedValues.forEach(el => {
    counterObserver.observe(el);
});

function animateValue(element) {
    const target = parseFloat(element.dataset.value);
    const decimals = parseInt(element.dataset.decimals) || 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = target * easeOut;
        
        element.textContent = current.toFixed(decimals);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toFixed(decimals);
        }
    }
    
    requestAnimationFrame(update);
}

// ===== Form Validation & Submission =====
if (contactForm) {
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    
    // Real-time validation
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('error')) {
                validateField(input);
            }
        });
    });
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Focus first error field
            const firstError = contactForm.querySelector('.form-group.error input, .form-group.error select');
            if (firstError) firstError.focus();
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate form submission
        try {
            await simulateSubmission();
            
            // Show success message
            formSuccess.classList.add('show');
            contactForm.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
        } catch (error) {
            showFormError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

function validateField(input) {
    const parent = input.parentElement;
    const errorEl = parent.querySelector('.form-error');
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'Field ini wajib diisi';
    }
    
    // Email validation
    if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            isValid = false;
            errorMessage = 'Format email tidak valid';
        }
    }
    
    // Phone validation
    if (input.type === 'tel' && input.value.trim()) {
        const phoneRegex = /^[\d\s\-+()]{10,}$/;
        if (!phoneRegex.test(input.value)) {
            isValid = false;
            errorMessage = 'Format nomor telepon tidak valid';
        }
    }
    
    // Update UI
    if (!isValid) {
        parent.classList.add('error');
        if (errorEl) errorEl.textContent = errorMessage;
    } else {
        parent.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
    }
    
    return isValid;
}

function simulateSubmission() {
    return new Promise((resolve) => {
        setTimeout(resolve, 1500);
    });
}

function showFormError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: #ff4757;
        color: white;
        border-radius: 8px;
        font-size: 0.9375rem;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== Parallax Effect for Hero Image =====
const heroImage = document.querySelector('.hero-image img');

if (heroImage && window.innerWidth > 992) {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    }, { passive: true });
}

// ===== Prefers Reduced Motion =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Disable animations
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
    });
}

// ===== Lazy Loading Images =====
const lazyImages = document.querySelectorAll('img[loading="lazy"]');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.focus();
    }
});

// ===== Print Mode =====
window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
    });
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Initial header state check
    handleScroll();
    
    // Trigger reveal for elements already in viewport
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
});