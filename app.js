// ── Big Cookies — Animations, Forms & Easter Eggs ─

// ── Hero word cycle ─────────────────────────
(function() {
    var el = document.querySelector('.hero h1 .gold');
    if (!el) return;
    var words = ['worth the wait', 'worth the calories', 'worth every crumb', 'worth sharing', 'worth the hype'];
    var i = 0;
    setInterval(function() {
        i = (i + 1) % words.length;
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s';
        setTimeout(function() {
            el.textContent = words[i];
            el.style.opacity = '1';
        }, 300);
    }, 3500);
})();


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

// ── Cookies baked today (live estimate) ──────
(function() {
    function initBakedCounter() {
        var el = document.getElementById('batchBanner');
        if (!el) { setTimeout(initBakedCounter, 200); return; }
        var start = new Date();
        start.setHours(4, 30, 0, 0); // 4:30am today
        if (new Date() < start) start.setDate(start.getDate() - 1);
        function updateBaked() {
            var mins = Math.floor((new Date() - start) / 60000);
            var baked = Math.min(300, Math.floor(mins * 0.48));
            var span = document.getElementById('bakedCount');
            if (span) span.textContent = baked;
        }
        var dot = el.querySelector('.batch-dot');
        if (dot && !document.getElementById('bakedCount')) {
            var span = document.createElement('span');
            span.innerHTML = '&nbsp;·&nbsp;<span id="bakedCount">0</span> baked today';
            span.style.fontSize = '0.8125rem';
            dot.parentNode.insertBefore(span, dot);
        }
        updateBaked();
        setInterval(updateBaked, 30000);
    }
    initBakedCounter();
})();


var batchBanner = document.getElementById('batchBanner');
var bannerShown = false;
window.addEventListener('scroll', function() {
    if (!bannerShown && window.scrollY > window.innerHeight * 0.6) {
        if (!batchBanner) batchBanner = document.getElementById('batchBanner');
        if (batchBanner) { batchBanner.classList.add('visible'); bannerShown = true; }
    }
}, {passive: true});

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

function initScrollReveal() {
    document.querySelectorAll('.product-card, .step, .phil-card, .gift-card, .polaroid, .faculty-card, .award-card, .news-card, .about-block, .od-feature').forEach(function(el, i) {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = '1';
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
}
initScrollReveal();
// Re-run after data-loader renders for dynamically-added elements only
window.addEventListener('data-ready', function() { setTimeout(initScrollReveal, 100); }, {once: true});

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
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        if (btn.hasAttribute('data-faq-bound')) return;
        btn.setAttribute('data-faq-bound', '1');
        var item = btn.parentElement;
        if (item.classList.contains('open')) btn.setAttribute('aria-expanded', 'true');
        else btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', function() {
            var item = this.parentElement;
            var wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(function(open) {
                open.classList.remove('open');
                open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!wasOpen) {
                item.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}
initFAQ();
// Re-bind after data-loader renders
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initFAQ, 800); });
} else {
    setTimeout(initFAQ, 800);
}

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



// ── Dynamic Open Day date ───────────────────
(function() {
    var el = document.querySelector('.open-day-date');
    if (!el) return;
    function nthWeekday(year, month, weekday, n) {
        var d = new Date(year, month, 1);
        var count = 0;
        while (d.getMonth() === month) {
            if (d.getDay() === weekday) { count++; if (count === n) return d; }
            d.setDate(d.getDate() + 1);
        }
        return null;
    }
    var now = new Date();
    var date = nthWeekday(now.getFullYear(), now.getMonth(), 6, 3); // 3rd Saturday
    if (!date || date <= now) {
        date = nthWeekday(now.getFullYear(), now.getMonth() + 1, 6, 3);
    }
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    el.textContent = 'Saturday, ' + months[date.getMonth()] + ' ' + date.getDate();

    // Show countdown timer
    var cdEl = document.querySelector('.open-day-meta');
    if (cdEl && date) {
        function updateCD() {
            var diff = date - new Date();
            if (diff <= 0) { cdEl.innerHTML = 'Today! &nbsp;·&nbsp; Free admission &nbsp;·&nbsp; Kids welcome'; return; }
            var d = Math.floor(diff/86400000);
            var h = Math.floor((diff%86400000)/3600000);
            var m = Math.floor((diff%3600000)/60000);
            cdEl.innerHTML = '9:00am – 2:00pm &nbsp;·&nbsp; Free admission &nbsp;·&nbsp; Kids welcome &nbsp;·&nbsp; <strong>' + d + 'd ' + h + 'h ' + m + 'm</strong> away';
        }
        updateCD();
        setInterval(updateCD, 60000);
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


// ── Testimonial slider ──────────────────────
(function() {
    function initSlider() {
        var container = document.getElementById('testimonialSlider');
        if (!container) return;
        var slides = container.querySelectorAll('.testimonial');
        var dotsEl = document.getElementById('sliderDots');
        if (slides.length < 2) return;

        var current = 0;
        var timer;

        // Build dots
        dotsEl.innerHTML = '';
        slides.forEach(function(_, i) {
            var dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
            dot.addEventListener('click', function(e) { e.stopPropagation(); goTo(i); });
            dotsEl.appendChild(dot);
        });

        function goTo(i) {
            slides[current].classList.remove('active');
            dotsEl.children[current].classList.remove('active');
            current = i;
            slides[current].classList.add('active');
            dotsEl.children[current].classList.add('active');
            resetTimer();
        }

        function next() { goTo((current + 1) % slides.length); }
        function prev() { goTo((current - 1 + slides.length) % slides.length); }
        function resetTimer() { clearInterval(timer); timer = setInterval(next, 5000); }

        
        // Click left 1/3 → prev, right 1/3 → next, middle → no-op
        container.addEventListener('click', function(e) {
            var rect = container.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var third = rect.width / 3;
            if (x < third) { prev(); }
            else if (x > third * 2) { next(); }
        });

        // Pause on hover
        container.addEventListener('mouseenter', function() { clearInterval(timer); });
        container.addEventListener('mouseleave', function() { timer = setInterval(next, 5000); });

        // Touch swipe support
        var touchX = 0;
        container.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; });
        container.addEventListener('touchend', function(e) {
            var diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
        });

        resetTimer();
    }

    // Run after data-loader renders
    var _sliderInited = false;
    function tryInitSlider() {
        if (_sliderInited) return;
        // If data-ready already fired (or no data-load on page), init after short delay
        var hasDataLoad = document.querySelector('[data-load]');
        if (!hasDataLoad) { _sliderInited = true; initSlider(); return; }
        // Otherwise wait for data-ready event (data-loader signals when done)
        window.addEventListener('data-ready', function() {
            if (_sliderInited) return;
            _sliderInited = true;
            setTimeout(initSlider, 100);
        }, {once: true});
        // Fallback: if data-ready never fires, init after 3s anyway
        setTimeout(function() {
            if (_sliderInited) return;
            _sliderInited = true;
            initSlider();
        }, 3000);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitSlider);
    } else {
        tryInitSlider();
    }
})();


// ── Back to top ──────────────────────────
var backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', function() {
        backToTop.classList.toggle('visible', window.scrollY > 600);
    }, {passive: true});
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Product card tap-to-flip (mobile) ─────
document.querySelectorAll('.product-card').forEach(card => {
    if (card.hasAttribute('data-flip-bound')) return;
    card.setAttribute('data-flip-bound', '1');
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

// ── Footer year auto-update ──────────────
(function() {
    function updateYear() {
        var el = document.getElementById('copyYear');
        if (el) { el.textContent = new Date().getFullYear(); return; }
        setTimeout(updateYear, 500);
    }
    updateYear();
})();


// ── Re-bind after data-loader renders ────────
window.addEventListener('data-ready', function() {
    setTimeout(function() {
        // Re-scan for new dynamically-loaded elements (idempotent via data-reveal-bound)
        initScrollReveal();

        // Re-bind tap-to-flip for new product cards (idempotent via data-flip-bound)
        document.querySelectorAll('.product-card').forEach(function(card) {
            if (card.hasAttribute('data-flip-bound')) return;
            card.setAttribute('data-flip-bound', '1');
            var flipTimer;
            card.addEventListener('click', function(e) {
                if (e.target.closest('.product-card-back') || window.innerWidth > 900) return;
                var wasFlipped = card.classList.contains('flipped');
                card.classList.toggle('flipped');
                clearTimeout(flipTimer);
                if (!wasFlipped) flipTimer = setTimeout(function() { card.classList.remove('flipped'); }, 3000);
            });
            card.addEventListener('mouseleave', function() {
                card.classList.remove('flipped');
                clearTimeout(flipTimer);
            });
        });
    }, 200);
}, {once: true});


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
