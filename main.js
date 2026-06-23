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

// ── Cookie parallax ───────────────────────
const heroCookie = document.getElementById('heroCookie');
if (heroCookie) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const rotate = Math.max(-15, Math.min(15, scrollY * 0.08));
                const translateY = scrollY * 0.03;
                heroCookie.style.transform = `rotate(${rotate}deg) translateY(${translateY}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ── Batch countdown (live) ────────────────
(function() {
    const el = document.getElementById('batchCountdown');
    if (!el) return;

    function getNextFridayNoon() {
        const now = new Date();
        const target = new Date(now);
        target.setDate(target.getDate() + ((5 - target.getDay() + 7) % 7));
        target.setHours(12, 0, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 7);
        return target;
    }

    function update() {
        const diff = getNextFridayNoon() - new Date();
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);

        if (d === 0 && h === 0) {
            el.textContent = `in ${m} min`;
        } else if (d === 0) {
            el.textContent = `in ${h}h ${m}m`;
        } else if (d === 1) {
            el.textContent = `tomorrow at noon`;
        } else {
            el.textContent = `in ${d} days`;
        }
    }

    update();
    setInterval(update, 60000);
})();

const batchBanner = document.getElementById('batchBanner');
let bannerShown = false;
window.addEventListener('scroll', () => {
    if (!bannerShown && window.scrollY > window.innerHeight * 0.6) {
        batchBanner.classList.add('visible');
        bannerShown = true;
    }
});

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
            slot.setAttribute('aria-label', cookie.name);
        } else {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.innerHTML = '';
            slot.setAttribute('aria-label', 'Empty slot');
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
        item.setAttribute('aria-checked', isSelected);
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

    // Keyboard: Enter/Space to toggle
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
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

const allIds=["classic","double","toffee","raspberry","caramel","matcha"];
document.getElementById("btnSurprise").addEventListener("click",()=>{selectedCookies.length=0;updateBuilderBox();const ids=[...allIds];for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}ids.forEach((id,i)=>{setTimeout(()=>{const it=builderPicker.querySelector("[data-id="+id+"]");if(it){selectedCookies.push({id,name:it.dataset.name,price:it.dataset.price});updateBuilderBox();if(i===5)showToast("Surprise mix ready!");}},i*80);});});

// Quick Fill: staff picks (sequential)
document.getElementById('btnQuickFill').addEventListener('click', () => {
    selectedCookies.length = 0;
    updateBuilderBox();
    const staffIds = ['double', 'caramel', 'classic', 'toffee', 'raspberry', 'matcha'];
    staffIds.forEach((id, i) => {
        setTimeout(() => {
            const item = builderPicker.querySelector(`[data-id="${id}"]`);
            if (item) {
                selectedCookies.push({
                    id, name: item.dataset.name, price: item.dataset.price
                });
                updateBuilderBox();
                if (i === staffIds.length - 1) {
                    showToast('Box filled with Staff Picks!');
                }
            }
        }, i * 80);
    });
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

document.querySelectorAll('.product-card, .step, .phil-card, .gift-card, .polaroid').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.style.transitionDelay = (i % 3) * 0.1 + 's';
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
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(open => {
            open.classList.remove('open');
            open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});
// Set initial state for the default-open FAQ item
document.querySelectorAll('.faq-item.open .faq-question').forEach(btn => btn.setAttribute('aria-expanded', 'true'));

// ── Order form ────────────────────────────
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Sorry, we\'re sold out! Next batch drops Friday.');
    });
}

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
    let flipTimer;
    card.addEventListener('click', (e) => {
        if (e.target.closest('.product-card-back') || window.innerWidth > 900) return;
        const wasFlipped = card.classList.contains('flipped');
        card.classList.toggle('flipped');
        clearTimeout(flipTimer);
        if (!wasFlipped) {
            flipTimer = setTimeout(() => card.classList.remove('flipped'), 3000);
        }
    });
    card.addEventListener('mouseleave', () => {
        card.classList.remove('flipped');
        clearTimeout(flipTimer);
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

// ── Theme toggle ──────────────────────────
(function() {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.setAttribute('data-theme', 'dark');
    }
    toggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
})();

// ── Cookie click easter egg ──────────────
(function() {
    let clicks = 0;
    const cookie = document.getElementById('heroCookie');
    if (cookie) {
        cookie.style.cursor = 'pointer';
        cookie.addEventListener('click', () => {
            clicks++;
            cookie.style.transition = 'transform 0.15s ease';
            cookie.style.transform = cookie.style.transform.replace(/scale\([^)]+\)/, '') + ' scale(1.1)';
            setTimeout(() => {
                cookie.style.transform = cookie.style.transform.replace(/ scale\([^)]+\)/, '');
            }, 150);
            if (clicks === 5) showToast('You found the secret cookie stash!');
            if (clicks === 10) showToast('Okay, that is a lot of cookies.');
            if (clicks === 20) showToast('You have officially eaten too many cookies.');
        });
    }
})();
