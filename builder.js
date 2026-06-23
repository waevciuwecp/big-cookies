// ── Big Cookies — Build Your Box ────────────────
// ── Build Your Box ────────────────────────
const MAX_SLOTS = 6;
const selectedCookies = [];
const builderPicker = document.getElementById('builderPicker');
const builderSlots = document.getElementById('builderSlots');
const builderCount = document.getElementById('builderCount');
const builderTotal = document.getElementById('builderTotal');
const builderSubmit = document.getElementById('builderSubmit');
const builderReset = document.getElementById('builderReset');

function updateBuilderBox() {
    const slots = builderSlots.querySelectorAll('.builder-slot');
    slots.forEach((slot, i) => {
        if (i < selectedCookies.length) {
            const cookie = selectedCookies[i];
            slot.classList.add('filled');
            slot.classList.remove('empty');
            slot.innerHTML = `<div class="slot-cookie cookie-icon flavor-${cookie.id}" style="width:36px;height:36px;margin:0"></div>`;
            slot.setAttribute('aria-label', cookie.name);
        } else {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.innerHTML = '';
            slot.setAttribute('aria-label', 'Empty slot');
        }
    });

    const count = selectedCookies.length;
    const total = selectedCookies.reduce((sum, c) => sum + parseFloat(c.price), 0);
    builderCount.textContent = count;
    builderTotal.textContent = '$' + total.toFixed(2);
    builderSubmit.disabled = count === 0;
    builderReset.disabled = count === 0;

    builderPicker.querySelectorAll('.builder-item').forEach(item => {
        const id = item.dataset.id;
        const isSelected = selectedCookies.some(c => c.id === id);
        item.classList.toggle('selected', isSelected);
        item.setAttribute('aria-checked', isSelected);
        item.querySelector('.builder-check').textContent = isSelected ? '✓' : '+';
    });
}

builderPicker.querySelectorAll('.builder-item').forEach(item => {
    item.addEventListener('click', () => {
        const id = item.dataset.id;
        const name = item.dataset.name;
        const price = item.dataset.price;

        const existingIndex = selectedCookies.findIndex(c => c.id === id);
        if (existingIndex >= 0) {
            selectedCookies.splice(existingIndex, 1);
        } else if (selectedCookies.length < MAX_SLOTS) {
            selectedCookies.push({ id, name, price });
        } else {
            showToast('Box is full! Remove a cookie first.');
            return;
        }
        updateBuilderBox();
    });

    // Keyboard: Enter/Space to toggle
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});

builderSubmit.addEventListener('click', () => {
    if (selectedCookies.length === 0) return;
    const total = selectedCookies.reduce((sum, c) => sum + parseFloat(c.price), 0).toFixed(2);
    showToast(selectedCookies.length + ' cookies in box — $' + total);
});

builderReset.addEventListener('click', () => {
    selectedCookies.length = 0;
    updateBuilderBox();
    showToast('Box cleared.');
});

const allIds=["classic","double","toffee","raspberry","caramel","matcha"];
document.getElementById("btnSurprise").addEventListener("click",()=>{selectedCookies.length=0;updateBuilderBox();const ids=[...allIds];for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}ids.forEach((id,i)=>{setTimeout(()=>{const it=builderPicker.querySelector("[data-id="+id+"]");if(it){selectedCookies.push({id,name:it.dataset.name,price:it.dataset.price});updateBuilderBox();if(i===5)showToast("Surprise mix ready!");}},i*80);});});

// Quick Fill: staff picks (sequential)
document.getElementById('btnQuickFill').addEventListener('click', () => {
    selectedCookies.length = 0;
    updateBuilderBox();
    const staffIds = ['double', 'caramel', 'classic', 'toffee', 'raspberry', 'matcha'];
    staffIds.forEach((id, i) => {
        setTimeout(() => {
            const item = builderPicker.querySelector(`[data-id="${id}"]`);
            if (item) {
                selectedCookies.push({
                    id, name: item.dataset.name, price: item.dataset.price
                });
                updateBuilderBox();
                if (i === staffIds.length - 1) {
                    showToast('Box filled with Staff Picks!');
                }
            }
        }, i * 80);
    });
});
