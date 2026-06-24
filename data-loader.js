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
            var iconSrc = item.icon || 'svg/cookies/classic.svg';
            return '<div class="archive-card ' + statusClass + '" data-status="' + item.status + '" data-season="' + item.season.toLowerCase() + '"><div class="archive-season">' + item.season + '</div><div class="archive-cookie-icon"><img src="' + iconSrc + '" alt="' + item.name + '" width="80" height="80" loading="lazy"></div><h3 class="archive-name">' + item.name + '</h3><p class="archive-desc">' + item.desc + '</p><div class="archive-footer"><span class="archive-price">$' + parseFloat(item.price).toFixed(2) + '</span><span class="archive-note">' + item.note + '</span></div></div>';
        },
        'builder-item': function(item) {
            return '<div class="builder-item" tabindex="0" data-id="' + item.id + '" data-name="' + item.name + '" data-price="' + item.price + '">' +
                '<img src="' + item.icon + '" alt="' + item.name + '" width="40" height="40" style="border-radius:50%;flex-shrink:0">' +
                '<span class="builder-item-name">' + item.name + '</span>' +
                '<span class="builder-item-price">$' + parseFloat(item.price).toFixed(2) + '</span>' +
                '<div class="builder-qty"><button class="qty-btn qty-minus" aria-label="Remove one" tabindex="0">−</button><span class="qty-num">0</span><button class="qty-btn qty-plus" aria-label="Add one" tabindex="0">+</button></div>' +
            '</div>';
        },
        'product-card': function(item) {
            var tags = item.tags.map(function(t) { return '<span class="product-tag">' + t + '</span>'; }).join('');
            var ingredients = item.ingredients.map(function(i) { return '<li>' + i + '</li>'; }).join('');
            var allergens = item.allergens.map(function(a) { return '<span class="allergen-tag">' + a + '</span>'; }).join('');
            var iconSrc = item.icon || ('svg/cookies/' + item.id + '.svg');
            var steamHTML = item.id === 'double' ? '<div class="steam-container"><div class="steam-wisp-card s1"></div><div class="steam-wisp-card s2"></div></div>' : '';
            // Cookie of the Day: deterministic daily pick
            var today = new Date(); var doy = Math.floor((today - new Date(today.getFullYear(),0,0)) / 86400000);
            var dailyPick = item.id === window._productIds[doy % window._productIds.length];
            var pickBadge = dailyPick ? '<span class="daily-pick-badge">Today\'s Pick — $' + (parseFloat(item.price) - 0.50).toFixed(2) + '</span>' : '';
            return '<div class="product-card' + (dailyPick ? ' daily-pick' : '') + '"><div class="product-card-inner"><div class="product-card-front"><div class="cookie-icon"><img src="' + iconSrc + '" alt="' + item.name + '" width="56" height="56" loading="lazy"></div>' + steamHTML + '<h3 class="product-name">' + item.name + '</h3><p class="product-desc">' + item.desc + '</p><div class="product-footer"><span class="product-price">$' + parseFloat(item.price).toFixed(2) + '</span>' + tags + '</div>' + pickBadge + '</div><div class="product-card-back"><h3 class="product-name">What\'s Inside</h3><ul class="ingredients-list">' + ingredients + '</ul><div class="allergen-tags">' + allergens + '</div>' + (item.origin ? '<p class="product-origin">' + item.origin + '</p>' : '') + '</div></div></div>';
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
            return '<div class="'+cls+'"><div class="faculty-avatar"'+avStyle+'><svg width="36" height="36" viewBox="0 0 32 32"><circle cx="16" cy="11" r="7" fill="#FFF9F2"/><path d="M5 28c0-7 5-11 11-11s11 4 11 11" fill="#FFF9F2"/></svg></div><h3 class="faculty-name">'+member.name+'</h3><span class="faculty-role">'+member.role+'</span><p class="faculty-bio">'+member.bio+'</p>'+tenureHTML + (member.quote ? '<p class="faculty-quote">' + member.quote + '</p>' : '') + '</div>';
        },
        'kitchen-card': function(item) {
            var tiltClass = item.tilt || 'tilt-none';
            var tallClass = item.tall ? ' polaroid-tall' : '';
            // Store story in global lookup to avoid HTML attribute escaping issues
            if (item.id && item.story) {
                if (!window._kitchenStories) window._kitchenStories = {};
                window._kitchenStories[item.id] = { title: item.title, story: item.story, icon: item.icon };
            }
            return '<div class="polaroid ' + tiltClass + tallClass + '" data-story-id="' + (item.id || '') + '" role="button" tabindex="0" aria-label="Read story: ' + (item.title || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '">' +
                '<div class="polaroid-frame">' +
                '<img src="' + (item.icon || '') + '" alt="' + (item.caption || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" width="180" height="180" loading="lazy">' +
                '</div>' +
                '<p class="polaroid-caption">' + (item.caption || '').replace(/&/g,'&amp;') + '</p>' +
                '<span class="polaroid-hint">Read the story →</span>' +
                '</div>';
        },
        'loading': '<div class="skeleton-list"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>',
        'loading-faq': '<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>',
        'loading-testimonial': '<div class="skeleton-card skeleton-card-tall"></div>',
        'loading-kitchen-card': '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem"><div class="skeleton-polaroid"></div><div class="skeleton-polaroid"></div><div class="skeleton-polaroid"></div><div class="skeleton-polaroid"></div></div>',
        'error': '<div class="load-error" role="alert"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p>Could not load content. <button onclick="location.reload()" style="background:none;border:none;color:var(--gold);cursor:pointer;text-decoration:underline;font:inherit">Try again</button></p></div>'
    };

    function loadAndRender(el, cb) {
        var src = el.getAttribute('data-load');
        var tpl = el.getAttribute('data-template');
        var section = el.getAttribute('data-section');
        if (!src || !tpl || !templates[tpl]) { if (cb) cb(); return; }
        // Use template-specific loading skeleton
        var loadingKey = 'loading-' + tpl;
        el.innerHTML = templates[loadingKey] || templates['loading'];

        function render(data) {
            var items = section ? data[section] : data;
            if (!Array.isArray(items)) items = [items];
            el.innerHTML = items.map(function(item) {
                return templates[tpl](item, section==='past');
            }).join('');
            if (cb) cb();
        }

        function onError(err) {
            console.warn('Data load failed: '+src, err);
            var isFileProtocol = window.location.protocol === 'file:';
            var msg = isFileProtocol
                ? '<p>Local preview: start a server for full experience.<br><code style="font-size:0.8rem;background:var(--vanilla);padding:0.25rem 0.5rem;border-radius:4px">python3 -m http.server 8080</code></p>'
                : '<p>Could not load content. <button onclick="location.reload()" style="background:none;border:none;color:var(--gold);cursor:pointer;text-decoration:underline;font:inherit">Try again</button></p>';
            el.innerHTML = '<div class="load-error" role="alert">' + msg + '</div>';
            if (cb) cb();
        }

        function tryFetch() {
            var controller = new AbortController();
            var timeout = setTimeout(function() { controller.abort(); }, 15000);
            fetch(src, {cache: 'no-cache', signal: controller.signal}).then(function(res) {
                clearTimeout(timeout);
                if (!res.ok) throw new Error('HTTP '+res.status);
                return res.json();
            }).then(render).catch(function(err) {
                clearTimeout(timeout);
                // On file:// protocol, try XHR fallback
                if (window.location.protocol === 'file:') {
                    tryXHR();
                } else {
                    onError(err);
                }
            });
        }

        function tryXHR() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.overrideMimeType('application/json');
            xhr.onload = function() {
                if (xhr.status === 200 || xhr.status === 0) {
                    try { render(JSON.parse(xhr.responseText)); } catch(e) { onError(e); }
                } else {
                    onError(new Error('XHR status '+xhr.status));
                }
            };
            xhr.onerror = function() { onError(new Error('XHR failed')); };
            xhr.send();
        }

        tryFetch();
    }

    function init() {
        // Baseline product IDs (used by product-card template before data-ready)
        window._productIds = ['classic','double','toffee','raspberry','caramel','matcha'];
        // Override with actual product IDs once builder items are rendered
        window.addEventListener('data-ready', function() {
            var ids = [];
            document.querySelectorAll('.builder-item[data-id]').forEach(function(el) {
                ids.push(el.getAttribute('data-id'));
            });
            if (ids.length) window._productIds = ids;
        });
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
