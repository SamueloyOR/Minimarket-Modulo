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

    const cargarProductos = async () => {
        const resultado = await request('/api/products');
        const products = Array.isArray(resultado) ? resultado : resultado.productos || [];

        productSelect.replaceChildren(...products.map((p) => new Option(p.nombre || 'Sin nombre', p._id)));
    };

    const crearTarjetaPromocion = (promotion) => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'panel-card promotion-card';

        const titulo = document.createElement('h3');
        titulo.textContent = promotion.nombre || 'Promoción sin nombre';

        const descripcion = document.createElement('p');
        descripcion.textContent = promotion.descripcion || '';

        const descuento = document.createElement('p');
        const estado = document.createElement('span');
        estado.className = `estado ${promotion.activa ? 'activa' : 'inactiva'}`;
        estado.textContent = promotion.activa ? 'Activa' : 'Inactiva';
        descuento.append(`Descuento: ${Number(promotion.descuentoPorcentaje) || 0}% · `, estado);

        const productos = document.createElement('p');
        const nombres = (Array.isArray(promotion.productos) ? promotion.productos : [])
            .map((p) => p.nombre || 'Producto')
            .join(', ');
        productos.textContent = `Productos: ${nombres || 'Ninguno'}`;

        const acciones = document.createElement('div');
        acciones.className = 'promotion-actions';

        const editar = document.createElement('button');
        editar.type = 'button';
        editar.textContent = 'Editar';
        editar.dataset.edit = promotion._id;

        const eliminar = document.createElement('button');
        eliminar.type = 'button';
        eliminar.textContent = 'Eliminar';
        eliminar.className = 'peligro';
        eliminar.dataset.delete = promotion._id;

        acciones.append(editar, eliminar);
        tarjeta.append(titulo, descripcion, descuento, productos, acciones);

        return tarjeta;
    };

    const cargarPromociones = async () => {
        const resultado = await request('/api/promotions');
        const promotions = Array.isArray(resultado) ? resultado : resultado.promociones || [];

        if (!promotions.length) {
            list.replaceChildren(parrafoVacio('No hay promociones creadas.'));
            return;
        }

        list.replaceChildren(...promotions.map(crearTarjetaPromocion));
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
        data.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString() : undefined;
        data.fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString() : undefined;

        try {
            await request(id ? `/api/promotions/${id}` : '/api/promotions', {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(data)
            });
            informar(id ? 'Promoción actualizada.' : 'Promoción creada.');
            resetForm();
            await cargarPromociones();
        } catch (error) {
            informar(error.message, true);
        }
    });

    list.addEventListener('click', async (event) => {
        const boton = event.target.closest('button[data-edit], button[data-delete]');
        if (!boton) return;

        const editId = boton.dataset.edit;
        const deleteId = boton.dataset.delete;

        try {
            if (editId) {
                const promotion = await request(`/api/promotions/${editId}`);
                const productos = Array.isArray(promotion.productos) ? promotion.productos : [];

                idInput.value = promotion._id;
                form.querySelector('[name="nombre"]').value = promotion.nombre || '';
                form.querySelector('[name="descripcion"]').value = promotion.descripcion || '';
                form.querySelector('[name="descuentoPorcentaje"]').value = promotion.descuentoPorcentaje ?? '';
                form.querySelector('[name="fechaInicio"]').value = promotion.fechaInicio ? new Date(promotion.fechaInicio).toISOString().slice(0, 16) : '';
                form.querySelector('[name="fechaFin"]').value = promotion.fechaFin ? new Date(promotion.fechaFin).toISOString().slice(0, 16) : '';
                form.querySelector('[name="activa"]').checked = Boolean(promotion.activa);
                [...productSelect.options].forEach((option) => {
                    option.selected = productos.some((p) => String(p._id ?? p) === option.value);
                });

                informar('');
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            if (deleteId) {
                if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;

                await request(`/api/promotions/${deleteId}`, { method: 'DELETE' });
                informar('Promoción eliminada.');
                await cargarPromociones();
            }
        } catch (error) {
            informar(error.message, true);
        }
    });

    document.getElementById('promotion-cancel')?.addEventListener('click', resetForm);

    Promise.all([cargarProductos(), cargarPromociones()]).catch((error) => { informar(error.message, true); });
});
