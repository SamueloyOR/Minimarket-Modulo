document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('providerForm');
    const list = document.getElementById('providersList');
    const modal = document.getElementById('providers-module-container');
    const openButton = document.getElementById('openProvidersModal');
    const closeButton = document.getElementById('closeProvidersModal');
    const status = document.getElementById('providerFormStatus');
    const token = () => localStorage.getItem('token') || '';

    const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        openButton?.focus();
    };

    openButton?.addEventListener('click', () => {
        if (!modal) return;
        modal.hidden = false;
        document.getElementById('provName')?.focus();
        cargarProveedores();
    });
    closeButton?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (!modal || modal.hidden) return;
        if (event.key === 'Escape') {
            closeModal();
            return;
        }
        if (event.key !== 'Tab') return;

        const focusable = [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled)')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    });

    const request = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token()}`,
                ...(options.headers || {})
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'No se pudo completar la solicitud');
        return data;
    };

    const cargarProveedores = async () => {
        if (!list) return;
        list.setAttribute('aria-busy', 'true');
        list.replaceChildren(Object.assign(document.createElement('p'), {
            className: 'providers-empty',
            textContent: 'Cargando proveedores...'
        }));
        try {
            const providers = await request('/api/providers');
            list.replaceChildren();
            if (!providers.length) {
                list.append(Object.assign(document.createElement('p'), {
                    className: 'providers-empty',
                    textContent: 'Todavía no hay proveedores. Registra el primero desde el formulario.'
                }));
                return;
            }

            providers.forEach((provider) => {
                const item = document.createElement('article');
                item.className = 'provider-item';
                const heading = document.createElement('div');
                heading.className = 'provider-item-heading';
                heading.append(
                    Object.assign(document.createElement('strong'), { textContent: provider.name }),
                    Object.assign(document.createElement('span'), {
                        className: 'provider-product-count',
                        textContent: `${provider.productos?.length || 0} productos`
                    })
                );
                item.append(
                    heading,
                    Object.assign(document.createElement('span'), {
                        className: 'provider-contact',
                        textContent: provider.contactName
                    }),
                    Object.assign(document.createElement('small'), {
                        textContent: [provider.email, provider.phone].filter(Boolean).join(' · ')
                    }),
                    Object.assign(document.createElement('small'), {
                        textContent: provider.address || 'Sin dirección registrada'
                    })
                );
                list.append(item);
            });
        } catch (error) {
            list.replaceChildren(Object.assign(document.createElement('p'), {
                className: 'providers-empty provider-error',
                textContent: error.message
            }));
        } finally {
            list.setAttribute('aria-busy', 'false');
        }
    };

    document.getElementById('refreshProviders')?.addEventListener('click', cargarProveedores);

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            name: document.getElementById('provName')?.value.trim(),
            contactName: document.getElementById('provContact')?.value.trim(),
            email: document.getElementById('provEmail')?.value.trim(),
            phone: document.getElementById('provPhone')?.value.trim(),
            address: document.getElementById('provAddress')?.value.trim()
        };
        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        status.textContent = 'Guardando proveedor...';
        status.classList.remove('is-error');

        try {
            await request('/api/providers', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            form.reset();
            status.textContent = 'Proveedor registrado correctamente.';
            await cargarProveedores();
        } catch (error) {
            status.textContent = error.message;
            status.classList.add('is-error');
        } finally {
            submitButton.disabled = false;
        }
    });

    if (modal?.hidden === false) cargarProveedores();
});
