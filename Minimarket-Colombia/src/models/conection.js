import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const router = path.join(dirname, "../data/clientes.json");

export async function LeerClientes() {
  try {
    const data = await fs.readFile(router, "utf-8");

    if (!data || data.trim() === ""){
      return[];
    }

    return JSON.parse(data);

  } catch (error) {
    if (error.code == "ENOENT") {
      await guardarClientes([]);
      return [];
    }
    
    if (error instanceof SyntaxError){
      await guardarClientes([]);
      return[];

    }
    throw error;
  }
}

export async function guardarClientes(cliente) {
  const folder = path.dirname(router);

  await fs.mkdir(folder, { recursive: true });

  await fs.writeFile(router, JSON.stringify(cliente, null, 2), "utf-8");
}

export async function ListarClientes() {
  return await LeerClientes();
}

export async function buscarClientesById(id) {
  const clientes = await LeerClientes();

  return clientes.find((clientes) => clientes.id == id);
}

export async function crearCLiente(data) {
  const clientes = await LeerClientes();


  const documentoLimpio = data.documento ? data.documento.trim() : "";


  const existeDocumento = clientes.some(c => c.documento === documentoLimpio);
  if (existeDocumento) {
    throw new Error("DOCUMENTO_DUPLICADO");
  }

  const nuevoCliente = {
    id: randomUUID(),
    nombres: data.nombres ? data.nombres.trim() : "",
    apellidos: data.apellidos ? data.apellidos.trim() : "",
    documento: documentoLimpio,
    telefono: data.telefono ? data.telefono.trim() : "",
    correo: data.correo ? data.correo.trim() : "",
    password: data.password ? data.password.trim() : "",
  };

  clientes.push(nuevoCliente);
  await guardarClientes(clientes);

  return nuevoCliente;
}

export async function actualizarCliente(id, data) {
  const clientes = await LeerClientes();

  const indice = clientes.findIndex((clientes) => clientes.id === id);

  if (indice === -1) {
    return null;
  }

  clientes[indice] = {
    ...clientes[indice],
    nombre: data.nombre ? data.nombre.trim() : clientes[indice].nombre,
    documento: data.documento ? data.documento.trim() : clientes[indice].documento,
    telefono: data.telefono ? data.telefono.trim() : clientes[indice].telefono,
    correo: data.correo ? data.correo.trim() : clientes[indice].correo,
  };

  await guardarClientes(clientes);

  return clientes[indice];
}


export async function eliminarCliente(id) {

    const clientes = await LeerClientes(); 
    const clientesFiltrados = clientes.filter(c => String(c.id) !== String(id));
    await guardarClientes(clientesFiltrados);
}