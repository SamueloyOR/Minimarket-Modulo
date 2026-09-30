document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const list = document.getElementById('orders-list');
    const message = document.getElementById('orders-message');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/orders/user', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const orders = await response.json();
        if (!response.ok) throw new Error(orders.message || 'No se pudo cargar el historial');

        if (!orders.length) {
            message.textContent = 'Todavía no tienes pedidos registrados.';
            return;
        }

        list.innerHTML = orders.map((order) => `
            <article class="panel-card" style="margin: 1rem 0; padding: 1rem;">
                <h2>Pedido ${order._id}</h2>
                <p>Estado: <strong>${order.estado}</strong></p>
                <p>Total: <strong>${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(order.total || 0)}</strong></p>
                <p>${order.items?.length || 0} producto(s)</p>
                <small>Creado: ${new Date(order.createdAt).toLocaleString('es-CO')}</small>
            </article>
        `).join('');
    } catch (error) {
        message.textContent = error.message;
    }
});
