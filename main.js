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

// ── Cookie parallax ───────────────────────
const heroCookie = document.getElementById('heroCookie');
if (heroCookie) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const rotate = scrollY * 0.08; // ~8deg per 100px scroll
                const translateY = scrollY * 0.03; // subtle vertical shift
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
    const day = now.getDay(); // 0=Sun, 5=Friday
    let daysUntilFriday = (5 - day + 7) % 7;
    if (daysUntilFriday === 0) {
        // If it's Friday, check if before noon
        if (now.getHours() < 12) {
            daysUntilFriday = 0;
        } else {
            daysUntilFriday = 7;
        }
    }

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

// Show banner after hero scrolls past
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

function updateBuilderBox() {
    // Update slots
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

    // Update summary
    const count = selectedCookies.length;
    const total = selectedCookies.reduce((sum, c) => sum + parseFloat(c.price), 0);
    builderCount.textContent = count;
    builderTotal.textContent = '$' + total.toFixed(2);
    builderSubmit.disabled = count === 0;

    // Update picker selected states
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
        const emoji = item.dataset.emoji;

        const existingIndex = selectedCookies.findIndex(c => c.id === id);
        if (existingIndex >= 0) {
            selectedCookies.splice(existingIndex, 1);
        } else if (selectedCookies.length < MAX_SLOTS) {
            selectedCookies.push({ id, name, price, emoji });
        } else {
            showToast('Box is full! Remove a cookie first.');
            return;
        }
        updateBuilderBox();
    });
});

builderSubmit.addEventListener('click', () => {
    if (selectedCookies.length === 0) return;
    const names = selectedCookies.map(c => c.name).join(', ');
    const total = selectedCookies.reduce((sum, c) => sum + parseFloat(c.price), 0).toFixed(2);
    showToast(`🍪 ${selectedCookies.length} cookies added: ${names} — $${total}`);
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

document.querySelectorAll('.product-card, .step, .phil-card, .gift-card, .polaroid').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    if (el.classList.contains('tilt-left')) {
        el.dataset.originalTransform = 'rotate(-2.5deg)';
    } else if (el.classList.contains('tilt-right')) {
        el.dataset.originalTransform = 'rotate(3deg)';
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

// ── Toast helper ──────────────────────────
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), 3000);
}
