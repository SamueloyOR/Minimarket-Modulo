import Order from '../models/order.js';

export const obtenerOrdenes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, total, direccionEnvio, metodosPago } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'La orden debe contener al menos un producto' });
        }

        const nuevaOrden = new Order({
            cliente: userId,
            items,
            total,
            direccionEnvio,
            metodosPago
        });

        await nuevaOrden.save();
        res.status(201).json(nuevaOrden);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la orden', error: error.message });
    }
};

export const obtenerOrdenesUsuario = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ cliente: userId }).populate('items.producto', 'nombre imagen');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las ordenes del usuario', error: error.message });
    }
};

export const obtenerTodasOrdenes = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('cliente', 'nombre correo')
            .populate('items.producto', 'nombre imagen');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener todas las ordenes', error: error.message });
    }
};

export const actualizarEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const orderActualizada = await Order.findByIdAndUpdate(id, { estado }, { new: true });

        if (!orderActualizada) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(orderActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado de la orden', error: error.message });
    }
};

export const eliminarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const ordenEliminada = await Order.findByIdAndDelete(id);

        if (!ordenEliminada) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json({ message: 'Orden eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la orden', error: error.message });
    }
};
