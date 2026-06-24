// ── Big Cookies — Navigation, Theme & Scroll ────
(function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) {
        // Nav not injected yet, wait for ui-ready
        window.addEventListener('ui-ready', initNav, {once: true});
        return;
    }

    // Detect homepage
    var isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

    // Intercept nav links with leading /# to avoid page reload on homepage
    document.querySelectorAll('.nav-links a[href^="/#"]').forEach(function(a) {
        if (a.hasAttribute('data-nav-bound')) return;
        a.setAttribute('data-nav-bound', '1');
        a.addEventListener('click', function(e) {
            if (!isHome) return; // let normal navigation happen on secondary pages
            e.preventDefault();
            var hash = a.getAttribute('href').split('#')[1];
            var target = document.getElementById(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', '#' + hash);
            }
        });
    });
    // Also intercept mobile menu links
    document.querySelectorAll('.mobile-menu a[href^="/#"]').forEach(function(a) {
        if (a.hasAttribute('data-nav-bound')) return;
        a.setAttribute('data-nav-bound', '1');
        a.addEventListener('click', function(e) {
            if (!isHome) return;
            e.preventDefault();
            var hash = a.getAttribute('href').split('#')[1];
            var target = document.getElementById(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', '#' + hash);
            }
        });
    });

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

// ── Mobile menu toggle (event delegation) ──
document.addEventListener('click', function(e) {
    var toggle = e.target.closest('#navToggle');
    if (!toggle) {
        // Close on mobile-menu backdrop click
        var menu = document.getElementById('mobileMenu');
        if (menu && menu.classList.contains('open') && e.target === menu) {
            menu.classList.remove('open');
            toggle = document.getElementById('navToggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                var spans = toggle.querySelectorAll('span');
                if (spans[0]) spans[0].style.transform = '';
                if (spans[1]) spans[1].style.opacity = '';
                if (spans[2]) spans[2].style.transform = '';
            }
            document.body.style.overflow = '';
        }
        return;
    }

    e.preventDefault();
    var menu = document.getElementById('mobileMenu');
    if (!menu) return;

    var open = !menu.classList.contains('open');
    if (open) {
        menu.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        var spans = toggle.querySelectorAll('span');
        if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        if (spans[1]) spans[1].style.opacity = '0';
        if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        var sp = toggle.querySelectorAll('span');
        if (sp[0]) sp[0].style.transform = '';
        if (sp[1]) sp[1].style.opacity = '';
        if (sp[2]) sp[2].style.transform = '';
    }
});

// Close mobile menu when clicking a link inside it
document.addEventListener('click', function(e) {
    var link = e.target.closest('.mobile-menu a');
    if (!link) return;
    var menu = document.getElementById('mobileMenu');
    if (!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    var toggle = document.getElementById('navToggle');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        var spans = toggle.querySelectorAll('span');
        if (spans[0]) spans[0].style.transform = '';
        if (spans[1]) spans[1].style.opacity = '';
        if (spans[2]) spans[2].style.transform = '';
    }
    document.body.style.overflow = '';
});

// Close on Escape
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    var menu = document.getElementById('mobileMenu');
    if (!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    var toggle = document.getElementById('navToggle');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        var spans = toggle.querySelectorAll('span');
        if (spans[0]) spans[0].style.transform = '';
        if (spans[1]) spans[1].style.opacity = '';
        if (spans[2]) spans[2].style.transform = '';
    }
    document.body.style.overflow = '';
});

// ── Scroll progress bar ───────────────────
(function() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function updateProgress() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = h > 0 ? Math.min(100, (window.scrollY / h) * 100) + '%' : '0%';
    }
    window.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress, {passive: true});
    updateProgress();
})();

// ── Cart badge updater ──
window.addEventListener('cart-update', function(e) {
    var badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = e.detail.count;
        badge.style.display = e.detail.count > 0 ? 'inline-flex' : 'none';
    }
});

})(); // close initNav IIFE
