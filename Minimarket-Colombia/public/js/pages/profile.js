document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const form = document.getElementById('profile-form');
    const message = document.getElementById('profile-message');
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

    try {
        const profile = await request('/api/users/me');
        document.getElementById('profile-name').value = profile.nombre || '';
        document.getElementById('profile-email').value = profile.correo || '';
        document.getElementById('profile-document').value = profile.documento || '';
        document.getElementById('profile-phone').value = profile.telefono || '';
    } catch (error) {
        message.textContent = error.message;
    }

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = Object.fromEntries(new FormData(form));
            const result = await request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) });
            localStorage.setItem('usuario', JSON.stringify(result.user));
            message.textContent = result.message;
        } catch (error) {
            message.textContent = error.message;
        }
    });
});
