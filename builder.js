// ── Big Cookies — Shopping Cart ────────────────
(function() {
    // Load cart from localStorage
    var cart = {};
    try {
        var saved = localStorage.getItem('bigCookiesCart');
        if (saved) cart = JSON.parse(saved);
    } catch(e) { cart = {}; }

    function saveCart() {
        try { localStorage.setItem('bigCookiesCart', JSON.stringify(cart)); } catch(e) {}
    }

    var picker = document.getElementById('builderPicker');
    var cartList = document.getElementById('cartList');
    var cartEmpty = document.getElementById('cartEmpty');
    var builderCount = document.getElementById('builderCount');
    var builderTotal = document.getElementById('builderTotal');
    var builderSubmit = document.getElementById('builderSubmit');
    var builderReset = document.getElementById('builderReset');
    var builderBox = document.getElementById('builderBox');

    if (!picker) return;

    var MAX_PER_ITEM = 50;
    var MAX_TOTAL = 100;

    function updateCart() {
        var html = '';
        var count = 0, total = 0;
        for (var id in cart) {
            var item = cart[id];
            if (item.qty <= 0) continue;
            count += item.qty;
            var subtotal = item.qty * parseFloat(item.price);
            total += subtotal;
            html += '<div class="cart-item">' +
                '<img src="svg/cookies/' + id + '.svg" alt="' + item.name + '" width="32" height="32" style="flex-shrink:0;border-radius:50%">' +
                '<span class="cart-item-name">' + item.name + '</span>' +
                '<span class="cart-item-qty">' + item.qty + 'x</span>' +
                '<span class="cart-item-subtotal">$' + subtotal.toFixed(2) + '</span>' +
                '</div>';
        }
        cartList.innerHTML = html || '<p class="cart-empty" id="cartEmpty">Your cart is empty. Add some cookies!</p>';
        builderCount.textContent = count;
        if (count === 12 && !window._celebrated) { window._celebrated = true; window.showToast && showToast('🎉 A full dozen! You qualify for free shipping!');
            // ── Firework burst ──
            var colors = ['#E8A850','#D4954B','#C8853E','#F5D5A0','#B84444','#5BBA63','#8B6F5C','#F0C28A','#FFF5E9','#FFD700','#FFA940'];
            var TRAIL_COUNT = 48;
            var MAIN_COUNT = 80;
            var fragment = document.createDocumentFragment();

            // Central flash
            var flash = document.createElement('div');
            flash.style.cssText =
                'position:fixed;z-index:9998;pointer-events:none;' +
                'left:50%;top:50%;transform:translate(-50%,-50%);' +
                'width:8px;height:8px;border-radius:50%;' +
                'background:#FFF5E9;' +
                'box-shadow:0 0 0 0 rgba(255,215,0,0.9), 0 0 60px 20px rgba(255,180,60,0.6);' +
                'animation: dozenFlash 1.6s ease-out forwards;';
            fragment.appendChild(flash);

            // Main firework particles — burst in all directions
            for (var ci = 0; ci < MAIN_COUNT; ci++) {
                var el = document.createElement('span');
                var size = 4 + Math.random() * 10;
                var angle = Math.random() * Math.PI * 2;
                var phi = Math.random() * Math.PI * 0.7; // spherical distribution, bias toward horizontal
                var distance = 180 + Math.random() * 420;
                // Spherical → screen projection
                var dx = Math.cos(angle) * Math.sin(phi + 0.4) * distance;
                var dy = Math.cos(phi + 0.4) * distance - 80 - Math.random() * 200;
                var rotation = (Math.random() - 0.5) * 1200;
                var duration = 1.3 + Math.random() * 1.2;
                var delay = Math.random() * 0.25;
                var isGold = Math.random() > 0.55;
                var color = isGold ? colors[Math.floor(Math.random()*4)] : colors[Math.floor(Math.random()*colors.length)];

                el.style.cssText =
                    'position:fixed;z-index:9999;pointer-events:none;' +
                    'left:50vw;top:48vh;' +
                    'width:' + size + 'px;height:' + (Math.random()>0.4 ? size : size*0.5) + 'px;' +
                    'background:' + color + ';' +
                    'border-radius:' + (Math.random()>0.3 ? '50%' : '2px') + ';' +
                    'opacity:0;' +
                    'animation: dozenFirework ' + duration + 's cubic-bezier(0.05, 0.7, 0.25, 1) ' + delay + 's forwards;' +
                    '--dx:' + dx + 'px;--dy:' + dy + 'px;--rot:' + rotation + 'deg;' +
                    (isGold ? 'box-shadow:0 0 ' + (3+Math.random()*4) + 'px ' + color + ';' : '');
                fragment.appendChild(el);
            }

            // Trail particles — smaller, follow main arcs, longer fade
            for (var ti = 0; ti < TRAIL_COUNT; ti++) {
                var trail = document.createElement('span');
                var tAngle = Math.random() * Math.PI * 2;
                var tPhi = Math.random() * Math.PI * 0.65;
                var tDist = 140 + Math.random() * 400;
                var tdx = Math.cos(tAngle) * Math.sin(tPhi + 0.4) * tDist;
                var tdy = Math.cos(tPhi + 0.4) * tDist - 60 - Math.random() * 220;
                var tDuration = 1.6 + Math.random() * 1.4;
                var tDelay = 0.05 + Math.random() * 0.3;

                trail.style.cssText =
                    'position:fixed;z-index:9997;pointer-events:none;' +
                    'left:50vw;top:48vh;' +
                    'width:' + (1.5+Math.random()*3) + 'px;height:' + (1.5+Math.random()*3) + 'px;' +
                    'background:' + colors[Math.floor(Math.random()*5)] + ';' +
                    'border-radius:50%;' +
                    'opacity:0;' +
                    'animation: dozenTrail ' + tDuration + 's ease-out ' + tDelay + 's forwards;' +
                    '--dx:' + tdx + 'px;--dy:' + tdy + 'px;';
                fragment.appendChild(trail);
            }

            document.body.appendChild(fragment);

            // Cleanup
            setTimeout(function() {
                document.querySelectorAll('[style*="dozenFirework"], [style*="dozenTrail"], [style*="dozenFlash"]').forEach(function(el) { el.remove(); });
            }, 3200);
            setTimeout(function() { window._celebrated = false; }, 5000);
        }

    // Sync with order form cart summary
    var orderSummary = document.getElementById('orderCartSummary');
    var orderTotal = document.getElementById('orderCartTotal');
    var orderCount = document.getElementById('orderCartCount');
    var orderPrice = document.getElementById('orderCartPrice');
    if (orderSummary) {
        var items = '';
        var totalCount = 0, totalPrice = 0;
        for (var id in cart) {
            var item = cart[id];
            if (item.qty <= 0) continue;
            totalCount += item.qty;
            var st = item.qty * parseFloat(item.price);
            totalPrice += st;
            items += '<div class="order-cart-item"><span>' + item.name + '</span><span>' + item.qty + ' &times; $' + parseFloat(item.price).toFixed(2) + '</span><span>$' + st.toFixed(2) + '</span></div>';
        }
        if (totalCount > 0) {
            orderSummary.innerHTML = items;
            orderTotal.style.display = 'flex';
            orderCount.textContent = totalCount + ' cookie' + (totalCount !== 1 ? 's' : '');
            orderPrice.textContent = '$' + totalPrice.toFixed(2);
        } else {
            orderSummary.innerHTML = '<p class="order-cart-empty">Your cart is empty. <a href="#build">Build your box</a> first, then come back here.</p>';
            orderTotal.style.display = 'none';
        }
    }

        window.dispatchEvent(new CustomEvent('cart-update', {detail: {count: count}}));
        var oldTotal = builderTotal.textContent;
        var newTotal = '$' + total.toFixed(2);
        // Update per-cookie average
        var avgEl = document.getElementById('builderAvg');
        if (avgEl && count > 0) {
            avgEl.textContent = '$' + (total / count).toFixed(2) + '/cookie';
            avgEl.style.display = '';
        } else if (avgEl) {
            avgEl.style.display = 'none';
        }
        if (oldTotal !== newTotal && count > 0) {
            builderTotal.textContent = newTotal;
            builderTotal.classList.remove('pulse');
            void builderTotal.offsetWidth; // force reflow
            builderTotal.classList.add('pulse');
        } else {
            builderTotal.textContent = newTotal;
        }
        builderSubmit.disabled = count === 0;
        builderReset.disabled = count === 0;
        if (count > 0) builderBox.classList.add('has-cookies');
        else builderBox.classList.remove('has-cookies');

        // Pairing suggestions
        var pairEl = document.getElementById('builderPairing');
        if (pairEl) {
            var has = function(id) { return cart[id] && cart[id].qty > 0; };
            var pairings = [
                { ids: ['classic','double'], tip: '🍫 Chocolate lover\'s combo — classic meets double' },
                { ids: ['toffee','caramel'], tip: '🧂 Sweet & salty perfection — toffee + caramel' },
                { ids: ['raspberry','matcha'], tip: '🎨 The adventurous duo — raspberry + matcha' },
                { ids: ['classic','caramel'], tip: '☕ Bakery favorite — classic with a caramel side' },
                { ids: ['double','raspberry'], tip: '🍓 Bold & bright — dark chocolate meets raspberry' },
            ];
            var found = null;
            for (var pi = 0; pi < pairings.length; pi++) {
                var p = pairings[pi];
                if (has(p.ids[0]) && has(p.ids[1])) { found = p; break; }
            }
            if (found) { pairEl.textContent = found.tip; pairEl.style.display = ''; }
            else { pairEl.style.display = 'none'; }
        }

        // Update qty displays in picker
        picker.querySelectorAll('.builder-item').forEach(function(item) {
            var id = item.dataset.id;
            var qty = cart[id] ? cart[id].qty : 0;
            item.querySelector('.qty-num').textContent = qty;
            item.classList.toggle('in-cart', qty > 0);
        });

        saveCart();
    }

    // Plus/minus button handlers
    picker.addEventListener('click', function(e) {
        var btn = e.target.closest('.qty-btn');
        if (!btn) return;
        // Ripple effect
        var ripple = document.createElement('span');
        ripple.className = 'qty-ripple';
        var rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 10) + 'px';
        ripple.style.top = (e.clientY - rect.top - 10) + 'px';
        btn.appendChild(ripple);
        setTimeout(function() { if (ripple.parentNode) ripple.remove(); }, 500);

        var item = btn.closest('.builder-item');
        var id = item.dataset.id;
        var name = item.dataset.name;
        var price = item.dataset.price;

        if (!cart[id]) cart[id] = {name: name, price: price, qty: 0};

        if (btn.classList.contains('qty-plus')) {
            if (cart[id].qty >= MAX_PER_ITEM) {
                window.showToast && showToast('Max ' + MAX_PER_ITEM + ' per flavor. That\'s a lot of cookies!');
                return;
            }
            var totalQty = 0;
            for (var k in cart) { if (cart[k].qty > 0) totalQty += cart[k].qty; }
            if (totalQty >= MAX_TOTAL) {
                window.showToast && showToast('Cart limit: ' + MAX_TOTAL + ' cookies. That\'s a big order!');
                return;
            }
            cart[id].qty++;
        } else if (btn.classList.contains('qty-minus')) {
            cart[id].qty = Math.max(0, cart[id].qty - 1);
        }
        updateCart();
    });

    // Keyboard support for qty buttons
    picker.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            var btn = e.target.closest('.qty-btn');
            if (btn) { e.preventDefault(); btn.click(); }
        }
    });

    // Staff Picks: 1 of each
    var btnQuickFill = document.getElementById('btnQuickFill');
    if (btnQuickFill) btnQuickFill.addEventListener('click', function() {
        var ids = ['double','caramel','classic','toffee','raspberry','matcha'];
        ids.forEach(function(id) {
            var item = picker.querySelector('[data-id="' + id + '"]');
            if (item) {
                if (!cart[id]) cart[id] = {name: item.dataset.name, price: item.dataset.price, qty: 0};
                cart[id].qty = Math.max(cart[id].qty, 1);
            }
        });
        updateCart();
        window.showToast && showToast('Staff Picks added to cart!');
    });

    // Surprise Me: random 1-2 of each
    var btnSurprise = document.getElementById('btnSurprise');
    if (btnSurprise) btnSurprise.addEventListener('click', function() {
        var ids = ['classic','double','toffee','raspberry','caramel','matcha'];
        // Fisher-Yates shuffle then take random qty
        for (var i = ids.length-1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i+1));
            var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
        }
        ids.forEach(function(id) {
            var item = picker.querySelector('[data-id="' + id + '"]');
            if (item) {
                if (!cart[id]) cart[id] = {name: item.dataset.name, price: item.dataset.price, qty: 0};
                cart[id].qty = Math.floor(Math.random() * 2) + 1; // 1 or 2
            }
        });
        updateCart();
        window.showToast && showToast('Surprise mix ready!');
    });

    // Checkout
    builderSubmit.addEventListener('click', function() {
        var count = parseInt(builderCount.textContent);
        var total = builderTotal.textContent;
        if (count === 0) return;

        // Loading state
        var originalHTML = builderSubmit.innerHTML;
        builderSubmit.disabled = true;
        builderSubmit.classList.add('loading');
        builderSubmit.innerHTML = '<span class="btn-spinner"></span> Preparing your box…';

        setTimeout(function() {
            builderSubmit.classList.remove('loading');
            builderSubmit.disabled = false;
            builderSubmit.innerHTML = originalHTML;

            // Scroll to order form
            var orderSection = document.getElementById('order');
            if (orderSection) orderSection.scrollIntoView({behavior: 'smooth'});
            window.showToast && showToast(count + ' cookies ready — ' + total + '. Fill out the form below to finish!', '📦');
        }, 1000);
    });

    // Clear cart with confirmation
    builderReset.addEventListener('click', function() {
        var count = 0;
        for (var id in cart) count += cart[id].qty;
        if (count > 0 && !confirm('Clear your cart of ' + count + ' cookie' + (count !== 1 ? 's' : '') + '?')) return;
        cart = {};
        updateCart();
        window.showToast && showToast('Cart cleared.');
    });

    // Share box — copy cart as text
    var builderShare = document.getElementById('builderShare');
    if (builderShare) builderShare.addEventListener('click', function() {
        var lines = ['🥠 My Big Cookies box:'];
        var total = 0, count = 0;
        for (var id in cart) {
            if (cart[id].qty <= 0) continue;
            lines.push(cart[id].qty + '× ' + cart[id].name);
            count += cart[id].qty;
            total += cart[id].qty * parseFloat(cart[id].price);
        }
        lines.push(count + ' cookies — $' + total.toFixed(2));
        lines.push('big-cookies.yaoyy.moe');
        var text = lines.join('\n');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                window.showToast && showToast('📋 Box copied! Share it with someone.');
            });
        }
    });

    updateCart();

// Gift card "Add to Cart" buttons
document.querySelectorAll('.gift-add-cart').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var id = this.dataset.gift;
        var name = this.dataset.name;
        var price = this.dataset.price;
        if (!cart[id]) cart[id] = {name: name, price: price, qty: 0};
        cart[id].qty++;
        updateCart();
        window.showToast && showToast(name + ' added to cart!');
        // Scroll to cart
        document.getElementById('build').scrollIntoView({behavior: 'smooth'});
    });
});

})();
