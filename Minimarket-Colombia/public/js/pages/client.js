import {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
} from "../core/api.js";

const form = document.getElementById("cliente-form");
const tablaClientes = document.getElementById("tabla-clientes");

if (form && tablaClientes) {
    cargarClientes();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = document.getElementById("cliente-id").value;
        const cliente = {
            documento: document.getElementById("documento").value,
            nombres: document.getElementById("nombres").value,
            apellidos: document.getElementById("apellidos").value,
            password: document.getElementById("password").value,
            correo: document.getElementById("correo").value,
            telefono: document.getElementById("telefono").value,
        };

        try {
            if (id) {
                await actualizarCliente(id, cliente);
            } else {
                await crearCliente(cliente);
            }

            form.reset();
            form.getElementById("cliente-id").value = "";
            await cargarClientes();
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
        }
    });
}

async function cargarClientes() {
    const clientes = await obtenerClientes();

    tabla.innerHTML = clientes.map((cliente) => `
        <tr></tr>
            <td>${cliente.id}</td>
            <td>${cliente.documento}</td>
            <td>${cliente.nombres}</td>
            <td>${cliente.apellidos}</td>
            <td>${cliente.correo || ""}</td>
            <td>${cliente.telefono || ''}</td>
            <td></td>
                <button onclick="editarCliente('${cliente.id}', '${cliente.documento}', '${cliente.nombres}', '${cliente.apellidos}', '${cliente.correo || ''}', '${cliente.telefono || ''}')">Editar</button>
                <button onclick="eliminarCliente('${cliente.id}')">Eliminar</button>
            </td>
        </tr>
    `).join("");
}

tabla?.addEventListener("click", async (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "editar"){
        await eliminarCliente(id);
        await cargarClientes();
    }
});

