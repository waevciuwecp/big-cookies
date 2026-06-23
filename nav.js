// ── Big Cookies — Navigation, Theme & Scroll ────
(function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) { 
        // Nav not injected yet, wait for ui-ready
        window.addEventListener('ui-ready', initNav, {once: true});
        return;
    }
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    let activeIdx = -1;
    sections.forEach((sec, i) => {
        if (sec && sec.offsetTop <= scrollY) activeIdx = i;
    });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === activeIdx));
}

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
    updateActiveNav();

    // Fade scroll indicator
    const indicator = document.getElementById('scrollIndicator');
    if (indicator && window.scrollY > 100) {
        indicator.classList.add('faded');
    } else if (indicator) {
        indicator.classList.remove('faded');
    }
});

// ── Mobile menu toggle ────────────────────
const toggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const toggleSpans = toggle.querySelectorAll('span');

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggleSpans[0].style.transform = '';
    toggleSpans[1].style.opacity = '';
    toggleSpans[2].style.transform = '';
    document.body.style.overflow = '';
}

toggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggleSpans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
    toggleSpans[1].style.opacity = open ? '0' : '';
    toggleSpans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    document.body.style.overflow = open ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
});

// Close on backdrop click
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
    }
});

// ── Scroll progress bar ───────────────────
(function() {
    const bar = document.getElementById('scrollProgress');
    function updateProgress() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = h > 0 ? Math.min(100, (window.scrollY / h) * 100) + '%' : '0%';
    }
    window.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress, {passive: true});
    updateProgress();
})();
