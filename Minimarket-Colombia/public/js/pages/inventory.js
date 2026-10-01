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

    const informar = (texto, esError = false) => {
        if (!message) return;
        message.textContent = texto;
        message.hidden = !texto;
        message.classList.toggle('error', esError);
        message.classList.toggle('exito', !esError && Boolean(texto));
    };

    const parrafoVacio = (texto) => {
        const vacio = document.createElement('p');
        vacio.className = 'lista-vacia';
        vacio.textContent = texto;
        return vacio;
    };

    const cargarInventario = async () => {
        const [alertData, movementData] = await Promise.all([
            request('/api/inventory/alerts?limite=5'),
            request('/api/inventory')
        ]);

        const productos = Array.isArray(alertData?.productos) ? alertData.productos : [];

        if (alerts) {
            alerts.replaceChildren(...(productos.length
                ? productos.map((product) => {
                    const parrafo = document.createElement('p');
                    const nombre = document.createElement('strong');
                    nombre.textContent = product.nombre || 'Producto sin nombre';
                    parrafo.append(nombre, `: ${Number(product.stock) || 0} unidades`);
                    return parrafo;
                })
                : [parrafoVacio('No hay productos con stock bajo.')]));
        }

        const movimientos = Array.isArray(movementData) ? movementData : movementData?.movimientos;

        if (movements) {
            movements.replaceChildren(...(Array.isArray(movimientos) && movimientos.length
                ? movimientos.map((movement) => {
                    const parrafo = document.createElement('p');
                    const partes = [
                        String(movement.tipo || '').toUpperCase(),
                        movement.producto?.nombre || 'Producto',
                        String(Number(movement.cantidad) || 0),
                        movement.motivo || ''
                    ].filter(Boolean);
                    parrafo.textContent = partes.join(' — ');
                    return parrafo;
                })
                : [parrafoVacio('No hay movimientos.')]));
        }
    };

    const submitMovement = async (form, endpoint) => {
        const body = Object.fromEntries(new FormData(form));
        body.cantidad = Number(body.cantidad);
        if (body.costoUnitario === '') delete body.costoUnitario;
        if (!body.proveedor) delete body.proveedor;
        try {
            await request(endpoint, { method: 'POST', body: JSON.stringify(body) });
            form.reset();
            informar('Movimiento registrado correctamente.');
            await cargarInventario();
        } catch (error) {
            informar(error.message, true);
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

    cargarInventario().catch((error) => { informar(error.message, true); });
});
