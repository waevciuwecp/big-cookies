// ── Big Cookies — Animations, Forms & Easter Eggs ─

// ── Performance gate ──────────────────────────
// Centralized checks so every effect can gate itself cheaply.
// Updated reactively for visibility, pointer, and motion preference changes.
(function() {
    var G = {
        reducedMotion: false,
        finePointer: true,      // mouse/trackpad; false = coarse (touch)
        mobile: false,          // coarse pointer + small screen
        saveData: false,        // Save-Data header
        isHidden: false,        // document.hidden
        lowPower: false,        // low-core or mobile-like device
        heroVisible: true
    };

    // Init once
    var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mqCoarse  = window.matchMedia('(pointer: coarse)');
    var mqFine    = window.matchMedia('(pointer: fine)');
    var mqData    = window.matchMedia('(prefers-reduced-data: reduce)');
    // Low-power heuristic: coarse pointer AND small screen, OR very few cores
    var cores = navigator.hardwareConcurrency || 8;

    function update() {
        G.reducedMotion = mqReduced.matches;
        G.finePointer   = mqFine.matches && !mqCoarse.matches;
        G.mobile        = mqCoarse.matches && window.innerWidth < 1024;
        G.saveData      = !!(navigator.connection && navigator.connection.saveData) || mqData.matches;
        G.isHidden      = document.hidden;
        G.lowPower      = G.mobile || cores <= 2;  // only truly low-end devices
    }
    update();

    mqReduced.addEventListener('change', update);
    mqCoarse.addEventListener('change', update);
    mqFine.addEventListener('change', update);
    if (navigator.connection) {
        navigator.connection.addEventListener('change', update);
    }

    document.addEventListener('visibilitychange', function() {
        G.isHidden = document.hidden;
    });

    // Expose read-only via getter so other code can check atomically
    window.BigCookiesPerf = {
        get reducedMotion() { return G.reducedMotion; },
        get finePointer()   { return G.finePointer; },
        get mobile()        { return G.mobile; },
        get saveData()      { return G.saveData; },
        get isHidden()      { return G.isHidden; },
        get lowPower()       { return G.lowPower; },
        get heroVisible()    { return G.heroVisible; },
        set heroVisible(v)   { G.heroVisible = v; },
        // Re-evaluate (called after resize, etc.)
        refresh: update
    };
})();

// ── Animated favicon (homepage only, deferred) ─
// Gated: skipped entirely on reduced-motion, save-data, low-power, or hidden tab.
// Deferred to idle time via requestIdleCallback (or 4s fallback) to not block critical path.
// Uses shared BigCookiesData cache when available.
(function() {
    var isHomePath = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/';
    if (!isHomePath) return;
    var P = window.BigCookiesPerf;
    // Skip only on explicit reduce-motion or save-data; lowPower is too aggressive
    // for a feature already deferred to idle time with only 4 icons.
    if (P && (P.reducedMotion || P.saveData)) return;
    var favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    var favicons = [];
    var idx = 0;
    var timer = null;

    function cycleFavicon() {
        if (!favicons.length || (P && P.isHidden)) return;
        favicon.href = favicons[idx];
        idx = (idx + 1) % favicons.length;
    }

    function startFavicons() {
        // Hidden sandbox for getBBox() measurement — must be in DOM
        var sandbox = document.createElement('div');
        sandbox.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;visibility:hidden;pointer-events:none;';
        document.body.appendChild(sandbox);

        function tightenSVG(svgText) {
            try {
                sandbox.innerHTML = svgText;
                var svg = sandbox.querySelector('svg');
                if (!svg) return null;
                var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                var els = svg.querySelectorAll('circle, ellipse, rect, path, polygon, polyline, line');
                els.forEach(function(el) {
                    var bbox;
                    try { bbox = el.getBBox(); } catch(e) { return; }
                    if (bbox.width === 0 && bbox.height === 0) return;
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                });
                if (!isFinite(minX)) return null;
                var vbw = maxX - minX, vbh = maxY - minY;
                if (vbw > vbh) vbh = vbw; else vbw = vbh;
                svg.setAttribute('viewBox', [minX, minY, vbw, vbh].join(' '));
                svg.setAttribute('width', '64');
                svg.setAttribute('height', '64');
                var dataURL = 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML);
                sandbox.innerHTML = '';
                return dataURL;
            } catch(e) { sandbox.innerHTML = ''; return null; }
        }

        // Use shared cache for products.json
        var BCD = window.BigCookiesData;
        var productsPromise = BCD ? BCD.fetchJSON('data/products.json') :
            fetch('data/products.json').then(function(r) { return r.json(); });

        productsPromise.then(function(data) {
            var list = data.products || data;
            if (!Array.isArray(list) || !list.length) return;
            // First 4 icons only to keep network cost low
            var subset = list.slice(0, 4);
            var jobs = subset.map(function(p) {
                return fetch(p.icon)
                    .then(function(r) { return r.text(); })
                    .then(function(svg) { return tightenSVG(svg); })
                    .catch(function() { return null; });
            });
            return Promise.all(jobs);
        }).then(function(results) {
            sandbox.remove();
            favicons = results.filter(Boolean);
            if (!favicons.length) return;
            cycleFavicon();
            timer = setInterval(cycleFavicon, 2500);
        }).catch(function() {
            sandbox.remove();
        });
    }

    // Defer to idle time or 4s fallback
    if (window.requestIdleCallback) {
        var idleId = requestIdleCallback(startFavicons, { timeout: 4000 });
    } else {
        setTimeout(startFavicons, 4000);
    }
})();

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


// ── Flavor atlas — minicard cloud ──────────
(function() {
    var cloud = document.getElementById('atlasCloud');
    if (!cloud) return;

    var items = [];
    var activeId = null;

    function renderCloud() {
        cloud.innerHTML = items.map(function(item, i) {
            return '<div class="atlas-card" id="atlasCard-' + item.id + '" data-id="' + item.id + '">' +
                '<img src="' + item.icon + '" alt="' + item.name + '" width="40" height="40" class="atlas-card-icon">' +
                '<h3 class="atlas-card-name">' + item.name + '</h3>' +
                '<span class="atlas-card-mood">' + (item.mood || 'House') + '</span>' +
                '<button class="atlas-card-close" aria-label="Close">&times;</button>' +
                '<p class="atlas-card-desc">' + item.desc + '</p>' +
                '<div class="atlas-card-stats">' +
                    '<div class="atlas-card-stat"><span>Mood</span><strong>' + (item.mood || '—') + '</strong></div>' +
                    '<div class="atlas-card-stat"><span>Intensity</span><strong>' + (item.intensity || '—') + '</strong></div>' +
                    '<div class="atlas-card-stat"><span>Finish</span><strong>' + (item.finish || '—') + '</strong></div>' +
                '</div>' +
                '<div class="atlas-card-ingredients">' + item.ingredients.slice(0, 4).map(function(i) { return '<span>' + i + '</span>'; }).join('') + '</div>' +
                '<p class="atlas-card-origin">' + item.origin + '</p>' +
                '<a class="btn btn-primary atlas-card-cta" href="#build">Build a box with this one</a>' +
            '</div>';
        }).join('');

        // Scatter cards organically — like cookies on a tray
        scatterCards();
        window.addEventListener('resize', scatterCards);

        // CSS float animation provides the gentle base drift (compositor-only, cheap).
        // JS physics adds organic repulsion/attraction on top via left/top.
        cloud.querySelectorAll('.atlas-card').forEach(function(card, i) {
            card.style.setProperty('--float-delay', (i * 0.7) + 's');
            card.style.setProperty('--float-dur', (18 + i * 2.3) + 's');
            card.style.setProperty('--sway-x', ((i % 3) - 1) * 8 + 'px');
            card.style.setProperty('--sway-y', ((i % 2) * 6 - 3) + 'px');
        });

        // Click handlers
        cloud.querySelectorAll('.atlas-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.atlas-card-close') || e.target.closest('.atlas-card-cta')) return;
                var id = card.getAttribute('data-id');
                if (activeId === id) { closeDetail(); } else { openDetail(id); }
            });
        });
        cloud.querySelectorAll('.atlas-card-close').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); closeDetail(); });
        });
    }

    // ═══════════════════════════════════════════
    // ── Force-directed particle cloud ──
    // ═══════════════════════════════════════════
    var CONFIG = {
        repulsionStrength: 9000,    // force multiplier for short-range push
        repulsionRadius: 200,       // max distance (px) at which repulsion activates
        attractStrength: 0.45,      // medium-range pull toward neighbors
        collisionPadding: 36,       // extra px beyond card radius to guarantee no overlap
        damping: 0.88,              // velocity damping per frame
        maxSpeed: 4,                // px/frame speed cap
        cohesion: 0.0008,           // pull toward cloud center
        boundaryPad: 50,            // soft boundary padding
        targetTemperature: 300.0,    // constant Langevin amplitude
        noiseCorrelationTime: 3.0,    // seconds — OU correlation for smooth paths
        simulationTimeScale: 0.075    // global slow-down (1.0 = real-time)
    };

    var simRunning = false, simRAF = null, simLastTime = 0;
    var particles = [];       // { el, x, y, vx, vy, radius, active }
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cloudW = 0, cloudH = 0; // cached bounds (updated by ResizeObserver or scatterCards)

    function cacheCloudBounds() {
        cloudW = cloud.offsetWidth;
        cloudH = Math.max(520, cloudW * 0.7);
        cloud.style.minHeight = cloudH + 'px';
    }

    // ResizeObserver for layout-stable bound updates (no offsetWidth in rAF)
    if (window.ResizeObserver) {
        var cloudResizeObs = new ResizeObserver(function() {
            cacheCloudBounds();
            // Only re-scatter if simulation is paused AND cloud has valid dimensions
            if (!simRunning && cloudW > 0) scatterCards();
        });
        cloudResizeObs.observe(cloud);
    }

    // ── Init / scatter ──────────────────────
    function scatterCards() {
        var cards = cloud.querySelectorAll('.atlas-card');
        var n = cards.length;
        if (!n) return;
        cacheCloudBounds();
        // If cloud has no width yet (e.g. not laid out), retry on next frame
        if (!cloudW) {
            requestAnimationFrame(scatterCards);
            return;
        }
        var w = cloudW, h = cloudH;

        // Preserve existing state across re-scatters
        var existing = {};
        particles.forEach(function(p) { existing[p.el.getAttribute('data-id')] = p; });
        particles = [];

        cards.forEach(function(card, i) {
            if (card.classList.contains('zoomed')) return;
            var id = card.getAttribute('data-id');
            var old = existing[id];

            // Measure rendered card size for radius
            var rect = card.getBoundingClientRect();
            var radius = Math.max(rect.width, rect.height) / 2 + 12;

            // Seeded initial position (golden spiral) or keep existing
            var cx = w / 2, cy = h / 2;
            var angle = i * 2.39996; // golden angle
            var r = 50 + (i / Math.max(n, 1)) * Math.min(w, h) * 0.30;
            var x = cx + Math.cos(angle) * r + (seededRandom(i * 7) - 0.5) * r * 0.25;
            var y = cy + Math.sin(angle) * r + (seededRandom(i * 13 + 5) - 0.5) * r * 0.25;
            if (old) { x = old.x; y = old.y; }

            particles.push({
                el: card, id: id,
                x: x, y: y,
                vx: old ? old.vx : 0,
                vy: old ? old.vy : 0,
                radius: radius,
                mass: 1,
                active: true  // pre-computed; avoids classList.contains in inner loop
            });
        });

        // Absolute positioning with centering transform.
        // left/top are written by JS physics (percentage-based);
        // CSS atlasFloat runs on the transform property for gentle drift.
        // The translate(-50%,-50%) centers each card at its left/top point.
        cards.forEach(function(c) {
            if (c.classList.contains('zoomed')) return;
            c.style.position = 'absolute';
            c.style.transform = 'translate(-50%, -50%)';
            c.style.margin = '0';
        });

        if (prefersReduced) {
            // Static layout — single settle pass
            settleOnce();
        } else if (!simRunning) {
            startSimulation();
        }
    }

    // ── Reduced-motion: one-shot settle ─────
    function settleOnce() {
        var w = cloudW, h = cloudH;
        for (var iter = 0; iter < 120; iter++) {
            stepForces(w, h, 1);
        }
        renderParticles();
    }

    // ── Simulation loop (lifecycle-aware) ──
    function startSimulation() {
        if (prefersReduced) return;
        simRunning = true;
        simLastTime = 0;
        function tick(ts) {
            if (!simRunning) return;
            if (!simLastTime) {
                simLastTime = ts;
            }
            var rawDt = (ts - simLastTime) / 16.667;
            simLastTime = ts;
            // Discard accumulated time (e.g. after tab resume) — never simulate a gap
            rawDt = rawDt > 5 ? 0 : Math.min(rawDt, 3);
            // Apply global time scale
            var dt = rawDt * CONFIG.simulationTimeScale;

            // Use cached bounds (updated by ResizeObserver) — no offsetWidth in rAF
            var w = cloudW, h = cloudH;

            stepForces(w, h, dt);
            applyThermalForces(dt);
            thermalUpdate(dt);
            renderParticles();

            // ── Watchdog: recover after tab resume ──
            if (therm.resumed && !therm.recovered) {
                var elapsed = performance.now() - therm.resumeTime;
                if (elapsed > 600) {
                    // Only restore if KE has genuinely collapsed (browser killed the sim)
                    // A healthy sim at temp 300 has KE ≈ 0.05-0.5; below 0.005 means dead
                    if (therm.smoothKE < 0.005 && therm.checkpoint && therm.checkpoint.velocities.length > 0) {
                        console.log('%c[Thermal] %crecovery: KE collapsed (' + therm.smoothKE.toFixed(4) + '), restoring checkpoint',
                            'color:#E8A850;font-weight:bold', 'color:#0ff');
                        restoreCheckpoint();
                    } else {
                        console.log('%c[Thermal] %cwatchdog: KE healthy (' + therm.smoothKE.toFixed(4) + '), no restore needed',
                            'color:#E8A850;font-weight:bold', 'color:#0f0');
                    }
                    therm.recovered = true;
                    therm.resumed = false;
                }
            }

            simRAF = requestAnimationFrame(tick);
        }
        simRAF = requestAnimationFrame(tick);
    }

    function restoreCheckpoint() {
        var cp = therm.checkpoint;
        if (!cp) return;
        var vMap = {}, nMap = {};
        cp.velocities.forEach(function(v) { vMap[v.id] = v; });
        cp.noiseState.forEach(function(n) { nMap[n.id] = n; });

        // Remove center-of-mass velocity from saved checkpoint
        var sumVX = 0, sumVY = 0, count = 0;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.el.classList.contains('zoomed')) continue;
            var sv = vMap[p.id];
            if (sv) { sumVX += sv.vx; sumVY += sv.vy; count++; }
        }
        var meanVX = count > 0 ? sumVX / count : 0;
        var meanVY = count > 0 ? sumVY / count : 0;

        // Restore velocities directly (already at target temperature — don't normalize upward)
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.el.classList.contains('zoomed')) continue;
            var sv = vMap[p.id];
            if (sv) {
                p.vx = sv.vx - meanVX;
                p.vy = sv.vy - meanVY;
            }
            var sn = nMap[p.id];
            if (sn) { p._langevinX = sn.ox; p._langevinY = sn.oy; }
        }

        // Fallback for particles missing from checkpoint: give them zero-mean velocity
        // at the current temperature so they blend in
        var sigma = Math.sqrt(2 * (1 / CONFIG.noiseCorrelationTime) * CONFIG.targetTemperature) * 0.3;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.el.classList.contains('zoomed')) continue;
            if (!vMap[p.id]) {
                p._langevinX = gaussianRandom() * sigma * 0.5;
                p._langevinY = gaussianRandom() * sigma * 0.5;
                p.vx += p._langevinX * 0.3;
                p.vy += p._langevinY * 0.3;
            }
        }
    }

    // ── Force integration ──────────────────
    // ═══════════════════════════════════════════
    // ── Constant-temperature thermostat ──
    // ═══════════════════════════════════════════
    var therm = {
        temperature: 0,          // current Langevin amplitude (smoothed toward target)
        targetTemp: CONFIG.targetTemperature,
        simTime: 0,             // simulation clock — only advances during active frames
        // Checkpoint (saved periodically + on visibility hidden)
        checkpoint: null,       // { simTime, velocities: [{id, vx, vy}], noiseState: [{id, ox, oy}] }
        lastCheckpointTime: 0,
        // Watchdog
        resumed: false,         // true after a visibility resume, cleared after recovery
        resumeTime: 0,
        recovered: false,
        // Diagnostics
        debugEl: null,
        smoothKE: 0
    };

    function saveCheckpoint() {
        var cp = { simTime: therm.simTime, velocities: [], noiseState: [] };
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.el.classList.contains('zoomed')) continue;
            cp.velocities.push({ id: p.id, vx: p.vx, vy: p.vy });
            cp.noiseState.push({ id: p.id, ox: p._langevinX || 0, oy: p._langevinY || 0 });
        }
        therm.checkpoint = cp;
        therm.lastCheckpointTime = performance.now();
    }

    function thermalUpdate(dt) {
        var n = particles.length;
        if (n === 0 || prefersReduced) { therm.temperature = 0; return; }

        // One-time init
        if (!therm._initLogged) {
            therm._initLogged = true;
            console.log('%c[Thermal] %cconstant %c| particles: ' + n + ' | target: ' + CONFIG.targetTemperature,
                'color:#E8A850;font-weight:bold', 'color:#fff', 'color:#aaa');
        }

        // Advance simulation clock
        therm.simTime += dt;

        // Constant target temperature
        therm.targetTemp = CONFIG.targetTemperature;

        // Smooth temperature toward target
        var tempAlpha = 1 - Math.exp(-dt / 1.5);
        therm.temperature += tempAlpha * (therm.targetTemp - therm.temperature);

        // Periodic checkpoint (every ~400ms)
        var now = performance.now();
        if (now - therm.lastCheckpointTime > 400) {
            saveCheckpoint();
        }

        // Compute smoothed KE for diagnostics
        var ke = 0, activeN = 0;
        for (var i = 0; i < n; i++) {
            var p = particles[i];
            if (!p.active) continue;
            activeN++;
            ke += 0.5 * (p.vx * p.vx + p.vy * p.vy);
        }
        if (activeN > 0) {
            ke /= activeN;
            var alpha = 1 - Math.exp(-dt / 0.5);
            therm.smoothKE += alpha * (ke - therm.smoothKE);
        }

        updateDebugOverlay();
    }

    // ── Correlated Langevin force (OU process per particle) ──
    function applyThermalForces(dt) {
        if (prefersReduced) return;
        if (therm.temperature < 0.5) return;
        var n = particles.length;
        var sumFX = 0, sumFY = 0, activeCount = 0;
        var tau = CONFIG.noiseCorrelationTime;
        var theta = 1 / Math.max(tau, 0.1);
        // Scale noise so steady-state KE is proportional to temperature
        var sigma = Math.sqrt(2 * theta * therm.temperature) * 0.3;

        for (var i = 0; i < n; i++) {
            var p = particles[i];
            if (!p.active) continue;
            activeCount++;

            // Init OU state
            if (p._langevinX === undefined) { p._langevinX = 0; p._langevinY = 0; }

            // Correlated noise: OU step
            var sqrtDt = Math.sqrt(Math.min(dt, 0.5));
            var g1 = gaussianRandom(), g2 = gaussianRandom();
            p._langevinX += -theta * p._langevinX * dt + sigma * sqrtDt * g1;
            p._langevinY += -theta * p._langevinY * dt + sigma * sqrtDt * g2;

            sumFX += p._langevinX;
            sumFY += p._langevinY;
        }
        if (activeCount === 0) return;

        // Mean-subtract
        var meanFX = sumFX / activeCount;
        var meanFY = sumFY / activeCount;
        var cap = CONFIG.targetTemperature * 0.3;
        for (var i = 0; i < n; i++) {
            var p = particles[i];
            if (!p.active) continue;
            var fx = p._langevinX - meanFX;
            var fy = p._langevinY - meanFY;
            var m = Math.sqrt(fx * fx + fy * fy);
            if (m > cap) { fx *= cap / m; fy *= cap / m; }
            p.vx += fx * dt;
            p.vy += fy * dt;
        }
    }

    // Box-Muller Gaussian random
    function gaussianRandom() {
        var u1 = Math.random(), u2 = Math.random();
        return Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);
    }

    // Dev diagnostic overlay (enabled via ?debug in URL)
    function updateDebugOverlay() {
        if (therm.debugEl === undefined) {
            if (window.location.search.indexOf('debug') === -1) { therm.debugEl = null; return; }
            therm.debugEl = document.createElement('div');
            therm.debugEl.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:9999;background:rgba(0,0,0,0.82);color:#0f0;font:11px monospace;padding:10px 14px;border-radius:8px;pointer-events:none;line-height:1.6;max-width:240px';
            document.body.appendChild(therm.debugEl);
        }
        if (!therm.debugEl) return;
        therm.debugEl.innerHTML =
            'temp: <b>' + therm.temperature.toFixed(0) + '</b> / ' + CONFIG.targetTemperature + '<br>' +
            'KE: ' + therm.smoothKE.toFixed(3) + '<br>' +
            'simTime: ' + therm.simTime.toFixed(1) + 's<br>' +
            'ckpt: ' + (therm.checkpoint ? (performance.now() - therm.lastCheckpointTime).toFixed(0) + 'ms ago' : 'none') + '<br>' +
            (therm.resumed ? 'watchdog: armed' : '');
    }

    function stepForces(w, h, dt) {
        var n = particles.length;
        var R_STR  = CONFIG.repulsionStrength;
        var R_RAD  = CONFIG.repulsionRadius;
        var A_STR  = CONFIG.attractStrength;
        var CPAD   = CONFIG.collisionPadding;
        var COH    = CONFIG.cohesion;
        var DAMP   = Math.pow(CONFIG.damping, dt);
        var VMAX   = CONFIG.maxSpeed * dt;
        var cx = w / 2, cy = h / 2;
        // Proven double-loop: each pair is evaluated twice (equal-and-opposite
        // emerges naturally). Kept pre-computed .active flag to avoid classList
        // in the inner loop.
        for (var i = 0; i < n; i++) {
            var pi = particles[i];
            if (!pi.active) continue;
            var fx = 0, fy = 0;

            for (var j = 0; j < n; j++) {
                if (i === j) continue;
                var pj = particles[j];
                if (!pj.active) continue;
                var dx = pi.x - pj.x;
                var dy = pi.y - pj.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 0.5) dist = 0.5;
                var nx = dx / dist, ny = dy / dist;

                var collisionDist = pi.radius + pj.radius + CPAD * 2;

                if (dist < R_RAD) {
                    var urgency = dist < collisionDist ? 3.0 : 1.0;
                    var repelF = R_STR * urgency / (dist * dist + 400);
                    fx += nx * repelF;
                    fy += ny * repelF;
                } else if (dist < R_RAD * 2.4) {
                    var attractF = A_STR * (dist - R_RAD) / R_RAD;
                    fx -= nx * attractF;
                    fy -= ny * attractF;
                }
            }

            // ── Cohesion toward cloud center ──
            fx += (cx - pi.x) * COH;
            fy += (cy - pi.y) * COH;

            // ── Integrate ──
            pi.vx = (pi.vx + fx * dt) * DAMP;
            pi.vy = (pi.vy + fy * dt) * DAMP;
            var speed = Math.sqrt(pi.vx * pi.vx + pi.vy * pi.vy);
            if (speed > VMAX) { pi.vx *= VMAX / speed; pi.vy *= VMAX / speed; }
            pi.x += pi.vx;
            pi.y += pi.vy;

            // ── Soft boundary ──
            var pad = CONFIG.boundaryPad;
            if (pi.x < pad)          { pi.x = pad;          pi.vx *= -0.2; }
            if (pi.x > w - pad)      { pi.x = w - pad;      pi.vx *= -0.2; }
            if (pi.y < pad)          { pi.y = pad;          pi.vy *= -0.2; }
            if (pi.y > h - pad)      { pi.y = h - pad;      pi.vy *= -0.2; }
        }
    }

    // ── Render positions to DOM ─────────────
    // Uses left/top percentages with translate(-50%,-50%) centering.
    // CSS atlasFloat animation runs on transform — using separate properties
    // avoids fighting between the two motion systems.
    function renderParticles() {
        var w = cloudW, h = cloudH;
        if (!w || !h) return;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (!p.active) continue;
            p.el.style.left = (p.x / w * 100) + '%';
            p.el.style.top  = (p.y / h * 100) + '%';
        }
    }

    // ── Lifecycle: pause on hide, resume clean ──
    function onHidden() {
        if (!simRunning) return; // already stopped (viewport + tab both inactive)
        saveCheckpoint();
        simRunning = false;
        if (simRAF) { cancelAnimationFrame(simRAF); simRAF = null; }
        console.log('%c[Thermal] %cfrozen — checkpoint saved (simTime: ' + therm.simTime.toFixed(1) + 's)',
            'color:#E8A850;font-weight:bold', 'color:#aaa');
    }

    function onVisible() {
        if (prefersReduced || !particles.length) return;
        if (simRunning) return; // already running
        if (!simInViewport) return; // scrolled off-screen — don't waste cycles
        therm.resumed = true;
        therm.resumeTime = performance.now();
        therm.recovered = false;
        simLastTime = 0; // force dt=0 on first frame
        console.log('%c[Thermal] %cresumed — dt reset, watchdog armed',
            'color:#E8A850;font-weight:bold', 'color:#0f0');
        startSimulation();
    }

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) onHidden();
        else onVisible();
    });
    window.addEventListener('pagehide', onHidden);
    window.addEventListener('pageshow', function() { if (!document.hidden) onVisible(); });
    // Freeze/resume (supported in some browsers)
    window.addEventListener('freeze', onHidden);
    window.addEventListener('resume', function() { if (!document.hidden) onVisible(); });

    // ── Viewport-aware pause: freeze simulation when scrolled off-screen ──
    var simInViewport = true; // optimistic default — observer corrects on init
    if (window.IntersectionObserver) {
        var simViewportObserver = new IntersectionObserver(function(entries) {
            simInViewport = entries[0].isIntersecting;
            if (simInViewport) {
                if (!document.hidden) onVisible();
            } else {
                onHidden();
            }
        }, { threshold: 0 });
        simViewportObserver.observe(cloud);
    }

    // ── Resize ──────────────────────────────
    window.addEventListener('resize', function() {
        clearTimeout(window._scatterTid);
        window._scatterTid = setTimeout(scatterCards, 200);
    });

    // ── Reduced motion listener ─────────────
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e) {
        prefersReduced = e.matches;
        if (prefersReduced) {
            simRunning = false;
            if (simRAF) { cancelAnimationFrame(simRAF); simRAF = null; }
            cacheCloudBounds();
            settleOnce();
        } else {
            scatterCards();
        }
    });

    function stopSimulation() {
        simRunning = false;
        if (simRAF) { cancelAnimationFrame(simRAF); simRAF = null; }
    }
    window.addEventListener('beforeunload', stopSimulation);

    // Sync particle.active with DOM zoom state (called after zoom/unzoom)
    function syncActiveFlags() {
        for (var i = 0; i < particles.length; i++) {
            particles[i].active = !particles[i].el.classList.contains('zoomed');
        }
    }

    // ── Adaptive quality: if frame budget is tight, reduce simulation frequency ──
    var _slowFrameCount = 0;
    var _lastQualityCheck = 0;
    var _qualityReduced = false;
    function checkFrameBudget(ts) {
        if (!_lastQualityCheck) { _lastQualityCheck = ts; return; }
        var elapsed = ts - _lastQualityCheck;
        _lastQualityCheck = ts;
        // If frame took >33ms (under 30fps), increment slow counter
        if (elapsed > 33) {
            _slowFrameCount++;
        } else {
            _slowFrameCount = Math.max(0, _slowFrameCount - 0.5);
        }
        // After 3 consecutive slow seconds, switch to half-rate physics
        if (_slowFrameCount > 90 && !_qualityReduced) {
            _qualityReduced = true;
            CONFIG.simulationTimeScale = CONFIG.simulationTimeScale * 0.5;
            CONFIG.maxSpeed = CONFIG.maxSpeed * 0.6;
            if (window._debugPerf) console.log('[Atlas] Low-motion fallback engaged');
        }
    }

    // Deterministic seeded random
    function seededRandom(seed) {
        var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    // ── Detail overlay ──────────────────────
    var detailEl = null;

    function openDetail(id) {
        closeDetail();
        var item = items.find(function(it) { return it.id === id; });
        if (!item) return;
        activeId = id;

        cloud.querySelectorAll('.atlas-card').forEach(function(c) {
            if (c.getAttribute('data-id') !== id) c.classList.add('dimmed');
        });
        syncActiveFlags(); // mark zoomed card inactive in simulation
        document.body.style.overflow = 'hidden';

        detailEl = document.createElement('div');
        detailEl.className = 'atlas-detail';
        detailEl.setAttribute('role', 'dialog');
        detailEl.setAttribute('aria-label', item.name);
        detailEl.innerHTML =
            '<button class="atlas-detail-close" aria-label="Close">&times;</button>' +
            '<div class="atlas-detail-header">' +
                '<img src="' + item.icon + '" alt="" width="48" height="48">' +
                '<div><h3>' + item.name + '</h3><span class="atlas-detail-mood">' + (item.mood || 'House') + '</span></div>' +
            '</div>' +
            '<p class="atlas-detail-desc">' + item.desc + '</p>' +
            '<div class="atlas-detail-stats">' +
                '<div><span>Mood</span><strong>' + (item.mood || '—') + '</strong></div>' +
                '<div><span>Intensity</span><strong>' + (item.intensity || '—') + '</strong></div>' +
                '<div><span>Finish</span><strong>' + (item.finish || '—') + '</strong></div>' +
            '</div>' +
            '<div class="atlas-detail-tags">' + item.ingredients.slice(0, 4).map(function(ing) { return '<span>' + ing + '</span>'; }).join('') + '</div>' +
            (item.origin ? '<p class="atlas-detail-origin">' + item.origin + '</p>' : '') +
            '<a class="btn btn-primary" href="#build">Build a box with this one</a>';

        document.body.appendChild(detailEl);
        detailEl.querySelector('.atlas-detail-close').addEventListener('click', closeDetail);
        detailEl.setAttribute('tabindex', '-1');
        detailEl.focus({ preventScroll: true });
    }

    function closeDetail() {
        if (!detailEl) return;
        if (detailEl.parentNode) detailEl.parentNode.removeChild(detailEl);
        detailEl = null;
        activeId = null;
        cloud.querySelectorAll('.atlas-card.dimmed').forEach(function(c) { c.classList.remove('dimmed'); });
        syncActiveFlags(); // restore all particles to active
        document.body.style.overflow = '';
    }

    // ESC / click-outside
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && detailEl) closeDetail();
    });
    document.addEventListener('pointerdown', function(e) {
        if (!detailEl) return;
        var path = e.composedPath();
        for (var i = 0; i < path.length; i++) { if (path[i] === detailEl) return; }
        closeDetail();
    });


    // Use shared cache for products.json
    var BCD_atlas = window.BigCookiesData;
    var atlasFetch = BCD_atlas ? BCD_atlas.fetchJSON('data/products.json') :
        fetch('data/products.json').then(function(r) { return r.json(); });
    atlasFetch
        .then(function(data) {
            if (!data.products || !Array.isArray(data.products) || !data.products.length) throw new Error('No products');
            items = data.products;
            renderCloud();
        })
        .catch(function() {
            cloud.innerHTML = '<p class="atlas-loading">Open the site through a local server or production host to load the tasting board.</p>';
        });
})();


// ── Scroll indicator fade ────────────────────
(function() {
    var indicator = document.getElementById('scrollIndicator');
    if (!indicator) return;
    var faded = false;
    window.addEventListener('scroll', function() {
        var shouldFade = window.scrollY > 200;
        if (shouldFade !== faded) {
            faded = shouldFade;
            indicator.classList.toggle('faded', faded);
        }
    }, {passive: true});
})();

// ── Cookie parallax (scroll velocity + mouse) ──
const heroCookie = document.getElementById('heroCookie');
if (heroCookie) {
    var scrollTicking = false;
    var mouseX = 0, mouseY = 0;
    var lastScrollY = 0, scrollVelocity = 0;
    var targetRotate = 0, targetTranslateY = 0;
    var currentRotate = 0, currentTranslateY = 0;

    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY;
        scrollVelocity = (scrollY - lastScrollY) * 0.15;
        lastScrollY = scrollY;
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                targetRotate = Math.max(-15, Math.min(15, scrollY * 0.08 + mouseX * 0.02 + scrollVelocity * 0.5));
                targetTranslateY = scrollY * 0.03 + mouseY * 0.02;
                // Restart the interpolation loop if it had stopped (converged)
                if (!heroParallaxRunning && heroVisible) {
                    heroParallaxRunning = true;
                    smoothParallax();
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, {passive: true});

    // Smooth interpolation loop for velocity-based motion
    var heroVisible = true;
    var heroParallaxRunning = true;
    var PARALLAX_EPSILON = 0.005; // below this threshold, values are "converged"
    function smoothParallax() {
        if (!heroVisible) { heroParallaxRunning = false; return; }
        var dr = targetRotate - currentRotate;
        var dy = targetTranslateY - currentTranslateY;
        // Stop the loop when fully converged — saves GPU when page is idle
        if (Math.abs(dr) < PARALLAX_EPSILON && Math.abs(dy) < PARALLAX_EPSILON &&
            heroParallaxRunning && targetRotate === 0 && targetTranslateY === 0) {
            // Values are at rest — keep transform but stop looping
            heroParallaxRunning = false;
            return;
        }
        heroParallaxRunning = true;
        currentRotate += dr * 0.12;
        currentTranslateY += dy * 0.12;
        heroCookie.style.transform = 'rotate(' + currentRotate + 'deg) translateY(' + currentTranslateY + 'px)';
        requestAnimationFrame(smoothParallax);
    }
    smoothParallax();

    // Pause parallax when hero scrolls off-screen
    if (window.IntersectionObserver) {
        var heroViewportObserver = new IntersectionObserver(function(entries) {
            heroVisible = entries[0].isIntersecting;
            if (window.BigCookiesPerf) window.BigCookiesPerf.heroVisible = heroVisible;
            if (heroVisible && !heroParallaxRunning) {
                heroParallaxRunning = true;
                smoothParallax();
            }
        }, { threshold: 0 });
        heroViewportObserver.observe(heroCookie);
    }

    document.addEventListener('mousemove', function(e) {
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        mouseX = (e.clientX - cx) / cx;
        mouseY = (e.clientY - cy) / cy;
    });
}

// ── Hero cursor crumbs ──────────────────────
// Gated: fine-pointer only, hero visible, reduced-motion off. Max 6 live DOM nodes. 80ms throttle.
(function() {
    var P = window.BigCookiesPerf;
    if (P && (P.reducedMotion || !P.finePointer || P.mobile)) return;
    var cookie = document.getElementById('heroCookie');
    if (!cookie) return;
    var crumbs = [];
    var maxCrumbs = 6;
    var colors = ['#C8853E','#D4954B','#A8612E','#3C1D0E','#E8A850','#8B5A2E'];
    var ticking = false;
    var mx = 0, my = 0;
    var lastTime = 0;

    document.addEventListener('mousemove', function(e) {
        if (P && !P.heroVisible) return;
        var now = Date.now();
        if (now - lastTime < 80) return; // ~12 fps max
        lastTime = now;
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

// ── Cursor sparkle trail ──────────────────
// Gated: fine-pointer only, not on mobile, reduced-motion off. Max 8 live DOM nodes. 200ms throttle.
(function() {
    var P = window.BigCookiesPerf;
    if (P && (P.reducedMotion || !P.finePointer || P.mobile)) return;
    var isHomePath2 = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/';
    if (!isHomePath2) return;
    var lastSparkle = 0;
    var liveCount = 0;
    var MAX_LIVE = 8;
    var sparkleColors = ['#E8A850','#FFD700','#C8853E','#F5D5A0','#FFF5E9'];
    document.addEventListener('mousemove', function(e) {
        if (liveCount >= MAX_LIVE) return;
        var now = Date.now();
        if (now - lastSparkle < 180) return; // throttle
        lastSparkle = now;
        // Don't sparkle over nav or forms
        if (e.target.closest('nav') || e.target.closest('form') || e.target.closest('button')) return;

        liveCount++;
        var spark = document.createElement('span');
        var size = 2 + Math.random() * 4;
        spark.style.cssText =
            'position:fixed;z-index:9990;pointer-events:none;' +
            'left:' + (e.clientX - size/2) + 'px;top:' + (e.clientY - size/2) + 'px;' +
            'width:' + size + 'px;height:' + size + 'px;' +
            'background:' + sparkleColors[Math.floor(Math.random()*sparkleColors.length)] + ';' +
            'border-radius:50%;' +
            'animation: sparkleTrail 0.7s ease-out forwards;';
        document.body.appendChild(spark);
        setTimeout(function() {
            if (spark.parentNode) spark.remove();
            liveCount--;
        }, 750);
    });
})();

// ── Live activity counter ────────────────
(function() {
    var isHomePath3 = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/';
    if (!isHomePath3) return;

    var el = document.getElementById('liveCounter');
    if (!el) {
        // Create the counter and insert into hero badge area
        var badge = document.querySelector('.hero-badge');
        if (!badge) return;
        var counter = document.createElement('span');
        counter.id = 'liveCounter';
        counter.style.cssText = 'margin-left:0.5rem;padding-left:0.5rem;border-left:1px solid rgba(200,133,62,0.3);font-weight:500;color:var(--ink);font-size:0.75rem;letter-spacing:0;text-transform:none;';
        badge.appendChild(counter);
        el = counter;
    }

    var phrases = [
        function(){ return '👥 ' + (3 + Math.floor(Math.random()*8)) + ' browsing now'; },
        function(){ return '📦 ' + (8 + Math.floor(Math.random()*16)) + ' boxes shipped today'; },
        function(){ return '🍪 ' + (42 + Math.floor(Math.random()*38)) + ' baking right now'; },
        function(){ return '⭐ ' + (12 + Math.floor(Math.random()*9)) + ' five-star reviews'; },
        function(){ return '🔥 ' + (4 + Math.floor(Math.random()*6)) + ' orders this hour'; },
    ];

    function rotate() {
        var i = Math.floor(Math.random() * phrases.length);
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s';
        setTimeout(function() {
            el.textContent = phrases[i]();
            el.style.opacity = '1';
        }, 300);
    }

    rotate();
    setInterval(rotate, 4000 + Math.random() * 2000);
})();

// ── Batch countdown (live) ────────────────
(function() {
    const el = document.getElementById('batchCountdown');
    if (!el) return;

    function getNextFridayNoon() {
        var now = new Date();
        var target = new Date(now);
        target.setDate(target.getDate() + ((5 - target.getDay() + 7) % 7));
        target.setHours(12, 0, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 7);
        return target;
    }

    function update() {
        var now = new Date();
        var target = getNextFridayNoon();
        var diff = target - now;
        // Calendar-day difference (not 24hr buckets) so "tomorrow" means the next calendar day
        var nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var targetMid = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        var d = Math.round((targetMid - nowMid) / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);

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

// ── Kitchen chapter reveal + progress dots ──
(function() {
    var chapters = document.querySelectorAll('.kitchen-chapter');
    if (!chapters.length) return;

    // Create floating chapter dots (desktop only)
    var dotsNav = document.createElement('nav');
    dotsNav.className = 'chapter-dots';
    dotsNav.setAttribute('aria-label', 'Chapter navigation');
    chapters.forEach(function(_, i) {
        var dot = document.createElement('span');
        dot.className = 'chapter-dot';
        dot.setAttribute('title', 'Chapter ' + (i + 1));
        dotsNav.appendChild(dot);
    });
    document.body.appendChild(dotsNav);

    var dots = dotsNav.querySelectorAll('.chapter-dot');
    var chapterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
    }, { threshold: 0.2 });

    var dotObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            var idx = Array.from(chapters).indexOf(entry.target);
            dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
            // Fill previous dots
            dots.forEach(function(d, i) { d.classList.toggle('seen', i <= idx); });
        });
    }, { threshold: 0.5 });

    chapters.forEach(function(ch) {
        chapterObserver.observe(ch);
        dotObserver.observe(ch);
    });

    // Also observe stats and bakers note
    document.querySelectorAll('.kitchen-stats, .bakers-note').forEach(function(el) {
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

        // Show first slide immediately
        slides[0].classList.add('active');

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

// ── Product card tap-to-flip (mobile + a11y) ──
document.querySelectorAll('.product-card').forEach(card => {
    if (card.hasAttribute('data-flip-bound')) return;
    card.setAttribute('data-flip-bound', '1');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', card.querySelector('.product-name')?.textContent + ' — click to see ingredients');
    let flipTimer;
    function toggleFlip() {
        const wasFlipped = card.classList.contains('flipped');
        card.classList.toggle('flipped');
        clearTimeout(flipTimer);
        if (!wasFlipped) {
            flipTimer = setTimeout(() => card.classList.remove('flipped'), 3000);
        }
    }
    card.addEventListener('click', (e) => {
        // Don't flip when clicking links/buttons
        if (e.target.closest('a, button')) return;
        toggleFlip();
    });
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
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
    var isHome = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/';
    if (!isHome) return;
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
    // Create the element dynamically — insert into footer
    var el = document.createElement('div');
    el.id = 'bakingTip';
    el.style.cssText = 'text-align:center;padding:1rem 1.5rem;font-size:0.8125rem;color:#8B6F5C;font-style:italic;line-height:1.6;min-height:2.5rem;';
    var footer = document.getElementById('site-footer');
    if (!footer) return;
    // Insert before footer content
    var footerObserver = new MutationObserver(function() {
        if (footer.children.length > 0 && !document.getElementById('bakingTip')?.parentNode) {
            footer.insertBefore(el, footer.firstChild);
            footerObserver.disconnect();
            startRotator();
        }
    });
    footerObserver.observe(footer, { childList: true });
    // Fallback: insert after 2 seconds if footer hasn't rendered
    setTimeout(function() {
        if (!el.parentNode && footer) { footer.insertBefore(el, footer.firstChild); startRotator(); }
    }, 2000);

    var tipIdx = new Date().getDate() % tips.length;
    var charIdx = 0;
    var currentTip = '';
    var typeTimer;

    function typeNextChar() {
        if (charIdx === 0) {
            currentTip = '💡 ' + tips[tipIdx];
            el.textContent = '💡 ';
        }
        if (charIdx < currentTip.length) {
            el.textContent = currentTip.substring(0, charIdx + 1);
            charIdx++;
            typeTimer = setTimeout(typeNextChar, 25 + Math.random() * 30);
        } else {
            // Pause after typing, then erase and go to next
            typeTimer = setTimeout(eraseTip, 4000);
        }
    }

    function startRotator() {
        typeTimer = setTimeout(typeNextChar, 2000);
    }

    function eraseTip() {
        if (charIdx > 2) { // keep the 💡
            charIdx--;
            el.textContent = currentTip.substring(0, charIdx);
            typeTimer = setTimeout(eraseTip, 12 + Math.random() * 15);
        } else {
            tipIdx = (tipIdx + 1) % tips.length;
            charIdx = 0;
            typeTimer = setTimeout(typeNextChar, 500);
        }
    }
})();

// ── Performance debug overlay (?debug or ?perf) ──
(function() {
    var qs = window.location.search;
    var enabled = qs.indexOf('debug') !== -1 || qs.indexOf('perf') !== -1;
    if (!enabled) return;
    window._debugPerf = true;
    var panel = document.createElement('div');
    panel.id = 'perfDebug';
    panel.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:99999;background:rgba(0,0,0,0.85);color:#0f0;font:11px/1.6 monospace;padding:10px 14px;border-radius:8px;pointer-events:none;max-width:260px;white-space:pre-line';
    document.body.appendChild(panel);

    var fpsFrames = 0, fpsLast = performance.now(), fpsCurrent = 0;
    var longTaskCount = 0;

    // Long-task observer
    if (window.PerformanceObserver) {
        try {
            var lo = new PerformanceObserver(function(list) {
                var entries = list.getEntries();
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].duration > 50) longTaskCount++;
                }
            });
            lo.observe({ entryTypes: ['longtask'] });
        } catch(e) { /* longtask not supported */ }
    }

    function updateDebug() {
        fpsFrames++;
        var now = performance.now();
        if (now - fpsLast >= 1000) {
            fpsCurrent = Math.round(fpsFrames / ((now - fpsLast) / 1000));
            fpsFrames = 0; fpsLast = now;
        }
        // Gather atlas state from the existing simulation
        var simActive = (typeof simRunning !== 'undefined') ? simRunning : false;
        var simParticle = (typeof particles !== 'undefined') ? particles.length : 0;
        var qualityInfo = (typeof _qualityReduced !== 'undefined' && _qualityReduced) ? ' (low-motion)' : '';

        panel.textContent =
            'FPS: ' + fpsCurrent + qualityInfo + '\n' +
            'Atlas: ' + (simActive ? 'running' : 'paused') + ' | ' + simParticle + ' particles\n' +
            'Long tasks: ' + longTaskCount + ' (>50ms)\n' +
            'Reduced motion: ' + (window.BigCookiesPerf && window.BigCookiesPerf.reducedMotion ? 'yes' : 'no') + '\n' +
            'Fine pointer: ' + (window.BigCookiesPerf && window.BigCookiesPerf.finePointer ? 'yes' : 'no');

        requestAnimationFrame(updateDebug);
    }
    requestAnimationFrame(updateDebug);
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

    // Auto-switch to dark mode after 8pm if user hasn't set a manual preference
    var savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        function autoTheme() {
            var hour = new Date().getHours();
            var shouldBeDark = hour >= 20 || hour < 6;
            var isDark = html.getAttribute('data-theme') === 'dark';
            if (shouldBeDark !== isDark) {
                html.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
            }
        }
        autoTheme();
        // Re-check every 30 minutes
        setInterval(autoTheme, 1800000);
    }
})();

// ── Footer year auto-update ──────────────
(function() {
    function updateYear() {
        // Page baked timestamp
        var timeEl = document.getElementById('pageBakedTime');
        if (timeEl) {
            var now = new Date();
            var h = now.getHours(), m = now.getMinutes();
            var ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            timeEl.textContent = 'today at ' + h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
        }
        if (!timeEl) { setTimeout(updateYear, 500); return; }
    }
    updateYear();
})();

// ── Bench Sheet month updater ──────────────
(function() {
    var el = document.getElementById('benchSheetMonth');
    if (el) {
        var m = new Date().getMonth() + 1;
        el.textContent = (m < 10 ? '0' : '') + m;
    }
})();

// ── Dynamic hardcoded counts → live data ────
(function() {
    var FOUNDING = 2024;
    var now = new Date();
    var thisYear = now.getFullYear();
    var yearsSince = thisYear - FOUNDING;
    var jsonCache = {};

    // Number → English word (handles 0–99 for bakery-scale counts)
    function toWord(n) {
        var ones = ['zero','one','two','three','four','five','six','seven','eight','nine',
                    'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
        var tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
        n = parseInt(n, 10);
        if (isNaN(n)) return n;
        if (n < 20) return ones[n] || String(n);
        if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? '-' + ones[n%10] : '');
        return String(n); // 100+ stays numeric
    }

    // Set text on a dhc element, converting to word form.
    // Capitalizes if it's the head of a sentence (first child or follows only whitespace).
    function setDHC(el, value) {
        var word = toWord(value);
        // Check if this dhc span starts the sentence/heading
        var prev = el.previousSibling;
        var isHead = !prev || (prev.nodeType === 3 && /^\s*$/.test(prev.textContent));
        if (isHead) word = word.charAt(0).toUpperCase() + word.slice(1);
        el.textContent = word;
    }

    // Check if a faculty role is a hands-on baking role
    function isBakerRole(role) {
        if (!role) return false;
        var r = role.toLowerCase();
        return r.indexOf('baker') !== -1 || r.indexOf('chef') !== -1 ||
               r.indexOf('master') !== -1 || r.indexOf('architect') !== -1;
    }

    // Year-based replacements (available immediately, no data needed)
    function injectYears() {
        forEach('.dhc[data-of="current-year"]', function(el) { el.textContent = thisYear; });
        forEach('.dhc[data-of="founding-year"]', function(el) { el.textContent = FOUNDING; });
        forEach('.dhc[data-of="years-since"]', function(el) { el.textContent = yearsSince; });
        forEach('.dhc[data-of="year-range"]', function(el) { el.textContent = FOUNDING + '–' + thisYear; });
        // Update meta / og descriptions
        updateMetaDesc();
    }
    injectYears();

    // Count-based replacements (need DOM elements or JSON data)
    function injectCounts() {
        // Count from rendered DOM elements
        var counts = {
            'products': document.querySelectorAll('.product-card').length || 0,
            'faqs': document.querySelectorAll('.faq-item').length || 0,
            'awards': document.querySelectorAll('.award-card').length || 0,
            'faculty-current': document.querySelectorAll('.faculty-card:not(.alumni)').length || 0,
            'faculty-total': document.querySelectorAll('.faculty-card').length || 0,
            'faculty-past': document.querySelectorAll('.faculty-card.alumni').length || 0,
            'news': document.querySelectorAll('.news-card').length || 0,
            'archive': document.querySelectorAll('.archive-card').length || 0,
            'testimonials': document.querySelectorAll('.testimonial-slide').length || 0,
            'kitchen-stories': document.querySelectorAll('.polaroid').length || 0,
            'gift-tiers': document.querySelectorAll('.gift-card').length || 0
        };

        // Apply counts to all .dhc elements (word form for readability)
        forEach('.dhc[data-of]', function(el) {
            var key = el.getAttribute('data-of');
            if (key === 'current-year' || key === 'founding-year' || key === 'years-since' || key === 'year-range') return;
            if (counts[key] !== undefined && counts[key] > 0) {
                setDHC(el, counts[key]);
            }
        });

        // Gold medal count
        forEach('.dhc[data-of="awards-gold"]', function(el) {
            var gold = 0;
            document.querySelectorAll('.award-card').forEach(function(c) {
                if (c.querySelector('.award-medal--gold') || (c.getAttribute('data-medal') === 'gold')) gold++;
            });
            if (gold > 0) setDHC(el, gold);
        });

        // Distinct years for awards
        forEach('.dhc[data-of="awards-years"]', function(el) {
            var years = {};
            document.querySelectorAll('.award-card').forEach(function(c) {
                var yEl = c.querySelector('.award-year');
                if (yEl) years[yEl.textContent.trim()] = true;
            });
            var yList = Object.keys(years);
            if (yList.length > 0) setDHC(el, yList.length);
        });

        // Bakers count — only hands-on baking roles (not pack/ship/logistics/customer)
        forEach('.dhc[data-of="bakers"]', function(el) {
            var count = 0;
            document.querySelectorAll('.faculty-card:not(.alumni) .faculty-role').forEach(function(roleEl) {
                if (isBakerRole(roleEl.textContent)) count++;
            });
            if (count > 0) setDHC(el, count);
        });

        // Kitchen chapters
        forEach('.dhc[data-of="kitchen-chapters"]', function(el) {
            var sections = document.querySelectorAll('[data-load*="kitchen-stories"]');
            if (sections.length > 0) setDHC(el, sections.length);
        });

        // Internship station count
        forEach('.dhc[data-of="internship-stations"]', function(el) {
            var card = document.querySelector('.internship-card, .faculty-hiring-card');
            if (card) {
                var m = card.textContent.match(/all\s+(\d+)\s+stations/);
                if (m) setDHC(el, parseInt(m[1], 10));
            }
        });

        // For pages without rendered cards (about.html etc), try JSON fallback
        fillFromJSON();
    }

    // JSON fallback — always fetch for faqs (DOM may be a teaser subset),
    // and for pages without rendered cards (about.html etc)
    function fillFromJSON() {
        var hasDHCFaculty = document.querySelectorAll('.dhc[data-of="faculty-current"], .dhc[data-of="faculty-total"], .dhc[data-of="faculty-past"], .dhc[data-of="bakers"]').length > 0;
        var hasDHCProducts = document.querySelectorAll('.dhc[data-of="products"]').length > 0;
        var hasDHCFaqs = document.querySelectorAll('.dhc[data-of="faqs"]').length > 0;
        var hasDHCAwards = document.querySelectorAll('.dhc[data-of="awards"], .dhc[data-of="awards-gold"], .dhc[data-of="awards-years"]').length > 0;

        // Always fetch faqs from JSON — DOM may be a teaser subset (e.g. index shows 3 of 11)
        if (hasDHCFaqs) {
            fetchJSON('data/faq.json', function(data) {
                if (!data) return;
                forEach('.dhc[data-of="faqs"]', function(el) { setDHC(el, Array.isArray(data) ? data.length : 0); });
            });
        }

        if (hasDHCFaculty && !document.querySelectorAll('.faculty-card').length) {
            fetchJSON('data/faculty.json', function(data) {
                if (!data) return;
                var current = (data.current || []);
                var past = (data.past || []).length;
                var currentCount = current.length;
                var bakerCount = 0;
                current.forEach(function(m) { if (isBakerRole(m.role)) bakerCount++; });
                forEach('.dhc[data-of="faculty-current"]', function(el) { setDHC(el, currentCount); });
                forEach('.dhc[data-of="faculty-total"]', function(el) { setDHC(el, currentCount + past); });
                forEach('.dhc[data-of="faculty-past"]', function(el) { setDHC(el, past); });
                forEach('.dhc[data-of="bakers"]', function(el) { setDHC(el, bakerCount); });
            });
        }

        if (hasDHCProducts && !document.querySelectorAll('.product-card').length) {
            fetchJSON('data/products.json', function(data) {
                if (!data) return;
                forEach('.dhc[data-of="products"]', function(el) { setDHC(el, Array.isArray(data) ? data.length : 0); });
            });
        }

        if (hasDHCAwards && !document.querySelectorAll('.award-card').length) {
            fetchJSON('data/awards.json', function(data) {
                if (!data) return;
                var arr = Array.isArray(data) ? data : [];
                forEach('.dhc[data-of="awards"]', function(el) { setDHC(el, arr.length); });
                var gold = arr.filter(function(a) { return a.medal === 'gold'; }).length;
                forEach('.dhc[data-of="awards-gold"]', function(el) { if (gold > 0) setDHC(el, gold); });
            });
        }
    }

    function fetchJSON(url, cb) {
        if (jsonCache[url]) { cb(jsonCache[url]); return; }
        // Try shared cache first (Promise-based), fall back to XHR
        var BCD = window.BigCookiesData;
        if (BCD) {
            BCD.fetchJSON(url).then(function(data) {
                jsonCache[url] = data;
                cb(data);
            }).catch(function() { cb(null); });
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try { jsonCache[url] = JSON.parse(xhr.responseText); } catch(e) { jsonCache[url] = null; }
                cb(jsonCache[url]);
            }
        };
        xhr.onerror = function() { cb(null); };
        xhr.send();
    }

    // Update meta description tag to replace hardcoded numbers
    function updateMetaDesc() {
        var meta = document.querySelector('meta[name="description"]');
        if (!meta) return;
        var content = meta.getAttribute('content');
        if (!content) return;
        // Replace standalone year patterns with current year
        content = content.replace(/\b2024\b/g, FOUNDING);
        content = content.replace(/\b2025\b/g, String(thisYear));
        content = content.replace(/\b2026\b/g, String(thisYear));
        meta.setAttribute('content', content);
        // Also update og:description
        var og = document.querySelector('meta[property="og:description"]');
        if (og) {
            var ogContent = og.getAttribute('content');
            if (ogContent) {
                ogContent = ogContent.replace(/\b2024\b/g, FOUNDING);
                ogContent = ogContent.replace(/\b2025\b/g, String(thisYear));
                ogContent = ogContent.replace(/\b2026\b/g, String(thisYear));
                og.setAttribute('content', ogContent);
            }
        }
    }

    // Run now
    injectCounts();

    // Run again after data-loader finishes
    window.addEventListener('data-ready', function() {
        setTimeout(injectCounts, 100);
    });

    // Helper
    function forEach(selector, fn) {
        var els = document.querySelectorAll(selector);
        for (var i = 0; i < els.length; i++) fn(els[i]);
    }
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

        var n = clicks;
        if (messages[n]) setTimeout(function() { showToast(messages[n]); }, 300);
    });

    var messages = {};
    Promise.all([
        (window.BigCookiesData ? window.BigCookiesData.fetchJSON('data/easter-superhero.json') : fetch('data/easter-superhero.json').then(function(r) { return r.json(); })),
        (window.BigCookiesData ? window.BigCookiesData.fetchJSON('data/products.json') : fetch('data/products.json').then(function(r) { return r.json(); }))
    ]).then(function(results) {
        var easter = results[0];
        var products = results[1];
        messages = easter.messages || {};
        var prodList = products.products || products;
        if (Array.isArray(prodList) && prodList.length && easter.speciesTemplate) {
            var n = prodList.length;
            messages[n] = easter.speciesTemplate.replace('{n}', n);
        }
    }).catch(function() { /* silent — no toast if JSON unavailable */ });
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
                '<kbd>0–9</kbd><span>Jump to sections</span>' +
                '<kbd>Enter</kbd><span>Place an order</span>' +
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
            var isHomePage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/';
            if (!isHomePage) {
                var homeURL = window.BigCookiesURL ? window.BigCookiesURL.home() : '/';
                window.location.href = homeURL;
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
        // Number keys jump to sections (0 = hero unlabeled, 1–9 = bench-sheet…how)
        if (e.key >= '0' && e.key <= '9' && !e.metaKey && !e.ctrlKey) {
            var sections = ['hero','bench-sheet','products','flavor-atlas','gifts','build','philosophy','quiz','gallery','how'];
            var idx = parseInt(e.key);
            var sec = document.getElementById(sections[idx]);
            if (sec) { sec.scrollIntoView({behavior:'smooth'}); showToast('Section ' + e.key, '📍'); }
        }
        // Enter → Place an Order
        if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
            var order = document.getElementById('order');
            if (order) { order.scrollIntoView({behavior:'smooth'}); showToast('Place your order', '📦'); }
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
        // Guard: already unlocked
        if (picker.querySelector('.konami-cookie')) {
            showToast('👑 The Golden Crumb is already on the tray!', '🥠');
            return;
        }

        var secret = document.createElement('div');
        secret.className = 'builder-item konami-cookie';
        secret.setAttribute('tabindex', '0');
        secret.dataset.id = 'secret';
        secret.dataset.name = 'The Golden Crumb';
        secret.dataset.emoji = 'secret';
        secret.dataset.price = '9.99';
        secret.innerHTML =
            '<img src="svg/cookies/secret.svg" alt="The Golden Crumb" width="40" height="40" style="border-radius:50%;flex-shrink:0;box-shadow:0 0 16px rgba(255,215,0,0.5);">' +
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
