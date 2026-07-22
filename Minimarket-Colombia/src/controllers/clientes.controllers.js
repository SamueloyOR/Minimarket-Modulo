import {
    ListarClientes,
    buscarClientesById,
    crearCLiente,
    actualizarCliente as actualizarClienteModel,
    eliminarCliente as eliminarClienteMOdel

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
        console.error("ERROR DETALLADO EN POST:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. ACTUALIZAR CLIENTE (Update)
export const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteActualizado = await actualizarClienteModel(id, req.body);
        
        if (!clienteActualizado) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        res.json({ mensaje: 'Cliente actualizado correctamente', cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR CLIENTE (Delete)
export const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarClienteModel(id);
        
        if (!resultado) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
