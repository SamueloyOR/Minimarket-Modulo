document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token') || '';
    const message = document.getElementById('inventory-message');
    const alerts = document.getElementById('inventory-alerts');
    const movements = document.getElementById('inventory-movements');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const request = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación');
        return data;
    };

    const cargarInventario = async () => {
        const [alertData, movementData] = await Promise.all([
            request('/api/inventory/alerts?limite=5'),
            request('/api/inventory')
        ]);

        alerts.innerHTML = alertData.productos.map((product) =>
            `<p><strong>${product.nombre}</strong>: ${product.stock} unidades</p>`
        ).join('') || '<p>No hay productos con stock bajo.</p>';

        movements.innerHTML = movementData.map((movement) => `
            <p>${movement.tipo.toUpperCase()} — ${movement.producto?.nombre || 'Producto'} — ${movement.cantidad} — ${movement.motivo || ''}</p>
        `).join('') || '<p>No hay movimientos.</p>';
    };

    const submitMovement = async (form, endpoint) => {
        const body = Object.fromEntries(new FormData(form));
        body.cantidad = Number(body.cantidad);
        if (body.costoUnitario === '') delete body.costoUnitario;
        if (!body.proveedor) delete body.proveedor;
        try {
            await request(endpoint, { method: 'POST', body: JSON.stringify(body) });
            form.reset();
            message.textContent = 'Movimiento registrado correctamente.';
            await cargarInventario();
        } catch (error) {
            message.textContent = error.message;
        }
    };

    document.getElementById('entry-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        submitMovement(event.currentTarget, '/api/inventory/entry');
    });

    document.getElementById('exit-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        submitMovement(event.currentTarget, '/api/inventory/exit');
    });

    cargarInventario().catch((error) => { message.textContent = error.message; });
});
