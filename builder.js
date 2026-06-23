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
                '<div class="cookie-icon flavor-' + id + '" style="width:32px;height:32px;margin:0;flex-shrink:0"></div>' +
                '<span class="cart-item-name">' + item.name + '</span>' +
                '<span class="cart-item-qty">' + item.qty + 'x</span>' +
                '<span class="cart-item-subtotal">$' + subtotal.toFixed(2) + '</span>' +
                '</div>';
        }
        cartList.innerHTML = html || '<p class="cart-empty" id="cartEmpty">Your cart is empty. Add some cookies!</p>';
        builderCount.textContent = count;
        if (count === 12 && !window._celebrated) { window._celebrated = true; window.showToast && showToast('🎉 A full dozen! You qualify for free shipping!'); setTimeout(function() { window._celebrated = false; }, 5000); }

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
        builderTotal.textContent = '$' + total.toFixed(2);
        builderSubmit.disabled = count === 0;
        builderReset.disabled = count === 0;
        if (count > 0) builderBox.classList.add('has-cookies');
        else builderBox.classList.remove('has-cookies');

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
        if (count > 0) window.showToast && showToast(count + ' cookies in cart — ' + total);
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
