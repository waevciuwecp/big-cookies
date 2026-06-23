// ── Nav scroll shadow + active link ────────
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

// ── Cookie parallax ───────────────────────
const heroCookie = document.getElementById('heroCookie');
if (heroCookie) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const rotate = scrollY * 0.08;
                const translateY = scrollY * 0.03;
                heroCookie.style.transform = `rotate(${rotate}deg) translateY(${translateY}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ── Batch countdown ───────────────────────
function updateCountdown() {
    const now = new Date();
    const day = now.getDay();
    let daysUntilFriday = (5 - day + 7) % 7;
    if (daysUntilFriday === 0 && now.getHours() >= 12) daysUntilFriday = 7;

    const el = document.getElementById('batchCountdown');
    if (!el) return;

    if (daysUntilFriday === 0) {
        el.textContent = 'today — order now!';
    } else if (daysUntilFriday === 1) {
        el.textContent = 'tomorrow';
    } else {
        el.textContent = `in ${daysUntilFriday} days`;
    }
}

const batchBanner = document.getElementById('batchBanner');
let bannerShown = false;
window.addEventListener('scroll', () => {
    if (!bannerShown && window.scrollY > window.innerHeight * 0.6) {
        batchBanner.classList.add('visible');
        bannerShown = true;
    }
});
updateCountdown();

// ── Build Your Box ────────────────────────
const MAX_SLOTS = 6;
const selectedCookies = [];
const builderPicker = document.getElementById('builderPicker');
const builderSlots = document.getElementById('builderSlots');
const builderCount = document.getElementById('builderCount');
const builderTotal = document.getElementById('builderTotal');
const builderSubmit = document.getElementById('builderSubmit');
const builderReset = document.getElementById('builderReset');

function updateBuilderBox() {
    const slots = builderSlots.querySelectorAll('.builder-slot');
    slots.forEach((slot, i) => {
        if (i < selectedCookies.length) {
            const cookie = selectedCookies[i];
            slot.classList.add('filled');
            slot.classList.remove('empty');
            slot.innerHTML = `<div class="slot-cookie cookie-icon flavor-${cookie.id}" style="width:36px;height:36px;margin:0"></div>`;
        } else {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.innerHTML = '';
        }
    });

    const count = selectedCookies.length;
    const total = selectedCookies.reduce((sum, c) => sum + parseFloat(c.price), 0);
    builderCount.textContent = count;
    builderTotal.textContent = '$' + total.toFixed(2);
    builderSubmit.disabled = count === 0;
    builderReset.disabled = count === 0;

    builderPicker.querySelectorAll('.builder-item').forEach(item => {
        const id = item.dataset.id;
        const isSelected = selectedCookies.some(c => c.id === id);
        item.classList.toggle('selected', isSelected);
        item.querySelector('.builder-check').textContent = isSelected ? '✓' : '+';
    });
}

builderPicker.querySelectorAll('.builder-item').forEach(item => {
    item.addEventListener('click', () => {
        const id = item.dataset.id;
        const name = item.dataset.name;
        const price = item.dataset.price;

        const existingIndex = selectedCookies.findIndex(c => c.id === id);
        if (existingIndex >= 0) {
            selectedCookies.splice(existingIndex, 1);
        } else if (selectedCookies.length < MAX_SLOTS) {
            selectedCookies.push({ id, name, price });
        } else {
            showToast('Box is full! Remove a cookie first.');
            return;
        }
        updateBuilderBox();
    });
});

builderSubmit.addEventListener('click', () => {
    if (selectedCookies.length === 0) return;
    const total = selectedCookies.reduce((sum, c) => sum + parseFloat(c.price), 0).toFixed(2);
    showToast(selectedCookies.length + ' cookies in box — $' + total);
});

builderReset.addEventListener('click', () => {
    selectedCookies.length = 0;
    updateBuilderBox();
    showToast('Box cleared.');
});

// ── Scroll-reveal animations ──────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = entry.target.dataset.originalTransform
                ? entry.target.dataset.originalTransform
                : 'translateY(0)';
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.product-card, .step, .phil-card, .gift-card, .polaroid').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    if (el.classList.contains('tilt-left')) {
        el.dataset.originalTransform = 'rotate(-2.5deg)';
    } else if (el.classList.contains('tilt-right')) {
        el.dataset.originalTransform = 'rotate(3deg)';
    } else if (el.classList.contains('tilt-none')) {
        el.dataset.originalTransform = 'rotate(0.5deg)';
    }
    observer.observe(el);
});

// ── FAQ accordion ─────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
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
        showToast('You\'re on the list! We\'ll email you when the next batch drops.');
    });
}

// ── Back to top ──────────────────────────
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Product card tap-to-flip (mobile) ─────
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // Only toggle on direct card click, not on inner element interactions
        if (e.target.closest('.product-card-back') || window.innerWidth > 900) return;
        card.classList.toggle('flipped');
    });
    // Unflip when mouse leaves (desktop reset after tap)
    card.addEventListener('mouseleave', () => {
        card.classList.remove('flipped');
    });
});

// ── Batch counter ─────────────────────────
(function() {
    const batchEl = document.getElementById('batchNum');
    if (batchEl) {
        // Base batch 47 from June 2024, +1 per week since
        const start = new Date('2024-06-01');
        const now = new Date();
        const weeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
        batchEl.textContent = 47 + weeks;
    }
})();

// ── Toast helper ──────────────────────────
function showToast(msg, icon) {
    const toast = document.getElementById('toast');
    toast.innerHTML = (icon ? `<span class="toast-icon">${icon}</span>` : '') + msg;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), 3000);
}
