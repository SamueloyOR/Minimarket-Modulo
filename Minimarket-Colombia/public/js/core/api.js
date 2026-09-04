const API_URL = "/api";

export async function obtenerClientes() {
  const response = await fetch(`${API_URL}/clientes`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los clientes");
  }

  return response.json();
}

export async function crearCliente(cliente) {
  return enviarSolicitud("/clientes", {
    method: "POST",
    body: JSON.stringify(cliente),
  });
}

export async function actualizarCliente(id, cliente) {
  return enviarSolicitud(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(cliente),
  });
}

export async function eliminarCliente(id) {
  return enviarSolicitud(`/clientes/${id}`, {
    method: "DELETE",
  });
}

async function enviarSolicitud(url, opciones = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...opciones,
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(resultado.message || "Error en la solicitud");
  }

  return resultado;
}