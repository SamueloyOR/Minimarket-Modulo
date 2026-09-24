document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("cart-modal");
    const openBtn = document.getElementById("open-cart-btn");
    const closeBtn = document.getElementById("close-cart-btn");
    const cartItemsList = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const cartCount = document.getElementById("count");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!modal || !cartItemsList) return;

    const token = () => localStorage.getItem("token");
    const apiRequest = async (url, options = {}) => {
        const response = await fetch(`/api/cart${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token()}`,
                ...(options.headers || {})
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "No se pudo completar la solicitud");
        return data;
    };

    const formatCurrency = (value) => new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

    const showCartMessage = (message, isError = false) => {
        let element = document.getElementById("cart-message");
        if (!element) {
            element = document.createElement("p");
            element.id = "cart-message";
            element.setAttribute("role", "status");
            element.setAttribute("aria-live", "polite");
            cartItemsList.before(element);
        }
        element.textContent = message;
        element.className = isError ? "cart-message cart-message-error" : "cart-message";
    };

    const renderCart = (data = { items: [], total: 0, count: 0 }) => {
        const items = Array.isArray(data.items) ? data.items : [];
        cartItemsList.replaceChildren();

        if (!items.length) {
            const empty = document.createElement("li");
            empty.className = "empty-cart";
            empty.textContent = "Tu carrito está vacío.";
            cartItemsList.appendChild(empty);
        } else {
            items.forEach((item) => {
                const listItem = document.createElement("li");
                listItem.className = "cart-item";
                listItem.innerHTML = `
                    <div class="cart-item-info">
                        <strong></strong>
                        <small></small>
                    </div>
                    <div class="cart-item-actions">
                        <button type="button" class="quantity-btn" data-action="decrease" data-id="${item.id}" aria-label="Reducir cantidad">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="quantity-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                        <strong>${formatCurrency(item.price * item.quantity)}</strong>
                        <button type="button" class="remove-item" data-id="${item.id}" aria-label="Eliminar producto">×</button>
                    </div>`;
                listItem.querySelector(".cart-item-info strong").textContent = item.name;
                listItem.querySelector(".cart-item-info small").textContent = formatCurrency(item.price);
                cartItemsList.appendChild(listItem);
            });
        }

        if (totalElement) totalElement.textContent = formatCurrency(data.total);
        if (cartCount) cartCount.textContent = String(data.count || 0);
    };

    const loadCart = async () => {
        if (!token()) return;
        try {
            renderCart(await apiRequest("/"));
        } catch (error) {
            showCartMessage(error.message, true);
        }
    };

    const setModal = (open) => {
        modal.classList.toggle("active", open);
        modal.setAttribute("aria-hidden", String(!open));
        if (open) loadCart();
    };

    openBtn?.addEventListener("click", () => {
        if (!token()) {
            window.location.href = "/login";
            return;
        }
        setModal(true);
    });
    closeBtn?.addEventListener("click", () => setModal(false));
    modal.addEventListener("click", (event) => {
        if (event.target === modal) setModal(false);
    });

    cartItemsList.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-id]");
        if (!button) return;

        try {
            if (button.classList.contains("remove-item")) {
                renderCart(await apiRequest(`/${button.dataset.id}`, { method: "DELETE" }));
                return;
            }

            const row = button.closest(".cart-item");
            const current = Number(row?.querySelector(".cart-item-actions span")?.textContent || 1);
            const quantity = button.dataset.action === "increase" ? current + 1 : current - 1;
            if (quantity < 1) {
                renderCart(await apiRequest(`/${button.dataset.id}`, { method: "DELETE" }));
                return;
            }
            renderCart(await apiRequest("/", {
                method: "PUT",
                body: JSON.stringify({ id: button.dataset.id, quantity })
            }));
        } catch (error) {
            showCartMessage(error.message, true);
        }
    });

    checkoutBtn?.addEventListener("click", async () => {
        const calle = window.prompt("Escribe la dirección de entrega:");
        const ciudad = window.prompt("Escribe la ciudad:");
        if (!calle || !ciudad) return;

        try {
            checkoutBtn.disabled = true;
            renderCart(await apiRequest("/checkout", {
                method: "POST",
                body: JSON.stringify({
                    direccionEnvio: { calle: calle.trim(), ciudad: ciudad.trim() },
                    metodosPago: "efectivo"
                })
            }));
            showCartMessage("Compra procesada correctamente.");
        } catch (error) {
            showCartMessage(error.message, true);
        } finally {
            checkoutBtn.disabled = false;
        }
    });

    loadCart();
});
