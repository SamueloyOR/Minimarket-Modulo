import fs from "node:fs/promise";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(fileURLToPath);

const router = path.join(dirname, "../data/clientes.js");

async function LeerClientes() {
  try {
    const data = await fs.readfile(router, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code == "ENOENT") {
      await guardarCliente([]);
      return [];
    }
    throw error;
  }
}

async function guardarClientes(cliente) {
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

  const nuevoCliente = {
    id: randomUUID(),
    nombre: data.nombre.trim(),
    documento: data.documento.trim(),
    telefono: data.telefono.trim(),
    correo: data.correo.trim(),
    password: data.password.trim(),
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
}

const clienteActual = clientes[indice];

clientes[indice];
