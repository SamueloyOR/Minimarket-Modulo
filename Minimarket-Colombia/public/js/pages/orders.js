const formatearMoneda = (valor) => new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
}).format(Number(valor) || 0);

function crearTarjetaPedido(order) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "panel-card order-card";

    const titulo = document.createElement("h2");
    titulo.textContent = `Pedido ${order._id}`;

    const estado = document.createElement("p");
    estado.append("Estado: ");
    const estadoValor = document.createElement("strong");
    estadoValor.textContent = order.estado || "Sin estado";
    estado.appendChild(estadoValor);

    const total = document.createElement("p");
    total.append("Total: ");
    const totalValor = document.createElement("strong");
    totalValor.textContent = formatearMoneda(order.total);
    total.appendChild(totalValor);

    const productos = document.createElement("p");
    const cantidad = Array.isArray(order.items) ? order.items.length : 0;
    productos.textContent = `${cantidad} producto${cantidad === 1 ? "" : "s"}`;

    const creado = document.createElement("small");
    const fecha = order.createdAt ? new Date(order.createdAt) : null;
    creado.textContent = `Creado: ${fecha && !Number.isNaN(fecha.getTime()) ? fecha.toLocaleString("es-CO") : "Fecha no disponible"}`;

    tarjeta.append(titulo, estado, total, productos, creado);
    return tarjeta;
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const list = document.getElementById("orders-list");
    const message = document.getElementById("orders-message");

    const informar = (texto, esError = false) => {
        if (!message) return;
        message.textContent = texto;
        message.hidden = !texto;
        message.classList.toggle("error", esError);
    };

    if (!token) {
        window.location.href = "/login";
        return;
    }

    if (!list) return;

    informar("Cargando tus pedidos…");

    try {
        const response = await fetch("/api/orders/user", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(resultado.message || "No se pudo cargar el historial");
        }

        const orders = Array.isArray(resultado) ? resultado : resultado.orders;

        if (!Array.isArray(orders) || !orders.length) {
            list.replaceChildren();
            informar("Todavía no tienes pedidos registrados.");
            return;
        }

        informar("");
        list.replaceChildren(...orders.map(crearTarjetaPedido));
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        list.replaceChildren();
        informar(error.message, true);
    }
});
