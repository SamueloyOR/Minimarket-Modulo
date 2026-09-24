document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".products-carts");
    if (!grid) return;

    const isOffersPage = window.location.pathname.includes("offers");
    const categoryButtons = document.querySelectorAll(".categories-container .category-card");
    const formatCurrency = (value) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", maximumFractionDigits: 0
    }).format(Number(value) || 0);

    const showMessage = (text, error = false) => {
        grid.replaceChildren();
        const message = document.createElement("p");
        message.className = error ? "catalog-message catalog-message-error" : "catalog-message";
        message.textContent = text;
        grid.appendChild(message);
    };

    const loadProducts = async (category = "") => {
        const params = new URLSearchParams();
        if (isOffersPage) params.set("oferta", "true");
        if (category) params.set("categoria", category);
        try {
            const response = await fetch(`/api/products?${params}`);
            if (!response.ok) throw new Error("No se pudieron cargar los productos");
            const products = await response.json();
            grid.replaceChildren();
            if (!products.length) { showMessage("No hay productos disponibles en esta selección."); return; }

            products.forEach((product) => {
                const card = document.createElement("article");
                card.className = "product-card";
                const image = document.createElement("img");
                image.src = product.imagen || product.imagenUrl || "/img/minimarket.jpeg";
                image.alt = product.nombre;
                image.loading = "lazy";
                const title = document.createElement("h3");
                title.textContent = product.nombre;
                const description = document.createElement("p");
                description.textContent = product.descripcion || product.categoria;
                const price = document.createElement("strong");
                const salePrice = product.enOferta && product.precioOferta != null ? product.precioOferta : product.precio;
                price.textContent = formatCurrency(salePrice);
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn-view-Weekly-Deals";
                button.textContent = "Agregar al carrito";
                button.addEventListener("click", async () => {
                    const token = localStorage.getItem("token");
                    if (!token) { window.location.href = "/login"; return; }
                    button.disabled = true;
                    try {
                        const result = await fetch("/api/cart", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                            body: JSON.stringify({ productId: product._id, quantity: 1 })
                        });
                        const data = await result.json();
                        if (!result.ok) throw new Error(data.message || "No se pudo agregar el producto");
                        button.textContent = "Agregado";
                    } catch (error) {
                        button.textContent = "Reintentar";
                        button.title = error.message;
                    } finally { button.disabled = false; }
                });
                card.append(image, title, description, price, button);
                grid.appendChild(card);
            });
        } catch (error) { showMessage(error.message, true); }
    };

    categoryButtons.forEach((button) => button.addEventListener("click", () => {
        const heading = button.querySelector("h3");
        loadProducts(heading?.textContent.trim() || "");
    }));
    loadProducts();
});
