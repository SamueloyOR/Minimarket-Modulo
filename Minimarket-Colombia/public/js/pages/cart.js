document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('cart-modal');
    const openBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const cartItemsList = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const cartCount = document.getElementById('count');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!modal) return;

    const STORAGE_KEY = 'minimarket-cart-user';
    const getUserId = () => {
        let userId = localStorage.getItem(STORAGE_KEY);
        if (!userId) {
            userId = `guest-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
            localStorage.setItem(STORAGE_KEY, userId);
        }
        return userId;
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(value);

    const renderCart = (data = { items: [], total: 0, count: 0 }) => {
        const items = Array.isArray(data.items) ? data.items : [];

        cartItemsList.innerHTML = '';

        if (items.length === 0) {
            cartItemsList.innerHTML = '<li class="empty-cart">Tu carrito está vacío.</li>';
        } else {
            items.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.className = 'cart-item';
                listItem.innerHTML = `
                    <span>${item.name} x${item.quantity}</span>
                    <div>
                        <strong>${formatCurrency(item.price * item.quantity)}</strong>
                        <button type="button" class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.name}">×</button>
                    </div>
                `;
                cartItemsList.appendChild(listItem);
            });
        }

        if (totalElement) {
            totalElement.textContent = Number(data.total || 0).toLocaleString('es-CO');
        }

        if (cartCount) {
            cartCount.textContent = Number(data.count || 0);
        }
    };


    const requireLogin = () => {
        if (sessionStorage.isloggedin()) return true;

        if(confirm("Debes iniciar sesion para accerder al carrito Deseas regrear al login?")){
            window.location.href = "/login";
        }

        return false;
        
    }});