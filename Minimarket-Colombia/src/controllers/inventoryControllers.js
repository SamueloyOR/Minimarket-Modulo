import Product from '../models/products.js';
import Provider from '../models/provider.js';
import InventoryMovement from '../models/inventoryMovement.js';
import mongoose from 'mongoose';

const validarCantidad = (cantidad) => Number.isInteger(Number(cantidad)) && Number(cantidad) > 0;

export const getInventoryMovements = async (req, res) => {
    try {
        const filtro = {};
        if (req.query.producto) filtro.producto = req.query.producto;
        if (req.query.tipo) filtro.tipo = req.query.tipo;
        if (req.query.proveedor) filtro.proveedor = req.query.proveedor;

        const movements = await InventoryMovement.find(filtro)
            .populate('producto', 'nombre categoria stock')
            .populate('proveedor', 'name contactName phone')
            .populate('usuario', 'nombre correo')
            .sort({ createdAt: -1 });

        return res.json(movements);
    } catch (error) {
        return res.status(400).json({ message: error.message || 'No se pudo obtener el inventario' });
    }
};

export const getInventoryAlerts = async (req, res) => {
    try {
        const rawThreshold = Number(req.query.limite ?? 5);
        const threshold = Number.isFinite(rawThreshold) && rawThreshold >= 0 ? rawThreshold : 5;
        const products = await Product.find({ stock: { $lte: threshold }, activo: true })
            .sort({ stock: 1, nombre: 1 });
        return res.json({ limite: threshold, productos: products });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'No se pudieron obtener las alertas de inventario' });
    }
};

export const registrarEntrada = async (req, res) => {
    const { producto, cantidad, proveedor, motivo, costoUnitario } = req.body;

    if (!mongoose.isValidObjectId(producto) || !validarCantidad(cantidad)) {
        return res.status(400).json({ message: 'Producto y cantidad válida son obligatorios' });
    }

    try {
        if (proveedor && !mongoose.isValidObjectId(proveedor)) {
            return res.status(400).json({ message: 'Proveedor inválido' });
        }

        const product = await Product.findById(producto);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        if (proveedor) {
            const provider = await Provider.findById(proveedor);
            if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

            await Provider.findByIdAndUpdate(proveedor, { $addToSet: { productos: product._id } });
            await Product.findByIdAndUpdate(product._id, { $addToSet: { proveedores: proveedor } });
        }

        product.stock += Number(cantidad);
        await product.save();

        const movement = await InventoryMovement.create({
            producto: product._id,
            tipo: 'entrada',
            cantidad: Number(cantidad),
            proveedor: proveedor || null,
            usuario: req.user.id,
            motivo: motivo || 'Entrada de mercancía',
            costoUnitario: costoUnitario === undefined || costoUnitario === '' ? null : Number(costoUnitario)
        });

        return res.status(201).json({ message: 'Entrada de inventario registrada', producto: product, movimiento: movement });
    } catch (error) {
        return res.status(400).json({ message: error.message || 'No se pudo registrar la entrada' });
    }
};

export const registrarSalida = async (req, res) => {
    const { producto, cantidad, motivo } = req.body;

    if (!mongoose.isValidObjectId(producto) || !validarCantidad(cantidad)) {
        return res.status(400).json({ message: 'Producto y cantidad válida son obligatorios' });
    }

    try {
        const quantity = Number(cantidad);
        const product = await Product.findOneAndUpdate(
            { _id: producto, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );

        if (!product) {
            const exists = await Product.exists({ _id: producto });
            return res.status(exists ? 400 : 404).json({
                message: exists ? 'Stock insuficiente para registrar la salida' : 'Producto no encontrado'
            });
        }

        const movement = await InventoryMovement.create({
            producto: product._id,
            tipo: 'salida',
            cantidad: quantity,
            usuario: req.user.id,
            motivo: motivo || 'Salida de mercancía'
        });

        return res.status(201).json({ message: 'Salida de inventario registrada', producto: product, movimiento: movement });
    } catch (error) {
        return res.status(400).json({ message: error.message || 'No se pudo registrar la salida' });
    }
};
