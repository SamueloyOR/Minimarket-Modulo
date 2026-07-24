import {
    ListarClientes,
    buscarClientesById,
    crearCLiente,
    actualizarCliente as actualizarClienteModel,
    eliminarCliente as eliminarClienteModel

} from "../models/conection.js";

// 1. OBTENER / LISTAR CLIENTES (Read)
export const obtenerClientes = async (req, res) => {
    try {
        const clientes = await ListarClientes();
        res.json(clientes);
    } catch (error) {
        console.error("ERROR DETALLADO EN GET:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. CREAR CLIENTE (Create)
export const crearCliente = async (req, res) => {
    try {
        const nuevoCliente = await crearCLiente(req.body);
        res.status(201).json({ mensaje: 'Cliente creado con éxito', cliente: nuevoCliente });
    } catch (error) {

        console.error("ERROR DETALLADO", error);
        
        if (error.message === "DOCUMENTO_DUPLICADO"){
            return res.status(400).json({
                message:"Este numero de documento ya esta registrado"
            });
        }
        return res.status(500).json({ message: error.message });
    }
};

// 3. ACTUALIZAR CLIENTE (Update)

export async function actualizarCliente(req, res) {
    try {
        const { id } = req.params;
        const clienteActualizado = await actualizarClienteModel(id, req.body);

        if (!clienteActualizado) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.json(clienteActualizado);
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        return res.status(500).json({ message: error.message });
    }
}

// 4. ELIMINAR CLIENTE (Delete)

export async function eliminarCliente(req, res) {
    try {
        const { id } = req.params;
        
        await eliminarClienteModel(id);
        
        res.json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}
