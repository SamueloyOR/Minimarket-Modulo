import Order from "../models/order.js";
import Product from "../models/products.js";
import mongoose from "mongoose";

export const obtenerOrdenes = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const userId = req.user.id;
        const { items, direccionEnvio, metodosPago } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "La orden debe contener al menos un producto" });
        }

        if (!direccionEnvio?.calle || !direccionEnvio?.ciudad || !metodosPago) {
            return res.status(400).json({ message: "La dirección y el método de pago son obligatorios" });
        }

        const cantidades = new Map();
        for (const item of items) {
            const productoId = String(item?.producto || "");
            const cantidad = Number(item?.cantidad);

            if (!mongoose.isValidObjectId(productoId) || !Number.isInteger(cantidad) || cantidad < 1) {
                return res.status(400).json({ message: "Los productos de la orden son inválidos" });
            }

            cantidades.set(productoId, (cantidades.get(productoId) || 0) + cantidad);
        }

        let nuevaOrden;
        await session.withTransaction(async () => {
            const productos = await Product.find({
                _id: { $in: [...cantidades.keys()] },
                activo: true
            }).session(session);

            if (productos.length !== cantidades.size) {
                throw new Error("Uno o más productos no existen o están inactivos");
            }

            const orderItems = [];
            let total = 0;

            for (const producto of productos) {
                const cantidad = cantidades.get(String(producto._id));
                const precioUnitario = producto.enOferta && producto.precioOferta != null
                    ? producto.precioOferta
                    : producto.precio;

                const resultado = await Product.updateOne(
                    { _id: producto._id, activo: true, stock: { $gte: cantidad } },
                    { $inc: { stock: -cantidad } },
                    { session }
                );

                if (resultado.modifiedCount !== 1) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
                }

                orderItems.push({ producto: producto._id, cantidad, precioUnitario });
                total += precioUnitario * cantidad;
            }

            [nuevaOrden] = await Order.create([{
                cliente: userId,
                items: orderItems,
                total,
                direccionEnvio,
                metodosPago
            }], { session });
        });

        return res.status(201).json(nuevaOrden);
    } catch (error) {
        console.error("Error al crear la orden:", error);
        return res.status(400).json({ message: error.message || "No se pudo crear la orden" });
    } finally {
        await session.endSession();
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
        const estadosValidos = ["pendiente", "procesando", "completado", "cancelado"];

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: "Estado de orden inválido" });
        }

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
