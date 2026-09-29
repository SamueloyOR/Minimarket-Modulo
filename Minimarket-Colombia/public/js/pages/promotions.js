document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token') || '';
    const form = document.getElementById('promotion-form');
    const productSelect = document.getElementById('promotion-products');
    const list = document.getElementById('promotion-list');
    const message = document.getElementById('promotion-message');
    const idInput = document.getElementById('promotion-id');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const request = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'No se pudo completar la solicitud');
        return data;
    };

    const cargarProductos = async () => {
        const products = await request('/api/products');
        productSelect.innerHTML = products.map((p) => `<option value="${p._id}">${p.nombre}</option>`).join('');
    };

    const cargarPromociones = async () => {
        const promotions = await request('/api/promotions');
        list.innerHTML = promotions.map((promotion) => `
            <article class="panel-card" style="padding:1rem; margin:1rem 0;">
                <h3>${promotion.nombre}</h3>
                <p>${promotion.descripcion || ''}</p>
                <p>Descuento: ${promotion.descuentoPorcentaje}% · ${promotion.activa ? 'Activa' : 'Inactiva'}</p>
                <p>Productos: ${(promotion.productos || []).map((p) => p.nombre).join(', ') || 'Ninguno'}</p>
                <button type="button" data-edit="${promotion._id}">Editar</button>
                <button type="button" data-delete="${promotion._id}">Eliminar</button>
            </article>
        `).join('') || '<p>No hay promociones creadas.</p>';
    };

    const resetForm = () => {
        form.reset();
        idInput.value = '';
        form.querySelector('[name="activa"]').checked = true;
        [...productSelect.options].forEach((option) => { option.selected = false; });
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.productos = [...productSelect.selectedOptions].map((option) => option.value);
        data.descuentoPorcentaje = Number(data.descuentoPorcentaje);
        data.activa = form.querySelector('[name="activa"]').checked;
        delete data.id;

        const id = idInput.value;
        if (!id) {
            data.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString() : undefined;
            data.fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString() : undefined;
        } else {
            data.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString() : undefined;
            data.fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString() : undefined;
        }

        try {
            await request(id ? `/api/promotions/${id}` : '/api/promotions', {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(data)
            });
            message.textContent = id ? 'Promoción actualizada.' : 'Promoción creada.';
            resetForm();
            await cargarPromociones();
        } catch (error) {
            message.textContent = error.message;
        }
    });

    list.addEventListener('click', async (event) => {
        const editId = event.target.dataset.edit;
        const deleteId = event.target.dataset.delete;
        try {
            if (editId) {
                const promotion = await request(`/api/promotions/${editId}`);
                idInput.value = promotion._id;
                form.querySelector('[name="nombre"]').value = promotion.nombre || '';
                form.querySelector('[name="descripcion"]').value = promotion.descripcion || '';
                form.querySelector('[name="descuentoPorcentaje"]').value = promotion.descuentoPorcentaje;
                form.querySelector('[name="fechaInicio"]').value = promotion.fechaInicio ? new Date(promotion.fechaInicio).toISOString().slice(0, 16) : '';
                form.querySelector('[name="fechaFin"]').value = promotion.fechaFin ? new Date(promotion.fechaFin).toISOString().slice(0, 16) : '';
                form.querySelector('[name="activa"]').checked = promotion.activa;
                [...productSelect.options].forEach((option) => {
                    option.selected = promotion.productos.some((p) => String(p._id) === option.value);
                });
                return;
            }
            if (deleteId) {
                await request(`/api/promotions/${deleteId}`, { method: 'DELETE' });
                message.textContent = 'Promoción eliminada.';
                await cargarPromociones();
            }
        } catch (error) {
            message.textContent = error.message;
        }
    });

    document.getElementById('promotion-cancel').addEventListener('click', resetForm);

    Promise.all([cargarProductos(), cargarPromociones()]).catch((error) => { message.textContent = error.message; });
});
