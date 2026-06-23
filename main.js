// ── Nav scroll shadow ─────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ── Mobile menu toggle ────────────────────
const toggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const toggleSpans = toggle.querySelectorAll('span');

toggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggleSpans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
    toggleSpans[1].style.opacity = open ? '0' : '';
    toggleSpans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggleSpans[0].style.transform = '';
        toggleSpans[1].style.opacity = '';
        toggleSpans[2].style.transform = '';
    });
});

// ── Scroll-reveal animations ──────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.product-card, .step, .phil-card, .gift-card, .gallery-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ── FAQ accordion ─────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const wasOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));

        // Open clicked (unless it was already open)
        if (!wasOpen) item.classList.add('open');
    });
});

// ── Newsletter form ───────────────────────
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        const success = document.getElementById('newsletterSuccess');
        input.value = '';
        success.classList.add('visible');
        setTimeout(() => success.classList.remove('visible'), 4000);
        showToast('✨ You\'re on the list! We\'ll email you when the next batch drops.');
    });
}

// ── Toast helper ──────────────────────────
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), 3000);
}
