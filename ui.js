// ── Big Cookies — Shared UI Chrome ──────────
(function() {
    // ── SVG sprite defs ──
    const svgDefs = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"><defs><symbol id="icon-star" viewBox="0 0 24 24"><path d="M12 2l2.8 6.6L22 9.5l-5 5.4 1.5 7.1-6.5-3.8-6.5 3.8L7 14.9l-5-5.4 7.2-.9L12 2z" fill="currentColor"/></symbol><symbol id="icon-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 6l10 7 10-7" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol><symbol id="icon-reset" viewBox="0 0 24 24"><path d="M1 4v6h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 15.5a9 9 0 102.8-8.2L1 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol></defs></svg>';

    // ── Determine current page for active link ──
    const path = window.location.pathname;
    const isPage = (name) => path.includes(name);
    const pageContext = isPage('about.html') ? 'About Us' :
        isPage('archive.html') ? 'Archive' :
        isPage('awards.html') ? 'Awards' :
        isPage('factory.html') ? 'Open Day' :
        isPage('faculty.html') ? 'Faculty' :
        isPage('faq.html') ? 'FAQ' :
        isPage('kitchen.html') ? 'The Kitchen' :
        isPage('news.html') ? 'News' : '';
    const kitchenActive = isPage('kitchen.html') ? ' active' : '';
    const faqActive = isPage('faq.html') ? ' active' : '';
    const pageChip = pageContext ? '<span class="nav-page-chip" aria-label="Current page">' + pageContext + '</span>' : '';

    // ── URL helper for subdirectory-safe links ──
    var U = window.BigCookiesURL;

    // ── Shared nav ──
    const navHTML = svgDefs + '\n' +
    '<nav class="nav" id="nav"><div class="nav-inner">' +
    '<div class="nav-brand-group"><a href="' + U.home() + '" class="nav-logo"><span class="logo-icon" aria-hidden="true"></span>Big<span>.</span>Cookies</a>' + pageChip + '</div>' +
    '<ul class="nav-links">' +
    '<li><a href="' + U.home('products') + '">Our Cookies</a></li>' +
    '<li><a href="' + U.home('gifts') + '">Gift Boxes</a></li>' +
    '<li><a href="' + U.home('build') + '">Build a Box <span class="cart-badge" id="cartBadge" style="display:none">0</span></a></li>' +
    '<li><a href="kitchen.html" class="' + kitchenActive.trim() + '">The Kitchen</a></li>' +
    '<li><a href="faq.html" class="' + faqActive.trim() + '">FAQ</a></li>' +
    '<li><a href="' + U.home('order') + '" class="nav-cta">Order Now</a></li>' +
    '</ul>' +
    '<button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode"><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg></button>' +
    '<button class="nav-toggle" id="navToggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>' +
    '</div></nav>' +
    '<div class="mobile-menu" id="mobileMenu">' +
    '<div class="mobile-menu-sheet"><div class="mobile-menu-kicker">Navigation / Big Cookies</div><div class="mobile-menu-current">' + (pageContext || 'Homepage') + '</div><div class="mobile-menu-group"><a href="' + U.home('products') + '">Our Cookies</a><a href="' + U.home('gifts') + '">Gift Boxes</a><a href="' + U.home('build') + '">Build a Box</a></div><div class="mobile-menu-group"><a href="kitchen.html" class="' + kitchenActive.trim() + '">The Kitchen</a><a href="faq.html" class="' + faqActive.trim() + '">FAQ</a><a href="about.html">About Us</a></div><a href="' + U.home('order') + '" class="mobile-menu-cta">Order Now</a></div>' +
    '</div>' +
    '<div class="batch-banner" id="batchBanner"><span class="batch-icon"><svg width="14" height="18" viewBox="0 0 16 20" aria-hidden="true"><path d="M8 0c-2 5-5 8-5 12a5 5 0 0010 0c0-4-3-7-5-12z" fill="#E8A850"/><path d="M8 8c-1.2 3-2.5 5-2.5 7a2.5 2.5 0 005 0c0-2-1.3-4-2.5-7z" fill="#F5C85A"/></svg></span><span class="batch-num">Batch #<span id="batchNum">47</span></span><span>&middot;</span><span>Next batch drops <strong id="batchCountdown">this Friday</strong></span><span class="batch-dot"></span><button class="batch-close" id="batchClose" aria-label="Close banner">&times;</button></div>';

    // ── Shared footer ──
    const footerHTML =
    '<footer class="footer"><div class="footer-topline">' +
    '<div class="footer-studio-note"><span class="footer-kicker">From The Portland Bench</span><h3>Slow dough, warm boxes, no shortcuts worth hiding.</h3><p>Big Cookies is still run like a small bakery with a loud set of standards. Every page on this site leads back to the same kitchen.</p></div>' +
    '<div class="footer-service-board"><div class="footer-service-chip"><span>Dispatch rhythm</span><strong>Fresh batches every Friday</strong></div><div class="footer-service-chip"><span>Visit window</span><strong>Open Day every third Saturday</strong></div><div class="footer-service-chip"><span>Write to us</span><strong>Real replies, usually same day</strong></div></div>' +
    '</div><div class="footer-grid">' +
    '<div class="footer-col"><h4>Shop</h4><ul><li><a href="' + U.home('products') + '">Our Cookies</a></li><li><a href="' + U.home('gifts') + '">Gift Boxes</a></li><li><a href="' + U.home('build') + '">Build a Box</a></li><li><a href="' + U.home('order') + '">Order Now</a></li><li><a href="kitchen.html">The Kitchen</a></li><li><a href="archive.html">Product Archive</a></li></ul></div>' +
    '<div class="footer-col"><h4>About</h4><ul><li><a href="about.html">About Us</a></li><li><a href="' + U.home('philosophy') + '">Philosophy</a></li><li><a href="' + U.home('gallery') + '">Our Kitchen</a></li><li><a href="faculty.html">Our Faculty</a></li><li><a href="awards.html">Awards</a></li><li><a href="news.html">News</a></li><li><a href="factory.html">Open Day</a></li><li><a href="faq.html">FAQ</a></li><li><a href="mailto:hello@big-cookies.yaoyy.moe">Contact</a></li></ul></div>' +
    '<div class="footer-col"><h4>Big Cookies</h4><ul><li><a href="#" onclick="document.getElementById(\'newsletterForm\')&&document.getElementById(\'newsletterForm\').querySelector(\'input\').focus();return false">Newsletter</a></li><li><a href="' + U.home('how') + '">How It Works</a></li><li style="margin-top:0.5rem;color:#8B6F5C;font-size:0.6875rem">@bigcookies on Instagram</li><li style="margin-top:0.75rem;color:#C8853E;font-size:0.6875rem;font-style:italic;line-height:1.5;max-width:180px" id="bakingTip"></li></ul></div>' +
    '</div><div class="footer-bottom"><p>&copy; <span class="dhc" data-of="year-range">2024–2026</span> Big Cookies. Baked with love in Portland, OR &nbsp;<span class="pdx-seal" title="Portland, Oregon — Est. 2024">🌲 PDX</span>&nbsp;&middot;&nbsp;<a href="mailto:hello@big-cookies.yaoyy.moe"><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px" aria-hidden="true"><use href="#icon-mail"/></svg> hello@big-cookies.yaoyy.moe</a><br><span style="font-size:0.6875rem;color:#8B6F5C;margin-top:0.25rem;display:inline-block">🕒 Page baked fresh <span id="pageBakedTime"></span></span></p></div></footer>';

    // ── Mobile floating action button ──
    var fabHTML = '<a href="' + U.home('build') + '" class="mobile-fab" aria-label="Build a Box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>Build a Box</a>';

    // ── Inject into page ──
    document.addEventListener('DOMContentLoaded', function() {
        var navEl = document.getElementById('site-nav');
        var footerEl = document.getElementById('site-footer');
        if (navEl) navEl.outerHTML = navHTML;
        if (footerEl) footerEl.outerHTML = footerHTML;
        // Inject FAB
        var temp = document.createElement('div');
        temp.innerHTML = fabHTML;
        document.body.appendChild(temp.firstElementChild);

        // Re-trigger nav.js initialization by dispatching a custom event
        window.dispatchEvent(new CustomEvent('ui-ready'));
    });
})();
