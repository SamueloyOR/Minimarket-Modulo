document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".products-carts");
    if (!grid) return;

    const isOffersPage = window.location.pathname.includes("offers");
    const categoriesContainer = document.querySelector(".categories-container");
    const categoryAdmin = document.getElementById("category-admin");
    const categoryForm = document.getElementById("category-form");
    const productForm = document.getElementById("product-form");
    const productCategory = document.getElementById("product-category");
    const adminMessage = document.getElementById("admin-catalog-message");
    const formatCurrency = (value) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", maximumFractionDigits: 0
    }).format(Number(value) || 0);

    const token = () => localStorage.getItem("token") || "";

    const usuario = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null");
        } catch {
            return null;
        }
    })();

    if (categoryAdmin) categoryAdmin.hidden = usuario?.rol !== "admin";

    const showAdminMessage = (text, error = false) => {
        if (!adminMessage) return;
        adminMessage.textContent = text;
        adminMessage.classList.toggle("error", error);
    };

    const showMessage = (text, error = false) => {
        grid.replaceChildren();
        const message = document.createElement("p");
        message.className = error ? "catalog-message catalog-message-error" : "catalog-message";
        message.textContent = text;
        grid.appendChild(message);
    };

    const loadCategories = async () => {
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) throw new Error("No se pudieron cargar las categorías");

            const categories = await response.json();
            if (!Array.isArray(categories) || !categories.length) return;

            categoriesContainer?.replaceChildren();
            if (productCategory) {
                productCategory.replaceChildren(new Option("Selecciona una categoría", ""));
            }

            categories.forEach((category) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "category-card";
                button.dataset.category = category.nombre;
                button.innerHTML = `
                    <span class="category-icon" aria-hidden="true">+</span>
                    <span>
                        <strong>${category.nombre}</strong>
                        <small>${category.descripcion || "Explora productos de esta categoría."}</small>
                    </span>`;
                categoriesContainer?.appendChild(button);

                productCategory?.appendChild(new Option(category.nombre, category.nombre));
            });
        } catch (error) {
            showAdminMessage(error.message, true);
        }
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

    categoriesContainer?.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-category]");
        if (button) loadProducts(button.dataset.category || "");
    });

    categoryForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(categoryForm);

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo crear la categoría");
            categoryForm.reset();
            await loadCategories();
            showAdminMessage("Categoría guardada correctamente.");
        } catch (error) {
            showAdminMessage(error.message, true);
        }
    });

    productForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(productForm));
        formData.precio = Number(formData.precio);
        formData.stock = Number(formData.stock);
        if (!formData.imagen) delete formData.imagen;

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo crear el producto");
            productForm.reset();
            await loadProducts(formData.categoria);
            showAdminMessage("Producto guardado correctamente.");
        } catch (error) {
            showAdminMessage(error.message, true);
        }
    });

    loadCategories();
    loadProducts();
});
