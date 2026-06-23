// ── Big Cookies — Animations, Forms & Easter Eggs ─
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

// ── Step & phil-card reveal ────────────────
(function() {
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.step').forEach(el => stepObserver.observe(el));
})();

// ── Philosophy stat count-up ────────────────
(function() {
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                if (!target || target <= 1) return;
                const duration = 1500;
                const start = performance.now();
                function tick(now) {
                    const progress = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.phil-card .num').forEach(el => {
        const text = el.textContent.trim();
        const num = parseInt(text.replace(/[^0-9]/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        if (num > 1) { el.dataset.target = num; el.dataset.suffix = suffix; statObserver.observe(el); }
    });
})();

// ── Kitchen chapter reveal ────────────────
(function() {
    const chapterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.kitchen-chapter, .kitchen-stats, .bakers-note').forEach(el => {
        chapterObserver.observe(el);
    });
})();

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


// ── Open Day form ───────────────────────────
(function() {
    const form = document.getElementById('openDayForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('You\'re on the list! Check your email for confirmation.');
            form.reset();
        });
    }
})();


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
    toggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
})();

// ── Cookie click easter egg ──────────────
(function() {
    let clicks = 0;
    let hideTimer;
    const cookie = document.getElementById('heroCookie');
    if (!cookie) return;

    // Create click counter badge
    const counter = document.createElement('span');
    counter.className = 'cookie-click-count';
    counter.textContent = '0';
    cookie.style.position = 'relative';
    cookie.appendChild(counter);

    cookie.style.cursor = 'pointer';
    cookie.addEventListener('click', () => {
        clicks++;
        counter.textContent = clicks;
        counter.classList.add('show');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => counter.classList.remove('show'), 2000);

        cookie.style.transition = 'transform 0.15s ease';
        const current = cookie.style.transform;
        const base = current.replace(/ scale\([^)]+\)/, '');
        cookie.style.transform = base + ' scale(1.1)';
        setTimeout(() => {
            cookie.style.transform = base;
        }, 150);

        const messages = {
            3: 'That tickles.',
            5: 'You found the secret cookie stash!',
            7: 'Seven clicks. Lucky number.',
            10: 'Okay, that is a lot of cookies.',
            15: 'You really like cookies, huh?',
            20: 'You have officially eaten too many cookies.',
            25: 'The cookie is getting tired.',
            42: 'The answer to life, the universe, and cookies.',
            69: 'Nice.',
            100: 'You have way too much free time.'
        };
        if (messages[clicks]) showToast(messages[clicks]);
    });
})();
