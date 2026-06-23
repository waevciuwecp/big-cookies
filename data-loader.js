// ── Big Cookies — JSON Data Loader ──────────
(function() {
    var templates = {
        'news-card': function(item) {
            var d = new Date(item.date);
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            var dateStr = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
            return '<article class="news-card"><div class="news-date">' + dateStr + '</div><h3 class="news-title">' + item.title + '</h3><p class="news-excerpt">' + item.excerpt + '</p><span class="news-read-time">' + (item.readTime||'') + '</span>' + (item.tag?' &nbsp;·&nbsp; <span class="news-tag">'+item.tag+'</span>':'') + '</article>';
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

    function loadAndRender(el) {
        var src = el.getAttribute('data-load');
        var tpl = el.getAttribute('data-template');
        var section = el.getAttribute('data-section');
        if (!src || !tpl || !templates[tpl]) return;
        el.innerHTML = templates['loading'];
        fetch(src).then(function(res) {
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }).then(function(data) {
            var items = section ? data[section] : data;
            if (!Array.isArray(items)) items = [items];
            el.innerHTML = items.map(function(item) {
                return templates[tpl](item, section==='past');
            }).join('');
        }).catch(function(err) {
            console.warn('Data load failed: '+src, err);
            el.innerHTML = templates['error'];
        });
    }

    function init() {
        document.querySelectorAll('[data-load]').forEach(loadAndRender);
    }
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
