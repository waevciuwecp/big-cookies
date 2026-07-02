// ── Big Cookies — Navigation, Theme & Scroll ────
(function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) {
        // Nav not injected yet, wait for ui-ready
        window.addEventListener('ui-ready', initNav, {once: true});
        return;
    }

    // ── Subdirectory-aware helpers ──
    function isHomePath(pathname) {
        return pathname.endsWith('/') || pathname.endsWith('/index.html');
    }

    function getHomeURL() {
        var basePath = window.BigCookiesURL && window.BigCookiesURL.basePath
            ? window.BigCookiesURL.basePath
            : (window.location.pathname.endsWith('/')
                ? window.location.pathname
                : window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1));
        return new URL(basePath, window.location.origin);
    }

    function shouldInterceptHomeHashLink(anchor) {
        var href = anchor.getAttribute('href');
        if (!href) return false;

        var target = new URL(href, window.location.href);
        if (!target.hash) return false;

        var home = getHomeURL();

        return (
            target.origin === window.location.origin &&
            target.pathname.replace(/\/index\.html$/, '/') === home.pathname.replace(/\/index\.html$/, '/')
        );
    }

    // Detect homepage using subdirectory-aware logic
    var isHome = isHomePath(window.location.pathname);

    // Intercept nav links that point to the homepage with a hash
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(a) {
        if (a.hasAttribute('data-nav-bound')) return;
        a.setAttribute('data-nav-bound', '1');

        if (!shouldInterceptHomeHashLink(a)) return; // not a home-hash link

        a.addEventListener('click', function(e) {
            if (!isHome) return; // let normal navigation happen on secondary pages
            e.preventDefault();
            var target = new URL(a.getAttribute('href'), window.location.href);
            var hash = target.hash.replace('#', '');
            var el = document.getElementById(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', target.hash);
            }
        });
    });

    // Active nav state based on visible sections
    var navLinks = document.querySelectorAll('.nav-links a[href]');
    var sections = [];
    navLinks.forEach(function(a) {
        try {
            var target = new URL(a.getAttribute('href'), window.location.href);
            if (target.origin === window.location.origin && target.hash) {
                var el = document.getElementById(target.hash.replace('#', ''));
                if (el) sections.push({ el: el, a: a });
            }
        } catch(e) {}
    });

    function updateActiveNav() {
        var scrollY = window.scrollY + 100;
        var activeIdx = -1;
        sections.forEach(function(s, i) {
            if (s.el && s.el.offsetTop <= scrollY) activeIdx = i;
        });
        navLinks.forEach(function(a) { a.classList.remove('active'); });
        sections.forEach(function(s, i) {
            if (s.a && i === activeIdx) s.a.classList.add('active');
        });
    }

    window.addEventListener('scroll', function() {
        nav.classList.toggle('scrolled', window.scrollY > 10);
        updateActiveNav();

        // Fade scroll indicator
        var indicator = document.getElementById('scrollIndicator');
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
        var bar = document.createElement('div');
        bar.id = 'scrollProgress';
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.prepend(bar);
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
