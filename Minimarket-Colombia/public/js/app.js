const API_URL = "/api/clientes";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const clientesPorId = new Map();

let tabla;
let form;
let mensaje;
let submitBtn;

async function leerRespuesta(response) {
  const texto = await response.text();
  if (!texto) return {};

  try {
    return JSON.parse(texto);
  } catch {
    return { message: texto };
  }
}

function mostrarMensaje(texto, esError = false) {
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.hidden = !texto;
  mensaje.classList.toggle("error", esError);
  mensaje.classList.toggle("exito", !esError && Boolean(texto));
}

function setEnviando(enviando) {
  if (!submitBtn) return;

  submitBtn.disabled = enviando;
  submitBtn.textContent = enviando ? "Guardando…" : submitBtn.dataset.idleText;
}

function setModoEdicion(cliente) {
  const title = document.getElementById("form-title");
  const editando = Boolean(cliente);

  document.getElementById("cliente-id").value = cliente?._id || "";
  document.getElementById("documento").value = cliente?.documento || "";
  document.getElementById("nombres").value = cliente?.nombres || "";
  document.getElementById("apellidos").value = cliente?.apellidos || "";
  document.getElementById("correo").value = cliente?.correo || "";
  document.getElementById("telefono").value = cliente?.telefono || "";
  document.getElementById("password").value = "";
  document.getElementById("password").required = !editando;

  if (title) {
    title.textContent = editando ? "Actualizar Cliente" : "Registrar Nuevo Cliente";
  }

  if (submitBtn) {
    submitBtn.dataset.idleText = editando ? "Actualizar Cliente" : "Registrar Cliente";
    submitBtn.textContent = submitBtn.dataset.idleText;
    submitBtn.classList.toggle("is-editing", editando);
  }
}

function crearFila(cliente) {
  const fila = document.createElement("tr");

  const celdas = [
    cliente._id,
    cliente.documento,
    cliente.nombres,
    cliente.apellidos,
    cliente.correo,
    cliente.telefono,
  ];

  celdas.forEach((valor) => {
    const celda = document.createElement("td");
    celda.textContent = valor || "—";
    fila.appendChild(celda);
  });

  const acciones = document.createElement("td");
  const contenedorAcciones = document.createElement("div");
  contenedorAcciones.className = "celda-acciones";

  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.textContent = "Editar";
  botonEditar.dataset.action = "editar";
  botonEditar.dataset.id = cliente._id;

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.className = "peligro";
  botonEliminar.dataset.action = "eliminar";
  botonEliminar.dataset.id = cliente._id;

  contenedorAcciones.append(botonEditar, botonEliminar);
  acciones.appendChild(contenedorAcciones);
  fila.appendChild(acciones);

  return fila;
}

async function cargarClientes() {
  if (!tabla) return;

  try {
    const response = await fetch(API_URL, { headers: authHeaders() });
    const resultado = await leerRespuesta(response);

    if (!response.ok) {
      throw new Error(resultado.message || "No se pudieron cargar los clientes");
    }

    const clientes = Array.isArray(resultado) ? resultado : resultado.clientes;

    tabla.replaceChildren();
    clientesPorId.clear();

    if (!Array.isArray(clientes) || !clientes.length) {
      const vacio = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 7;
      celda.className = "tabla-vacia";
      celda.textContent = "No hay clientes registrados.";
      vacio.appendChild(celda);
      tabla.appendChild(vacio);
      return;
    }

    clientes.forEach((cliente) => {
      clientesPorId.set(cliente._id, cliente);
      tabla.appendChild(crearFila(cliente));
    });
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    mostrarMensaje(error.message, true);
  }
}

async function guardarCliente(evento) {
  evento.preventDefault();

  const id = document.getElementById("cliente-id").value;
  const password = document.getElementById("password").value;

  const clienteData = {
    documento: document.getElementById("documento").value.trim(),
    nombres: document.getElementById("nombres").value.trim(),
    apellidos: document.getElementById("apellidos").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
  };

  if (password) clienteData.password = password;

  setEnviando(true);
  mostrarMensaje("");

  try {
    const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(clienteData),
    });

    const resultado = await leerRespuesta(response);

    if (!response.ok) {
      mostrarMensaje(resultado.message || "Ocurrió un error al procesar los datos", true);
      return;
    }

    form.reset();
    setModoEdicion(null);
    mostrarMensaje(id ? "Cliente actualizado correctamente." : "Cliente registrado correctamente.");
    await cargarClientes();
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    mostrarMensaje("No se pudo conectar con el servidor.", true);
  } finally {
    setEnviando(false);
  }
}

async function eliminarCliente(id) {
  if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const resultado = await leerRespuesta(response);
      mostrarMensaje(resultado.message || "No se pudo eliminar el cliente", true);
      return;
    }

    clientesPorId.delete(id);
    setModoEdicion(null);
    mostrarMensaje("Cliente eliminado.");
    await cargarClientes();
  } catch (error) {
    console.error("Error en la petición de eliminación:", error);
    mostrarMensaje("No se pudo conectar con el servidor.", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  tabla = document.getElementById("tabla-clientes");
  form = document.getElementById("cliente-form");
  mensaje = document.getElementById("mensaje-de-estado");
  submitBtn = form?.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.dataset.idleText = submitBtn.textContent.trim();
  }

  setModoEdicion(null);

  form?.addEventListener("submit", guardarCliente);

  tabla?.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-action]");
    if (!boton) return;

    const cliente = clientesPorId.get(boton.dataset.id);
    if (!cliente) return;

    if (boton.dataset.action === "editar") {
      setModoEdicion(cliente);
      form?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("nombres")?.focus();
      return;
    }

    eliminarCliente(boton.dataset.id);
  });

  cargarClientes();
});
