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

    const fetchCart = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/cart', {
                headers: {
                    'x-user-id': getUserId()
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo cargar el carrito');
            }

            const data = await response.json();
            renderCart(data);
        } catch (error) {
            console.error('Error cargando carrito:', error);
            renderCart({ items: [], total: 0, count: 0 });
        }
    };

    const addToCart = async (product) => {
        try {
            const response = await fetch('http://localhost:4000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId()
                },
                body: JSON.stringify(product)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'No se pudo agregar el producto');
            }

            renderCart(data);
            openCart();
        } catch (error) {
            alert(error.message || 'No fue posible agregar al carrito.');
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/cart/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': getUserId()
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'No se pudo eliminar el producto');
            }

            renderCart(data);
        } catch (error) {
            alert(error.message || 'No fue posible eliminar el producto.');
        }
    };

    const checkoutCart = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/cart/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId()
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'No se pudo finalizar la compra');
            }

            alert(`Compra finalizada con éxito. Total: $${Number(data.totalMonto || 0).toLocaleString('es-CO')}`);
            renderCart({ items: [], total: 0, count: 0 });
        } catch (error) {
            alert(error.message || 'No fue posible finalizar la compra.');
        }
    };

    const openCart = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeCart = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    };

    if (openBtn) {
        openBtn.addEventListener('click', openCart);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeCart();
            }
        });
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', async (event) => {
            const button = event.target.closest('.remove-item');
            if (!button) return;
            await removeFromCart(button.dataset.id);
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkoutCart);
    }

    document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-add-to-cart]');
        if (!button) return;

        const product = {
            id: button.dataset.productId || 'demo-product',
            name: button.dataset.productName || 'Producto',
            price: Number(button.dataset.productPrice || 0),
            quantity: Number(button.dataset.productQty || 1)
        };

        await addToCart(product);
    });

    fetchCart();
});