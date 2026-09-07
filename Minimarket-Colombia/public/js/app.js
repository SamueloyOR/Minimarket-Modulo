
//declaracion de la API
const API_URL = 'http://localhost:3000/api/clientes';

let response;

document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();

    const form = document.getElementById("cliente-form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById('cliente-id').value;
            const clienteData = {
                documento: document.getElementById('documento').value,
                nombres: document.getElementById('nombres').value,
                apellidos: document.getElementById('apellidos').value,
                contraseña: document.getElementById('password').value,
                correo: document.getElementById('correo').value,
                telefono: document.getElementById('telefono').value
            };

            if (id) {
                response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clienteData)
                });
            } else {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clienteData)
                });
            }

            const resultado = await response.json();

            if (!response.ok) {
                alert(resultado.message || "Ocurrio un error al procesar lo datos");
                return;
            }

            form.reset();
            document.getElementById('cliente-id').value = '';
            const title = document.getElementById('form-title');
            if (title) {
                title.innerText = 'Registrar Nuevo Cliente';
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerText = 'Registrar Cliente';
                submitBtn.style.backgroundColor = '';
                submitBtn.style.color = '';
            }

            cargarClientes();
        });
    }
});
//funciones CRUD

async function cargarClientes() {
    try {
        const response = await fetch(API_URL);
        const clientes = await response.json();

        const tbody = document.getElementById('tabla-clientes');
        if (!tbody) return;

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
                    <button onclick="editarCliente('${cliente.id}', '${cliente.documento}', '${cliente.nombres}', '${cliente.apellidos}', '${cliente.correo || ''}', '${cliente.telefono || ''}')">Editar</button>
                    <button onclick="eliminarCliente('${cliente.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

async function editarCliente(id, documento, nombres, apellidos, correo, telefono) {
    document.getElementById('cliente-id').value = id;
    document.getElementById('documento').value = documento;
    document.getElementById('nombres').value = nombres;
    document.getElementById('apellidos').value = apellidos;
    document.getElementById('correo').value = correo;
    document.getElementById('telefono').value = telefono;

    const title = document.getElementById('form-title');
    if (title) {
        title.innerText = 'Actualizar Cliente';
    }

    const form = document.getElementById("cliente-form");
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
        submitBtn.innerText = 'Actualizar Cliente';
        submitBtn.style.backgroundColor = '#ffc107';
        submitBtn.style.color = '#000';
    }
}

async function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

            if (response.ok) {
                cargarClientes();
            } else {
                console.log("No se pudo eliminar el cliente");
            }
        } catch (error) {
            console.error("Error en la peticion de eliminacion:", error);
        }
    }
}

// funtion para ver la contraseña

function ViewPassword() {
    const passwordInput = document.getElementById("password");
    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}

window.ViewPassword = ViewPassword;
window.viewPassword = ViewPassword;
