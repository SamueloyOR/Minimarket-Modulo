import client from "./client.js";

export async function LeerClientes() {
  return client.find()
    .select("-__v")
    .sort({ apellidos: 1, nombres: 1 })
    .lean();
}

export const obtenerClientes = async (req, res) => {
    const clientes = await client.find()
        .select("-__v")
        .sort({ apellidos: 1, nombres: 1 });

    res.json(clientes);
};

export async function ListarClientes() {
  return LeerClientes();
}

export async function buscarClientesById(id) {
  return client.findById(id).select("-__v").lean();
}

export async function crearCLiente(data) {
  try {
    return await client.create({
      nombres: data.nombres,
      apellidos: data.apellidos,
      documento: data.documento,
      telefono: data.telefono,
      correo: data.correo
    });
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.documento) {
      throw new Error("DOCUMENTO_DUPLICADO");
    }
    throw error;
  }
}

export async function actualizarCliente(id, data) {
  try {
    return await client.findByIdAndUpdate(
      id,
      {
        $set: Object.fromEntries(
          ["nombres", "apellidos", "documento", "telefono", "correo"]
            .filter((field) => typeof data[field] === "string")
            .map((field) => [field, data[field].trim()])
        )
      },
      { new: true, runValidators: true }
    ).select("-__v").lean();
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.documento) {
      throw new Error("DOCUMENTO_DUPLICADO");
    }
    throw error;
  }
}

export async function eliminarCliente(id) {
  return await client.findByIdAndDelete(id);
}
