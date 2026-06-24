// ── Big Cookies — Animations, Forms & Easter Eggs ─
// ── Animated favicon (homepage only) ──────
(function() {
    var isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (!isHome) return;
    var favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    var originalHref = favicon.href;
    var canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    var ctx = canvas.getContext('2d');
    var frames = ['🍪','🥠','🍪','✨'];
    var idx = 0;
    var interval;

    function drawFavicon() {
        ctx.clearRect(0, 0, 32, 32);
        ctx.font = '26px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frames[idx], 16, 17);
        favicon.href = canvas.toDataURL('image/png');
        idx = (idx + 1) % frames.length;
    }

    // Start after 3 seconds, so the SVG favicon shows first
    setTimeout(function() {
        drawFavicon();
        interval = setInterval(drawFavicon, 3000);
    }, 3000);
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

        // Gentle float animation with staggered delays
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
    var particles = [];       // { el, x, y, vx, vy, radius }
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Init / scatter ──────────────────────
    function scatterCards() {
        var cards = cloud.querySelectorAll('.atlas-card');
        var n = cards.length;
        if (!n) return;
        var w = cloud.offsetWidth;
        var h = Math.max(520, w * 0.7);
        cloud.style.minHeight = h + 'px';

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
                mass: 1
            });
        });

        // Ensure cards are visible and upright
        cards.forEach(function(c) {
            if (c.classList.contains('zoomed')) return;
            c.style.position = 'absolute';
            c.style.transform = 'translate(-50%, -50%)';
            c.style.margin = '0';
        });

        if (prefersReduced) {
            // Static layout — single settle pass
            settleOnce(w, h);
        } else if (!simRunning) {
            startSimulation();
        }
    }

    // ── Reduced-motion: one-shot settle ─────
    function settleOnce(w, h) {
        for (var iter = 0; iter < 120; iter++) {
            stepForces(w, h, 1);
        }
        renderParticles(w, h);
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
                console.log('%c[Thermal] %csimulation started', 'color:#E8A850;font-weight:bold', 'color:#aaa');
            }
            var rawDt = (ts - simLastTime) / 16.667;
            simLastTime = ts;
            // Discard accumulated time (e.g. after tab resume) — never simulate a gap
            rawDt = rawDt > 5 ? 0 : Math.min(rawDt, 3);
            // Apply global time scale
            var dt = rawDt * CONFIG.simulationTimeScale;

            var w = cloud.offsetWidth;
            var h = Math.max(520, w * 0.7);

            stepForces(w, h, dt);
            applyThermalForces(dt);
            thermalUpdate(dt);
            renderParticles(w, h);

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
            if (p.el.classList.contains('zoomed')) continue;
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
            if (p.el.classList.contains('zoomed')) continue;
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
            if (p.el.classList.contains('zoomed')) continue;
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
        for (var i = 0; i < n; i++) {
            var pi = particles[i];
            if (pi.el.classList.contains('zoomed')) continue;
            if (frozenSlot && pi.el === frozenSlot.el) continue; // frozen during close
            var fx = 0, fy = 0;

            // ── Pairwise forces (fixed equilibrium, no modulation) ──
            for (var j = 0; j < n; j++) {
                if (i === j) continue;
                var pj = particles[j];
                if (pj.el.classList.contains('zoomed')) continue;
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
            // Speed cap
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
    function renderParticles(w, h) {
        // Freeze the closing card's destination slot
        if (frozenSlot && frozenSlot.el) {
            frozenSlot.el.style.left = (frozenSlot.x / w * 100) + '%';
            frozenSlot.el.style.top = (frozenSlot.y / h * 100) + '%';
        }
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.el.classList.contains('zoomed')) continue;
            if (frozenSlot && p.el === frozenSlot.el) continue; // frozen
            var px = Math.round(p.x * 10) / 10;
            var py = Math.round(p.y * 10) / 10;
            p.el.style.left = (px / w * 100) + '%';
            p.el.style.top = (py / h * 100) + '%';
        }
    }

    // ── Lifecycle: pause on hide, resume clean ──
    function onHidden() {
        saveCheckpoint();
        simRunning = false;
        if (simRAF) { cancelAnimationFrame(simRAF); simRAF = null; }
        console.log('%c[Thermal] %cfrozen — checkpoint saved (simTime: ' + therm.simTime.toFixed(1) + 's)',
            'color:#E8A850;font-weight:bold', 'color:#aaa');
    }

    function onVisible() {
        if (prefersReduced || !particles.length) return;
        if (simRunning) return; // already running
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

    // ── Resize ──────────────────────────────
    window.addEventListener('resize', function() {
        clearTimeout(window._scatterTid);
        window._scatterTid = setTimeout(scatterCards, 200);
        // If a card is zoomed, re-center it
        if (transState === 'open' && !activeAnim) {
            var card = document.getElementById('atlasCard-' + activeId);
            if (card && card.classList.contains('zoomed')) {
                var vc = viewportCenter();
                var vw = window.innerWidth;
                var pad = Math.min(vw * 0.06, 40);
                var maxW = Math.min(vw - pad * 2, 780);
                var toW = maxW;
                var toH = Math.min(card.scrollHeight, vc.usableH - 32);
                card.style.left = (vc.cx - toW / 2) + 'px';
                card.style.top = Math.max(16, vc.cy - toH / 2) + 'px';
                card.style.width = toW + 'px';
                card.style.height = toH + 'px';
            }
        }
    });

    // ── Reduced motion listener ─────────────
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e) {
        prefersReduced = e.matches;
        if (prefersReduced) {
            simRunning = false;
            if (simRAF) { cancelAnimationFrame(simRAF); simRAF = null; }
            var w = cloud.offsetWidth;
            var h = Math.max(520, w * 0.7);
            settleOnce(w, h);
        } else {
            scatterCards();
        }
    });

    function stopSimulation() {
        simRunning = false;
        if (simRAF) { cancelAnimationFrame(simRAF); simRAF = null; }
    }
    window.addEventListener('beforeunload', stopSimulation);

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
            '<p class="atlas-detail-origin">' + item.origin + '</p>' +
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

    // ── (legacy code preserved below, unreachable via new handlers) ──
    var transState = 'compact';
    var backdrop = null;
    var activeAnim = null;
    var closingId = null;
    var frozenSlot = null;

    function ensureBackdrop() {
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'atlas-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            backdrop.addEventListener('click', function() { collapse(); });
            document.body.appendChild(backdrop);
        }
        return backdrop;
    }

    function viewportCenter() {
        var nav = document.getElementById('nav');
        var navH = nav ? nav.getBoundingClientRect().height : 0;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var safeTop = navH + 16;
        var safeBot = 16;
        return { cx: vw / 2, cy: (safeTop + vh - safeBot) / 2, usableH: vh - safeTop - safeBot };
    }

    // ── Complete style cleanup — leaves no detail trace ──
    function cleanupCard(card) {
        card.style.position = '';
        card.style.left = '';
        card.style.top = '';
        card.style.right = '';
        card.style.bottom = '';
        card.style.width = '';
        card.style.height = '';
        card.style.minWidth = '';
        card.style.maxWidth = '';
        card.style.minHeight = '';
        card.style.maxHeight = '';
        card.style.transform = '';
        card.style.transformOrigin = '';
        card.style.margin = '';
        card.style.zIndex = '';
        card.style.animationPlayState = '';
        card.style.transition = '';
        card.style.borderRadius = '';
        card.style.boxShadow = '';
        card.style.overflow = '';
        card.style.overflowY = '';
        card.style.pointerEvents = '';
        card.style.visibility = '';
    }

    function expand(id) {
        if (activeAnim) { activeAnim.cancel(); activeAnim = null; }
        if (transState === 'closing') { finishClose(); }

        var card = document.getElementById('atlasCard-' + id);
        if (!card) return;

        // If a different card is open, close it first
        if (activeId && activeId !== id) {
            var prev = document.getElementById('atlasCard-' + activeId);
            if (prev) { prev.classList.remove('zoomed'); prev.setAttribute('aria-expanded', 'false'); cleanupCard(prev); }
        }
        activeId = id;
        closingId = null;
        transState = 'opening';

        // Measure current compact rectangle (viewport coords)
        var fromRect = card.getBoundingClientRect();
        var fromW = fromRect.width;
        var fromH = fromRect.height;
        var fromX = fromRect.left;
        var fromY = fromRect.top;

        // Compute detail destination
        var vc = viewportCenter();
        var vw = window.innerWidth;
        var pad = Math.min(vw * 0.06, 40);
        var maxW = Math.min(vw - pad * 2, 780);
        var toW = maxW;

        // Measure zoomed height off-screen
        card.classList.add('zoomed');
        card.style.position = 'fixed';
        card.style.left = '-9999px';
        card.style.top = '0';
        card.style.width = toW + 'px';
        card.style.height = 'auto';
        card.style.visibility = 'hidden';
        card.offsetHeight;
        var toH = Math.min(card.getBoundingClientRect().height, vc.usableH - 32);
        card.style.visibility = '';
        card.classList.remove('zoomed');
        card.offsetHeight;

        var toX = vc.cx - toW / 2;
        var toY = Math.max(16, vc.cy - toH / 2);

        // Pin card at current compact position (fixed overlay)
        card.style.animationPlayState = 'paused';
        card.style.position = 'fixed';
        card.style.left = fromX + 'px';
        card.style.top = fromY + 'px';
        card.style.width = fromW + 'px';
        card.style.height = fromH + 'px';
        card.style.margin = '0';
        card.style.zIndex = '100';
        card.style.transition = 'none';
        card.style.transform = 'none';

        // Dim cloud + lock scroll
        cloud.querySelectorAll('.atlas-card').forEach(function(c) {
            if (c !== card) c.classList.add('dimmed');
        });
        document.body.style.overflow = 'hidden';
        ensureBackdrop().classList.add('visible');

        // Animate geometry morph
        var dur = prefersReduced ? 0 : 460;
        activeAnim = card.animate([
            { left: fromX + 'px', top: fromY + 'px', width: fromW + 'px', height: fromH + 'px' },
            { left: toX + 'px', top: toY + 'px', width: toW + 'px', height: toH + 'px' }
        ], {
            duration: dur,
            easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
            fill: 'forwards'
        });

        // Reveal detail content at ~35% of journey
        setTimeout(function() {
            if (transState !== 'opening' || activeId !== id) return;
            card.classList.add('zoomed');
            card.setAttribute('aria-expanded', 'true');
        }, Math.round(dur * 0.35));

        activeAnim.onfinish = function() {
            activeAnim = null;
            if (transState !== 'opening') return;
            transState = 'open';
            // Commit final values without fill:forwards
            card.style.left = toX + 'px';
            card.style.top = toY + 'px';
            card.style.width = toW + 'px';
            card.style.height = toH + 'px';
            card.style.overflowY = 'auto';
            card.setAttribute('tabindex', '-1');
            card.focus({ preventScroll: true });
        };
    }

    function collapse() {
        if (activeAnim) { activeAnim.cancel(); activeAnim = null; }

        if (!activeId) return;
        var card = document.getElementById('atlasCard-' + activeId);
        if (!card) { activeId = null; transState = 'compact'; return; }

        closingId = activeId;
        activeId = null;
        transState = 'closing';

        // Hide detail content
        card.classList.remove('zoomed');
        card.setAttribute('aria-expanded', 'false');
        card.removeAttribute('tabindex');
        card.style.overflowY = '';

        var curRect = card.getBoundingClientRect();
        card.style.height = curRect.height + 'px'; // freeze height
        card.offsetHeight;

        var fromW = curRect.width;
        var fromH = curRect.height;
        var fromX = curRect.left;
        var fromY = curRect.top;

        // Un-dim cloud
        cloud.querySelectorAll('.atlas-card.dimmed').forEach(function(c) {
            c.classList.remove('dimmed');
        });
        document.body.style.overflow = '';

        // Measure destination and freeze the slot
        card.style.visibility = 'hidden';
        card.style.position = 'absolute';
        card.style.left = '0'; card.style.top = '0';
        card.style.width = ''; card.style.height = '';
        scatterCards();
        card.offsetHeight;
        var targetCard = document.getElementById('atlasCard-' + closingId);
        var toRect = targetCard ? targetCard.getBoundingClientRect() : curRect;
        // Freeze the destination so it can't move during close
        if (targetCard) {
            frozenSlot = { el: targetCard, x: toRect.left + toRect.width/2, y: toRect.top + toRect.height/2,
                           w: toRect.width, h: toRect.height };
        }
        card.style.visibility = '';
        card.style.position = 'fixed';
        card.style.left = fromX + 'px';
        card.style.top = fromY + 'px';
        card.style.width = fromW + 'px';
        card.style.height = fromH + 'px';

        var toW = toRect.width;
        var toH = toRect.height;
        var toX = toRect.left;
        var toY = toRect.top;

        var dur = prefersReduced ? 0 : 560;
        activeAnim = card.animate([
            { left: fromX + 'px', top: fromY + 'px', width: fromW + 'px', height: fromH + 'px' },
            { left: toX + 'px', top: toY + 'px', width: toW + 'px', height: toH + 'px' }
        ], {
            duration: dur,
            easing: 'cubic-bezier(0.4, 0.0, 0.6, 1.0)',
            fill: 'forwards'
        });

        // Backdrop fades near end
        var backdropTimer = setTimeout(function() {
            if (backdrop) backdrop.classList.remove('visible');
        }, Math.round(dur * 0.7));

        activeAnim.onfinish = function() {
            clearTimeout(backdropTimer);
            finishClose();
        };
    }

    // ── Atomic close completion — always runs, even via interrupt ──
    function finishClose() {
        if (activeAnim) { activeAnim.cancel(); activeAnim = null; }
        if (backdrop) backdrop.classList.remove('visible');
        frozenSlot = null;

        var card = document.getElementById('atlasCard-' + closingId);
        if (card) {
            card.classList.remove('zoomed');
            card.setAttribute('aria-expanded', 'false');
            card.removeAttribute('tabindex');
            cleanupCard(card);
        }
        closingId = null;
        transState = 'compact';
        scatterCards();
    }

    // ESC to collapse
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && (activeId || closingId)) { collapse(); }
    });

    fetch('data/products.json', { cache: 'no-cache' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(data) {
            if (!Array.isArray(data) || !data.length) throw new Error('No products');
            items = data;
            renderCloud();
        })
        .catch(function() {
            cloud.innerHTML = '<p class="atlas-loading">Open the site through a local server or production host to load the tasting board.</p>';
        });
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
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // Smooth interpolation loop for velocity-based motion
    function smoothParallax() {
        currentRotate += (targetRotate - currentRotate) * 0.12;
        currentTranslateY += (targetTranslateY - currentTranslateY) * 0.12;
        heroCookie.style.transform = 'rotate(' + currentRotate + 'deg) translateY(' + currentTranslateY + 'px)';
        requestAnimationFrame(smoothParallax);
    }
    smoothParallax();

    document.addEventListener('mousemove', function(e) {
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        mouseX = (e.clientX - cx) / cx;
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

// ── Cursor sparkle trail ──────────────────
(function() {
    var isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (!isHome) return;
    var lastSparkle = 0;
    var sparkleColors = ['#E8A850','#FFD700','#C8853E','#F5D5A0','#FFF5E9'];
    document.addEventListener('mousemove', function(e) {
        var now = Date.now();
        if (now - lastSparkle < 180) return; // throttle
        lastSparkle = now;
        // Don't sparkle over nav or forms
        if (e.target.closest('nav') || e.target.closest('form') || e.target.closest('button')) return;

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
        setTimeout(function() { if (spark.parentNode) spark.remove(); }, 750);
    });
})();

// ── Live activity counter ────────────────
(function() {
    var isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (!isHome) return;

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

    typeTimer = setTimeout(typeNextChar, 2000);
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
