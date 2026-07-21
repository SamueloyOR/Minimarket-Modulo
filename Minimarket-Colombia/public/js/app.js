const API_URL = '/api/clientes';

document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();

    const form = document.getElementById('cliente-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('cliente-id').value;
        const clienteData = {
            documento: document.getElementById('documento').value,
            nombres: document.getElementById('nombres').value,
            apellidos: document.getElementById('apellidos').value,
            correo: document.getElementById('correo').value,
            telefono: document.getElementById('telefono').value
        };

        if (id) {
            // Actualizar (PUT)
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
        } else {
            // Crear (POST)
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
        }

        form.reset();
        document.getElementById('cliente-id').value = '';
        document.getElementById('form-title').innerText = 'Registrar Nuevo Cliente';
        cargarClientes();
    });
});

async function cargarClientes() {
    try {
        const response = await fetch(API_URL);
        const clientes = await response.json();
        
        const tbody = document.getElementById('tabla-clientes');
        tbody.innerHTML = '';

        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.documento}</td>
                <td>${cliente.nombres}</td>
                <td>${cliente.apellidos}</td>
                <td>${cliente.correo || ''}</td>
                <td>${cliente.telefono || ''}</td>
                <td>
                    <button onclick="editarCliente(${cliente.id}, '${cliente.documento}', '${cliente.nombres}', '${cliente.apellidos}', '${cliente.correo || ''}', '${cliente.telefono || ''}')">Editar</button>
                    <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

function editarCliente(id, documento, nombres, apellidos, correo, telefono) {
    document.getElementById('cliente-id').value = id;
    document.getElementById('documento').value = documento;
    document.getElementById('nombres').value = nombres;
    document.getElementById('apellidos').value = apellidos;
    document.getElementById('correo').value = correo;
    document.getElementById('telefono').value = telefono;
    document.getElementById('form-title').innerText = 'Actualizar Cliente';
}

async function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        cargarClientes();
    }
}


function ViewPassword() {
    let passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}