
function toggleProvidersModal() {
    const container = document.getElementById('providers-module-container');
    container.classList.toggle('modal-visible');
}


document.getElementById('providerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('provName').value;
    const email = document.getElementById('provEmail').value;

    const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactName: 'N/A', email, phone: '0000000' })
    });

    if (response.ok) {
        alert('Proveedor registrado exitosamente');
        toggleProvidersModal();
    }
});