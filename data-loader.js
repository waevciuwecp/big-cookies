// ── Big Cookies — JSON Data Loader ──────────
(function() {
    var templates = {
        'news-card': function(item) {
            var d = new Date(item.date);
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            var dateStr = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
            return '<article class="news-card"><div class="news-date">' + dateStr + '</div><h3 class="news-title">' + item.title + '</h3><p class="news-excerpt">' + item.excerpt + '</p><span class="news-read-time">' + (item.readTime||'') + '</span>' + (item.tag?' &nbsp;·&nbsp; <span class="news-tag">'+item.tag+'</span>':'') + '</article>';
        },
                'award-card': function(item) {
            var medalLabel = item.medal === 'gold' ? '1' : item.medal === 'silver' ? '2' : '3';
            if (item.year === '2024' && item.medal === 'gold') medalLabel = "'24";
            return '<div class="award-card"><div class="award-medal '+item.medal+'">'+medalLabel+'</div><div><span class="award-year">'+item.year+'</span><h3 class="award-title">'+item.title+'</h3><p class="award-desc">'+item.desc+'</p></div></div>';
        },
                                        'archive-card': function(item) {
            var statusClass = item.status === 'returning' ? 'archive-returning' : 'archive-retired';
            return '<div class="archive-card ' + statusClass + '"><div class="archive-season">' + item.season + '</div><h3 class="archive-name">' + item.name + '</h3><p class="archive-desc">' + item.desc + '</p><div class="archive-footer"><span class="archive-price">$' + parseFloat(item.price).toFixed(2) + '</span><span class="archive-note">' + item.note + '</span></div></div>';
        },
        'product-card': function(item) {
            var tags = item.tags.map(function(t) { return '<span class="product-tag">' + t + '</span>'; }).join('');
            var ingredients = item.ingredients.map(function(i) { return '<li>' + i + '</li>'; }).join('');
            var allergens = item.allergens.map(function(a) { return '<span class="allergen-tag">' + a + '</span>'; }).join('');
            var steamHTML = item.id === 'double' ? '<div class="steam-container"><div class="steam-wisp-card s1"></div><div class="steam-wisp-card s2"></div></div>' : '';
            return '<div class="product-card"><div class="product-card-inner"><div class="product-card-front"><div class="cookie-icon flavor-' + item.id + '" aria-hidden="true"></div>' + steamHTML + '<h3 class="product-name">' + item.name + '</h3><p class="product-desc">' + item.desc + '</p><div class="product-footer"><span class="product-price">$' + parseFloat(item.price).toFixed(2) + '</span>' + tags + '</div></div><div class="product-card-back"><h3 class="product-name">What\'s Inside</h3><ul class="ingredients-list">' + ingredients + '</ul><div class="allergen-tags">' + allergens + '</div><span class="product-price">$' + parseFloat(item.price).toFixed(2) + '</span></div></div></div>';
        },
        'testimonial-slide': function(item) {
            var stars = '';
            for (var i = 0; i < 5; i++) {
                stars += '<span class="star"><svg viewBox="0 0 24 24"><use href="#icon-star"/></svg></span>';
            }
            return '<div class="testimonial"><div class="stars" aria-label="' + item.stars + ' out of 5 stars">' + stars + '</div><blockquote>"' + item.quote + '"</blockquote><cite>— ' + item.author + '</cite></div>';
        },
        'faq-item': function(item, _unused, index) {
            var openAttr = index === 0 ? ' open' : '';
            var expandedAttr = index === 0 ? ' aria-expanded="true"' : ' aria-expanded="false"';
            return '<div class="faq-item' + openAttr + '"><button class="faq-question"' + expandedAttr + '>' + item.q + '</button><div class="faq-answer"><p>' + item.a + '</p></div></div>';
        },
        'faculty-card': function(member, isPast) {
            var cls = isPast ? 'faculty-card alumni' : 'faculty-card';
            var avStyle = isPast ? ' style="opacity:0.6"' : '';
            var tenureHTML = isPast && member.tenure ? '<span style="font-size:0.6875rem;color:#8B6F5C;font-weight:600;display:block;margin-top:0.5rem">'+member.tenure+'</span>' : '';
            return '<div class="'+cls+'"><div class="faculty-avatar"'+avStyle+'><svg width="36" height="36" viewBox="0 0 32 32"><circle cx="16" cy="11" r="7" fill="#FFF9F2"/><path d="M5 28c0-7 5-11 11-11s11 4 11 11" fill="#FFF9F2"/></svg></div><h3 class="faculty-name">'+member.name+'</h3><span class="faculty-role">'+member.role+'</span><p class="faculty-bio">'+member.bio+'</p>'+tenureHTML+'</div>';
        },
        'loading': '<div style="text-align:center;padding:3rem;color:#8B6F5C">Loading…</div>',
        'error': '<div style="text-align:center;padding:3rem;color:var(--jam)">Could not load content.</div>'
    };

    function loadAndRender(el, cb) {
        var src = el.getAttribute('data-load');
        var tpl = el.getAttribute('data-template');
        var section = el.getAttribute('data-section');
        if (!src || !tpl || !templates[tpl]) { if (cb) cb(); return; }
        el.innerHTML = templates['loading'];
        fetch(src, {cache: 'no-cache'}).then(function(res) {
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }).then(function(data) {
            var items = section ? data[section] : data;
            if (!Array.isArray(items)) items = [items];
            el.innerHTML = items.map(function(item) {
                return templates[tpl](item, section==='past');
            }).join('');
            if (cb) cb();
        }).catch(function(err) {
            console.warn('Data load failed: '+src, err);
            el.innerHTML = templates['error'];
            if (cb) cb();
        });
    }

    function init() {
        var els = document.querySelectorAll('[data-load]');
        var pending = els.length;
        if (pending === 0) { window.dispatchEvent(new CustomEvent('data-ready')); return; }
        els.forEach(function(el) {
            loadAndRender(el, function() {
                pending--;
                if (pending === 0) window.dispatchEvent(new CustomEvent('data-ready'));
            });
        });
    }
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
