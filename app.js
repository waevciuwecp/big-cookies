// ── Big Cookies — Animations, Forms & Easter Eggs ─
// ── Seasonal accent ───────────────────────
(function() {
    var month = new Date().getMonth(); // 0-11
    var seasons = {
        winter: { months: [11,0,1], gold: '#C89050', honey: '#D4A860', name: 'winter' },
        spring: { months: [2,3,4],  gold: '#C8A53E', honey: '#D4B860', name: 'spring' },
        summer: { months: [5,6,7],  gold: '#D4952E', honey: '#E8B840', name: 'summer' },
        fall:   { months: [8,9,10], gold: '#C87820', honey: '#D49030', name: 'fall' }
    };
    var current = seasons.fall;
    for (var s in seasons) {
        if (seasons[s].months.indexOf(month) !== -1) current = seasons[s];
    }
    document.documentElement.style.setProperty('--gold', current.gold);
    document.documentElement.style.setProperty('--honey', current.honey);
    document.documentElement.dataset.season = current.name;
})();

// ── Console easter egg ─────────────────────
console.log(
    '%c🥠 %cBig Cookies%c — Artisan Cookies, Baked Fresh Daily\n' +
    '%cHandcrafted in small batches. European butter, single-origin chocolate, 48-hour cold fermentation.\n' +
    '%cPoke around the source — there are secrets in the dough.',
    'font-size:1.4em;',
    'font-family:serif;font-size:2em;font-weight:900;color:#C8853E;',
    '',
    'color:#8B6F5C;font-style:italic;',
    'color:#C8853E;font-size:0.8em;'
);

// Check reduced-motion preference once
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Hero entrance animation ──────────────────
(function() {
    if (prefersReducedMotion) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    // Trigger entrance on next frame after paint
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            hero.classList.add('hero-entrance');
        });
    });
})();

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


// ── Flavor atlas ───────────────────────────
(function() {
    var rail = document.getElementById('atlasRail');
    var panel = document.getElementById('atlasPanel');
    if (!rail || !panel) return;

    var profiles = {
        classic: { mood: 'Comfort', intensity: 'Medium', finish: 'Roasty' },
        double: { mood: 'Late-night', intensity: 'Bold', finish: 'Bitter-salt' },
        toffee: { mood: 'Cozy', intensity: 'High', finish: 'Crunchy' },
        raspberry: { mood: 'Bright', intensity: 'High', finish: 'Tart snap' },
        caramel: { mood: 'Golden hour', intensity: 'Medium', finish: 'Soft-salt' },
        matcha: { mood: 'Quiet', intensity: 'Layered', finish: 'Earthy-sweet' }
    };

    function renderPanel(item) {
        var profile = profiles[item.id] || { mood: 'House favorite', intensity: 'Balanced', finish: 'Long finish' };
        panel.innerHTML =
            '<div class="atlas-topline">' +
                '<div>' +
                    '<div class="atlas-kicker">Tasting board / ' + profile.mood + '</div>' +
                    '<h3>' + item.name + '</h3>' +
                '</div>' +
                '<div class="atlas-price">$' + parseFloat(item.price).toFixed(2) + '</div>' +
            '</div>' +
            '<p class="atlas-desc">' + item.desc + '</p>' +
            '<div class="atlas-stat-grid">' +
                '<div class="atlas-stat"><span class="atlas-stat-label">Mood</span><strong>' + profile.mood + '</strong></div>' +
                '<div class="atlas-stat"><span class="atlas-stat-label">Intensity</span><strong>' + profile.intensity + '</strong></div>' +
                '<div class="atlas-stat"><span class="atlas-stat-label">Finish</span><strong>' + profile.finish + '</strong></div>' +
            '</div>' +
            '<div class="atlas-ingredients">' + item.ingredients.slice(0, 4).map(function(ingredient) {
                return '<span>' + ingredient + '</span>';
            }).join('') + '</div>' +
            '<p class="atlas-origin">' + item.origin + '</p>' +
            '<div class="atlas-cta"><a class="btn btn-primary" href="#build">Build a box with this one</a></div>';
    }

    function renderRail(items) {
        rail.innerHTML = items.map(function(item, index) {
            var profile = profiles[item.id] || {};
            return '<button class="atlas-chip" role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '" data-id="' + item.id + '">' +
                '<span class="atlas-chip-name">' + item.name + '</span>' +
                '<span class="atlas-chip-meta"><span>' + (profile.mood || 'House') + '</span><span>' + (profile.finish || 'Balanced') + '</span></span>' +
                '<span class="atlas-chip-price">$' + parseFloat(item.price).toFixed(2) + '</span>' +
            '</button>';
        }).join('');

        rail.querySelectorAll('.atlas-chip').forEach(function(button) {
            button.addEventListener('click', function() {
                rail.querySelectorAll('.atlas-chip').forEach(function(other) {
                    other.setAttribute('aria-selected', 'false');
                });
                button.setAttribute('aria-selected', 'true');
                var selected = items.find(function(item) { return item.id === button.getAttribute('data-id'); });
                if (selected) renderPanel(selected);
            });
        });
    }

    fetch('data/products.json', { cache: 'no-cache' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(items) {
            if (!Array.isArray(items) || !items.length) throw new Error('No products');
            renderRail(items);
            renderPanel(items[0]);
        })
        .catch(function() {
            panel.innerHTML = '<p class="atlas-loading">Open the site through a local server or production host to load the tasting board.</p>';
        });
})();


// ── Cookie parallax (scroll + mouse) ──────
const heroCookie = document.getElementById('heroCookie');
if (heroCookie) {
    var scrollTicking = false;
    var mouseX = 0, mouseY = 0;
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                var scrollY = window.scrollY;
                var rotate = Math.max(-15, Math.min(15, scrollY * 0.08 + mouseX * 0.02));
                var translateY = scrollY * 0.03 + mouseY * 0.02;
                heroCookie.style.transform = 'rotate(' + rotate + 'deg) translateY(' + translateY + 'px)';
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });
    document.addEventListener('mousemove', function(e) {
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        mouseX = (e.clientX - cx) / cx; // -1 to 1
        mouseY = (e.clientY - cy) / cy;
    });
}

// ── Hero cursor crumbs ──────────────────────
(function() {
    var cookie = document.getElementById('heroCookie');
    if (!cookie) return;
    var crumbs = [];
    var maxCrumbs = 12;
    var colors = ['#C8853E','#D4954B','#A8612E','#3C1D0E','#E8A850','#8B5A2E'];
    var ticking = false;
    var mx = 0, my = 0;

    document.addEventListener('mousemove', function(e) {
        mx = e.clientX; my = e.clientY;
        if (!ticking) {
            requestAnimationFrame(function() {
                var rect = cookie.getBoundingClientRect();
                var cx = rect.left + rect.width/2;
                var cy = rect.top + rect.height/2;
                var dist = Math.sqrt((mx-cx)*(mx-cx) + (my-cy)*(my-cy));
                if (dist < 200) {
                    var crumb = document.createElement('div');
                    crumb.style.cssText = 'position:fixed;z-index:9998;pointer-events:none;border-radius:50%;' +
                        'width:' + (2+Math.random()*3) + 'px;height:' + (2+Math.random()*3) + 'px;' +
                        'background:' + colors[Math.floor(Math.random()*colors.length)] + ';' +
                        'left:' + mx + 'px;top:' + my + 'px;' +
                        'transition: all ' + (0.6+Math.random()*0.5) + 's ease-out;opacity:0.7;';
                    document.body.appendChild(crumb);
                    crumbs.push(crumb);
                    requestAnimationFrame(function(c) { return function() {
                        c.style.transform = 'translate(' + ((Math.random()-0.5)*30) + 'px,' + ((Math.random()-0.5)*30-10) + 'px)';
                        c.style.opacity = '0';
                    };}(crumb));
                    setTimeout(function(c) { return function() {
                        var i = crumbs.indexOf(c);
                        if (i >= 0) crumbs.splice(i,1);
                        if (c.parentNode) c.remove();
                    };}(crumb), 800);
                    while (crumbs.length > maxCrumbs) {
                        var old = crumbs.shift();
                        if (old && old.parentNode) old.remove();
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });
})();

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
// Check if user previously closed the banner
try { if (localStorage.getItem('batchBannerClosed')) bannerShown = true; } catch(e) {}
window.addEventListener('scroll', function() {
    if (!bannerShown && window.scrollY > window.innerHeight * 0.6) {
        if (!batchBanner) batchBanner = document.getElementById('batchBanner');
        if (batchBanner) { batchBanner.classList.add('visible'); bannerShown = true; }
    }
}, {passive: true});
// Close button handler (delegated since banner injected by ui.js)
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.batch-close');
    if (!btn) return;
    var banner = document.getElementById('batchBanner');
    if (banner) { banner.classList.remove('visible'); bannerShown = true; }
    try { localStorage.setItem('batchBannerClosed', '1'); } catch(e) {}
});

// ── Scroll-reveal animations ──────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = entry.target.dataset.originalTransform
                ? entry.target.dataset.originalTransform
                : 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

function initScrollReveal() {
    document.querySelectorAll('.product-card, .step, .phil-card, .gift-card, .polaroid, .faculty-card, .award-card, .news-card, .about-block, .od-feature').forEach(function(el, i) {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = '1';
        if (prefersReducedMotion) { el.style.opacity = '1'; return; }
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
    if (prefersReducedMotion) return; // skip count-up animation
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

// ── Form enhancement utilities ──────────────
function validateField(field) {
    var group = field.closest('.form-group');
    if (!group) return true;

    // Remove existing error
    var existing = group.querySelector('.form-error');
    if (existing) existing.remove();
    group.classList.remove('error', 'valid');

    var value = field.value.trim();

    // Required check
    if (field.hasAttribute('required') && !value) {
        group.classList.add('error');
        var err = document.createElement('span');
        err.className = 'form-error';
        err.textContent = 'This field is required';
        group.appendChild(err);
        return false;
    }

    // Email check
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        group.classList.add('error');
        var emailErr = document.createElement('span');
        emailErr.className = 'form-error';
        emailErr.textContent = 'Please enter a valid email address';
        group.appendChild(emailErr);
        return false;
    }

    if (value) group.classList.add('valid');
    return true;
}

function getFormData(form) {
    var data = {};
    form.querySelectorAll('input, select, textarea').forEach(function(field) {
        var key = field.name || field.id;
        if (key) data[key] = field.value;
    });
    return data;
}

function setFormLoading(form, loading) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (loading) {
        btn._originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add('loading');
        btn.innerHTML = '<span class="btn-spinner"></span> Sending…';
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
        if (btn._originalHTML) btn.innerHTML = btn._originalHTML;
    }
}

function clearFormErrors(form) {
    form.querySelectorAll('.form-group.error, .form-group.valid').forEach(function(g) {
        g.classList.remove('error', 'valid');
        var err = g.querySelector('.form-error');
        if (err) err.remove();
    });
}

// ── Order form ────────────────────────────
(function() {
    var form = document.getElementById('orderForm');
    if (!form) return;

    // Blur validation
    form.querySelectorAll('input[required], textarea[required]').forEach(function(field) {
        field.addEventListener('blur', function() { validateField(field); });
        field.addEventListener('input', function() {
            var group = field.closest('.form-group');
            if (group && group.classList.contains('error')) validateField(field);
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearFormErrors(form);

        var valid = true;
        form.querySelectorAll('input[required], input[type="email"], textarea[required]').forEach(function(field) {
            if (!validateField(field)) valid = false;
        });

        if (!valid) {
            var firstError = form.querySelector('.form-group.error input, .form-group.error textarea');
            if (firstError) { firstError.focus(); firstError.style.animation = 'none'; firstError.offsetHeight; firstError.style.animation = 'shake 0.4s ease'; }
            return;
        }

        setFormLoading(form, true);
        setTimeout(function() {
            setFormLoading(form, false);
            // Sold-out response — styled to match the brand
            var container = form.closest('.order-section');
            var existing = container.querySelector('.form-success-inline');
            if (existing) existing.remove();
            var msg = document.createElement('div');
            msg.className = 'form-success-inline sold-out visible';
            msg.style.maxWidth = '600px';
            msg.style.margin = '1.5rem auto 0';
            msg.textContent = 'We\'ve got your order — but we\'re sold out this week. You\'ll be first in line when the next batch drops Friday at noon.';
            container.appendChild(msg);
            showToast('Next batch drops Friday — we\'ll hold your spot.', '🥠');
            setTimeout(function() { msg.classList.remove('visible'); setTimeout(function() { if (msg.parentNode) msg.remove(); }, 400); }, 6000);
        }, 900);
    });
})();

// ── Open Day form ───────────────────────────
(function() {
    var form = document.getElementById('openDayForm');
    if (!form) return;

    form.querySelectorAll('input[required], select[required]').forEach(function(field) {
        field.addEventListener('blur', function() { validateField(field); });
        field.addEventListener('input', function() {
            var group = field.closest('.form-group');
            if (group && group.classList.contains('error')) validateField(field);
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearFormErrors(form);

        var valid = true;
        form.querySelectorAll('input[required], select[required], input[type="email"]').forEach(function(field) {
            if (!validateField(field)) valid = false;
        });

        if (!valid) {
            var firstError = form.querySelector('.form-group.error input, .form-group.error select');
            if (firstError) { firstError.focus(); firstError.style.animation = 'none'; firstError.offsetHeight; firstError.style.animation = 'shake 0.4s ease'; }
            return;
        }

        setFormLoading(form, true);
        setTimeout(function() {
            setFormLoading(form, false);
            form.reset();
            form.querySelectorAll('.form-group.valid').forEach(function(g) { g.classList.remove('valid'); });

            var existing = form.parentNode.querySelector('.form-success-inline');
            if (existing) existing.remove();
            var msg = document.createElement('div');
            msg.className = 'form-success-inline visible';
            msg.textContent = 'You\'re on the list! Check your email for confirmation. See you on Open Day.';
            form.parentNode.appendChild(msg);
            showToast('Reserved! Check your email for confirmation.', '📅');
            setTimeout(function() { msg.classList.remove('visible'); setTimeout(function() { if (msg.parentNode) msg.remove(); }, 400); }, 5000);
        }, 900);
    });
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
(function() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;
    var newsletterInput = form.querySelector('input');

    newsletterInput.addEventListener('blur', function() {
        var value = newsletterInput.value.trim();
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newsletterInput.style.borderColor = 'var(--jam)';
            newsletterInput.style.background = 'rgba(184,68,68,0.08)';
        } else if (value) {
            newsletterInput.style.borderColor = '#3A8C3F';
            newsletterInput.style.background = 'rgba(58,140,63,0.06)';
        } else {
            newsletterInput.style.borderColor = '';
            newsletterInput.style.background = '';
        }
    });
    newsletterInput.addEventListener('input', function() {
        if (newsletterInput.style.borderColor === 'rgb(184, 68, 68)' || newsletterInput.style.borderColor === 'var(--jam)') {
            newsletterInput.style.borderColor = '';
            newsletterInput.style.background = '';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = newsletterInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newsletterInput.style.borderColor = 'var(--jam)';
            newsletterInput.style.background = 'rgba(184,68,68,0.08)';
            newsletterInput.style.animation = 'none';
            newsletterInput.offsetHeight;
            newsletterInput.style.animation = 'shake 0.4s ease';
            showToast('Please enter a valid email address.');
            setTimeout(function() { newsletterInput.style.borderColor = ''; newsletterInput.style.background = ''; }, 2500);
            return;
        }

        var btn = form.querySelector('button[type="submit"]');
        btn._originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add('loading');
        btn.innerHTML = '<span class="btn-spinner"></span> Joining…';

        setTimeout(function() {
            btn.classList.remove('loading');
            btn.disabled = false;
            btn.innerHTML = btn._originalHTML;

            var success = document.getElementById('newsletterSuccess');
            newsletterInput.value = '';
            newsletterInput.style.borderColor = '#3A8C3F';
            newsletterInput.style.background = 'rgba(58,140,63,0.06)';
            success.classList.add('visible');
            showToast('You\'re on the list! See you Friday.', '📬');
            setTimeout(function() {
                success.classList.remove('visible');
                newsletterInput.style.borderColor = '';
                newsletterInput.style.background = '';
            }, 5000);
        }, 800);
    });
})();


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
        container.addEventListener('mouseleave', function() {
            if (container.dataset.paused) return;
            timer = setInterval(next, 5000);
        });

        // Pause when scrolled out of view
        var sliderObserver = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                container.dataset.paused = '';
                timer = setInterval(next, 5000);
            } else {
                container.dataset.paused = '1';
                clearInterval(timer);
            }
        }, { threshold: 0.1 });
        sliderObserver.observe(container);

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


// ── Back to top with progress ring ────────
var backToTop = document.getElementById('backToTop');
var backToTopRing = document.getElementById('backToTopRing');
if (backToTop) {
    var ringLen = 125.6; // 2*PI*20
    window.addEventListener('scroll', function() {
        var visible = window.scrollY > 600;
        backToTop.classList.toggle('visible', visible);
        if (backToTopRing && visible) {
            var h = document.documentElement.scrollHeight - window.innerHeight;
            var pct = h > 0 ? Math.min(1, window.scrollY / h) : 0;
            backToTopRing.setAttribute('stroke-dashoffset', ringLen * (1 - pct));
        }
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

// ── Confirm dialog ────────────────────────
function showConfirm(message, confirmLabel, onConfirm, onCancel) {
    // Remove any existing confirm
    var existing = document.querySelector('.confirm-backdrop');
    if (existing) existing.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop';
    var dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('role', 'alertdialog');
    dialog.innerHTML =
        '<p class="confirm-message">' + message + '</p>' +
        '<div class="confirm-actions">' +
            '<button class="confirm-cancel">Cancel</button>' +
            '<button class="confirm-ok">' + (confirmLabel || 'Confirm') + '</button>' +
        '</div>';

    function close(confirmed) {
        dialog.classList.add('closing');
        backdrop.classList.add('closing');
        setTimeout(function() {
            backdrop.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
            if (confirmed && onConfirm) onConfirm();
            if (!confirmed && onCancel) onCancel();
        }, 250);
    }

    function onKey(e) {
        if (e.key === 'Escape') close(false);
        if (e.key === 'Enter') close(true);
    }

    backdrop.addEventListener('click', function(e) { if (e.target === backdrop) close(false); });
    dialog.querySelector('.confirm-cancel').addEventListener('click', function() { close(false); });
    dialog.querySelector('.confirm-ok').addEventListener('click', function() { close(true); });
    document.addEventListener('keydown', onKey);

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    dialog.querySelector('.confirm-ok').focus();
}


// ── Baking tip rotator ──────────────────────
(function() {
    var tips = [
        "Brown your butter until it smells nutty. That's when the magic starts.",
        "Chill your dough. 48 hours. No shortcuts. The flour needs time to hydrate.",
        "Maldon salt on top. Not table salt. The flakes matter.",
        "Room temperature eggs. Cold eggs shock the butter. Nobody wants that.",
        "Underbake by one minute. The residual heat finishes the job on the rack.",
        "Measure by weight, not volume. A cup of flour can vary by 30 grams.",
        "Vanilla is not optional. Use the real stuff. Madagascar if you can.",
        "The best cookie is the one you share. But we won't judge if you don't."
    ];
    var el = document.getElementById('bakingTip');
    if (!el) return;
    var idx = new Date().getDate() % tips.length;
    el.textContent = '💡 ' + tips[idx];
})();

// ── Theme toggle ──────────────────────────
(function() {
    var html = document.documentElement;
    function bindToggle() {
        var toggle = document.getElementById('themeToggle');
        if (!toggle) { setTimeout(bindToggle, 100); return; }
        if (toggle.dataset.bound) return;
        toggle.dataset.bound = '1';
        toggle.addEventListener('click', function() {
            var isDark = html.getAttribute('data-theme') === 'dark';
            html.setAttribute('data-theme', isDark ? 'light' : 'dark');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });
    }
    bindToggle();
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
    cookie.addEventListener('click', function(e) {
        clicks++;
        counter.textContent = clicks;
        counter.classList.add('show');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function() { counter.classList.remove('show'); }, 2000);

        // Crumble particles
        var rect = cookie.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var colors = ['#C8853E', '#D4954B', '#A8612E', '#3C1D0E', '#E8A850', '#8B5A2E'];
        for (var i = 0; i < 8; i++) {
            var crumb = document.createElement('div');
            crumb.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;' +
                'width:' + (4 + Math.random() * 8) + 'px;' +
                'height:' + (4 + Math.random() * 8) + 'px;' +
                'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
                'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
                'left:' + cx + 'px;top:' + cy + 'px;' +
                'transition: all ' + (0.5 + Math.random() * 0.4) + 's cubic-bezier(0.25,0,0.35,1);' +
                'opacity:1;';
            document.body.appendChild(crumb);
            requestAnimationFrame(function(c) {
                return function() {
                    var angle = Math.random() * Math.PI * 2;
                    var dist = 40 + Math.random() * 80;
                    c.style.transform = 'translate(' + Math.cos(angle) * dist + 'px,' + (Math.sin(angle) * dist - 30) + 'px) rotate(' + (Math.random()*360) + 'deg)';
                    c.style.opacity = '0';
                };
            }(crumb));
            setTimeout(function(c) { return function() { if (c.parentNode) c.remove(); }; }(crumb), 1000);
        }

        // Shake cookie
        cookie.style.transition = 'transform 0.1s ease';
        var current = cookie.style.transform || '';
        var base = current.replace(/ scale\([^)]+\)/, '');
        cookie.style.transform = base + ' scale(0.95)';
        setTimeout(function() { cookie.style.transform = base + ' scale(1.05)'; }, 100);
        setTimeout(function() { cookie.style.transform = base; }, 250);

        var messages = {
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
        if (messages[clicks]) setTimeout(function() { showToast(messages[clicks]); }, 300);
    });
})();

// ── Cookie Personality Quiz ──────────────────
(function() {
    var container = document.getElementById('quizBody');
    if (!container) return;

    var questions = [
        {
            q: 'What\'s your ideal afternoon?',
            options: [
                { text: 'Curled up with a book and a blanket', scores: { classic: 3, matcha: 2, caramel: 1 } },
                { text: 'Hiking a trail with friends', scores: { toffee: 3, raspberry: 2, double: 1 } },
                { text: 'Trying a new restaurant across town', scores: { raspberry: 3, matcha: 2, caramel: 1 } },
                { text: 'Baking something from scratch', scores: { double: 3, classic: 2, toffee: 1 } }
            ]
        },
        {
            q: 'Pick a drink to go with it.',
            options: [
                { text: 'Black coffee, no sugar', scores: { double: 3, classic: 2, toffee: 1 } },
                { text: 'Oat milk latte with a dash of cinnamon', scores: { caramel: 3, matcha: 2, classic: 1 } },
                { text: 'Earl Grey tea with honey', scores: { matcha: 3, raspberry: 2, caramel: 1 } },
                { text: 'Sparkling water with lemon', scores: { raspberry: 3, toffee: 2, double: 1 } }
            ]
        },
        {
            q: 'What do your friends say about you?',
            options: [
                { text: '"The reliable one — you always show up"', scores: { classic: 3, caramel: 2, toffee: 1 } },
                { text: '"You\'re a little extra. In the best way."', scores: { double: 3, raspberry: 2, matcha: 1 } },
                { text: '"I never know what you\'re going to do next"', scores: { toffee: 3, matcha: 2, raspberry: 1 } },
                { text: '"You make everything feel special"', scores: { caramel: 3, classic: 2, double: 1 } }
            ]
        }
    ];

    var results = {
        classic: { name: 'Classic Chocolate Chip', desc: 'You\'re timeless, dependable, and everyone\'s first call. You don\'t need to be flashy — your quality speaks for itself. The original, and still the one people come back to.', icon: 'svg/cookies/classic.svg' },
        double: { name: 'Double Chocolate', desc: 'You go all in. Moderation isn\'t in your vocabulary and honestly? It\'s working. You\'re intense in the best way, and people either keep up or get out of the way.', icon: 'svg/cookies/double.svg' },
        toffee: { name: 'Toffee Crunch', desc: 'You\'ve got layers. People think they\'ve figured you out, then you surprise them. Complex, a little unexpected, and somehow everything comes together perfectly.', icon: 'svg/cookies/toffee.svg' },
        raspberry: { name: 'Raspberry Dark Chocolate', desc: 'You\'re the creative one. You see combinations others miss and you\'re not afraid to try something different. Colorful, bold, and impossible to forget.', icon: 'svg/cookies/raspberry.svg' },
        caramel: { name: 'Salted Caramel', desc: 'You\'ve mastered the balance everyone else is still chasing. Warm, sophisticated, with just enough edge to keep things interesting. The sweet-and-salty of the group.', icon: 'svg/cookies/caramel.svg' },
        matcha: { name: 'Matcha White Chocolate', desc: 'You\'re refined, a little unexpected, and you definitely know something the rest of us don\'t. People who get you REALLY get you. An acquired taste worth acquiring.', icon: 'svg/cookies/matcha.svg' }
    };

    var scores = {};
    var currentQ = 0;

    function resetQuiz() {
        scores = { classic: 0, double: 0, toffee: 0, raspberry: 0, caramel: 0, matcha: 0 };
        currentQ = 0;
        var steps = document.querySelectorAll('.quiz-step');
        steps.forEach(function(s) { s.classList.remove('active', 'done'); });
        if (steps.length > 0) steps[0].classList.add('active');
    }

    function showQuestion() {
        var q = questions[currentQ];
        var html = '<h3>' + q.q + '</h3><div class="quiz-options">';
        q.options.forEach(function(opt, i) {
            html += '<button class="quiz-option" data-idx="' + i + '">' + opt.text + '</button>';
        });
        html += '</div>';
        container.innerHTML = html;
        container.className = 'quiz-body';

        container.querySelectorAll('.quiz-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-idx'));
                var chosen = q.options[idx];
                for (var flavor in chosen.scores) {
                    scores[flavor] = (scores[flavor] || 0) + chosen.scores[flavor];
                }

                // Update progress
                var steps = document.querySelectorAll('.quiz-step');
                if (steps[currentQ]) steps[currentQ].classList.add('done');

                currentQ++;
                if (currentQ < questions.length) {
                    if (steps[currentQ]) steps[currentQ].classList.add('active');
                    showQuestion();
                } else {
                    showResult();
                }
            });
        });
    }

    function showResult() {
        var best = null, bestScore = 0;
        for (var flavor in scores) {
            if (scores[flavor] > bestScore) { bestScore = scores[flavor]; best = flavor; }
        }
        var result = results[best];
        if (!result) result = results['classic'];

        var html = '<div class="quiz-result"><div class="quiz-result-icon"><img src="' + result.icon + '" alt="' + result.name + '" width="80" height="80" style="border-radius:50%"></div>';
        html += '<div class="quiz-match">Your soul cookie is</div>';
        html += '<h3>' + result.name + '</h3>';
        html += '<p>' + result.desc + '</p>';
        html += '<a href="#build" class="btn btn-primary">Build a Box with ' + result.name.split(' ')[0] + '</a>';
        html += '<br><button class="quiz-retry" id="quizRetry">Take the quiz again →</button>';
        html += '</div>';
        container.innerHTML = html;
        container.className = 'quiz-body';

        document.getElementById('quizRetry').addEventListener('click', function() {
            resetQuiz();
            showQuestion();
        });
    }

    // Defer to next tick for safe DOM access
    setTimeout(function() {
        resetQuiz();
        showQuestion();
    }, 0);
})();

// ═══════════════════════════════════════════
// ⌨ KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════
(function() {
    var panel = null;

    function showShortcuts() {
        if (panel) return;
        var backdrop = document.createElement('div');
        backdrop.className = 'shortcuts-backdrop';
        var content = document.createElement('div');
        content.className = 'shortcuts-panel';
        content.setAttribute('role', 'dialog');
        content.setAttribute('aria-label', 'Keyboard shortcuts');
        content.innerHTML =
            '<h3>Keyboard Shortcuts</h3>' +
            '<div class="shortcuts-grid">' +
                '<kbd>?</kbd><span>Show / hide this panel</span>' +
                '<kbd>R</kbd><span>Cookie rain</span>' +
                '<kbd>T</kbd><span>Toggle dark mode</span>' +
                '<kbd>B</kbd><span>Jump to Build a Box</span>' +
                '<kbd>H</kbd><span>Go to homepage</span>' +
                '<kbd>1–6</kbd><span>Jump to sections</span>' +
                '<kbd>Esc</kbd><span>Close modals / menus</span>' +
                '<kbd>↑↑↓↓←→←→BA</kbd><span>Secret menu</span>' +
            '</div>' +
            '<p class="shortcuts-hint">Press <kbd>?</kbd> again or click outside to close</p>';
        backdrop.appendChild(content);
        document.body.appendChild(backdrop);
        document.body.style.overflow = 'hidden';
        panel = backdrop;

        function close() {
            if (!panel) return;
            backdrop.classList.add('closing');
            content.classList.add('closing');
            setTimeout(function() {
                if (panel) panel.remove();
                panel = null;
                document.body.style.overflow = '';
                document.removeEventListener('keydown', onKey);
            }, 200);
        }
        function onKey(e) {
            if (e.key === 'Escape' || e.key === '?') { close(); e.preventDefault(); }
        }
        backdrop.addEventListener('click', function(e) { if (e.target === backdrop) close(); });
        document.addEventListener('keydown', onKey);
    }

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (panel) { panel.click(); } else { showShortcuts(); }
        }
        // Quick nav shortcuts
        if (e.key === 'b' && !e.metaKey && !e.ctrlKey) {
            var build = document.getElementById('build');
            if (build) { build.scrollIntoView({behavior:'smooth'}); showToast('Jumped to Build a Box', '📦'); }
        }
        if (e.key === 'h' && !e.metaKey && !e.ctrlKey) {
            if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
                window.location.href = '/';
            } else {
                window.scrollTo({top:0, behavior:'smooth'});
                showToast('Home sweet home', '🏠');
            }
        }
        if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
            var html = document.documentElement;
            var isDark = html.getAttribute('data-theme') === 'dark';
            html.setAttribute('data-theme', isDark ? 'light' : 'dark');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
            showToast(isDark ? '☀️ Light mode' : '🌙 Dark mode');
        }
        // Number keys jump to sections
        if (e.key >= '1' && e.key <= '6' && !e.metaKey && !e.ctrlKey) {
            var sections = ['hero','products','gifts','build','philosophy','how'];
            var idx = parseInt(e.key) - 1;
            var sec = document.getElementById(sections[idx]);
            if (sec) { sec.scrollIntoView({behavior:'smooth'}); showToast('Section ' + e.key, '📍'); }
        }
    });
})();

// ═══════════════════════════════════════════
// 🥠 EASTER EGGS
// ═══════════════════════════════════════════

// ── Konami Code → Secret Cookie ────────────
(function() {
    var KONAMI = [38,38,40,40,37,39,37,39,66,65]; // ↑↑↓↓←→←→BA
    var pos = 0;
    var unlocked = false;

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.keyCode === KONAMI[pos]) {
            pos++;
            if (pos === KONAMI.length) {
                pos = 0;
                if (unlocked) return;
                unlocked = true;
                unlockSecretCookie();
            }
        } else {
            pos = 0;
        }
    });

    function unlockSecretCookie() {
        var picker = document.getElementById('builderPicker');
        if (!picker) return;

        var secret = document.createElement('div');
        secret.className = 'builder-item konami-cookie';
        secret.setAttribute('tabindex', '0');
        secret.dataset.id = 'secret';
        secret.dataset.name = 'The Golden Crumb';
        secret.dataset.emoji = 'secret';
        secret.dataset.price = '9.99';
        secret.innerHTML =
            '<span style="width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:linear-gradient(135deg,#FFD700,#C8853E);box-shadow:0 0 16px rgba(255,215,0,0.5);">👑</span>' +
            '<span class="builder-item-name">Golden Crumb</span>' +
            '<span class="builder-item-price">$9.99</span>' +
            '<div class="builder-qty"><button class="qty-btn qty-minus" aria-label="Remove one" tabindex="0">−</button><span class="qty-num">0</span><button class="qty-btn qty-plus" aria-label="Add one" tabindex="0">+</button></div>';
        picker.appendChild(secret);

        // Flash the picker
        picker.style.transition = 'box-shadow 0.6s ease';
        picker.style.boxShadow = '0 0 60px rgba(255,215,0,0.5), 0 0 120px rgba(200,133,62,0.3)';
        setTimeout(function() { picker.style.boxShadow = ''; }, 1500);

        showToast('👑 Secret menu unlocked! The Golden Crumb has joined the tray.', '🥠');
    }
})();

// ── Cookie Rain (press 'R') ────────────────
(function() {
    var raining = false;
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !raining) {
            raining = true;
            cookieRain();
            setTimeout(function() { raining = false; }, 4000);
        }
    });

    function cookieRain() {
        var emojis = ['🍪','🥠','🍫','🧈','✨','🍩'];
        var count = 40;
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < count; i++) {
            var drop = document.createElement('span');
            drop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            drop.style.cssText =
                'position:fixed;z-index:9990;pointer-events:none;' +
                'font-size:' + (1 + Math.random() * 2.5) + 'rem;' +
                'left:' + (Math.random() * 96) + 'vw;' +
                'top:' + (-10 - Math.random() * 20) + 'vh;' +
                'opacity:' + (0.5 + Math.random() * 0.5) + ';' +
                'animation: cookieDrop ' + (1.5 + Math.random() * 2.5) + 's ease-in ' + (Math.random() * 1.5) + 's forwards;';
            fragment.appendChild(drop);
        }
        document.body.appendChild(fragment);

        setTimeout(function() {
            document.querySelectorAll('[style*="cookieDrop"]').forEach(function(el) { el.remove(); });
        }, 4500);
    }
})();

// ── Secret type detector ───────────────────
(function() {
    var buffer = '';
    var SECRETS = {
        'cookie': '🍪 You found the cookie! There are more secrets hidden deeper...',
        'recipe': '📜 The recipe is simple: patience. 48 hours of it. Also butter. Lots of butter.',
        'croissant': '🥐 Wrong bakery. But we respect the choice.',
        'priya': '🌸 Priya once invented three flavors in a single afternoon. Only two made the menu.',
        'lena': '👩‍🍳 Lena still tastes every batch. She says batch #47 was the closest to perfection.',
        'marcus': '🤚 Marcus can scoop a kilo of flour and be off by less than five grams.',
        'portland': '🌲 PDX. Stumptown. Bridge City. The best cookies in the Pacific Northwest.',
    };

    document.addEventListener('keypress', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        buffer += e.key.toLowerCase();
        if (buffer.length > 20) buffer = buffer.slice(-20);

        for (var word in SECRETS) {
            if (buffer.indexOf(word) !== -1 && !window['_found_' + word]) {
                window['_found_' + word] = true;
                showToast(SECRETS[word]);
                buffer = '';
                // Allow re-trigger after 30s
                setTimeout((function(w) { return function() { window['_found_' + w] = false; }; })(word), 30000);
                break;
            }
        }
    });
})();
