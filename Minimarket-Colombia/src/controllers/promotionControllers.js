import Promotion from '../models/promotion.js';
import Product from '../models/products.js';
import mongoose from 'mongoose';

const normalizarProductos = (productos) => Array.isArray(productos)
    ? [...new Set(productos.map(String))]
    : [];

const restaurarProductosDePromocion = async (promotionId) => {
    await Product.updateMany(
        { promocion: promotionId },
        [
            {
                $set: {
                    precio: { $cond: [{ $gt: [{ $ifNull: ['$precioRegular', 0] }, 0] }, '$precioRegular', '$precio'] },
                    precioOferta: null,
                    enOferta: false,
                    promocion: null
                }
            }
        ]
    );
};

const aplicarPromocion = async (promotion) => {
    for (const productId of promotion.productos) {
        const product = await Product.findById(productId);
        if (!product) continue;

        const precioBase = Number(product.precioRegular || product.precio);
        const precioOferta = Math.max(0, Math.round(precioBase * (1 - promotion.descuentoPorcentaje / 100)));

        await Product.findByIdAndUpdate(product._id, {
            precioRegular: precioBase,
            precioOferta,
            enOferta: promotion.activa,
            promocion: promotion.activa ? promotion._id : null,
            precio: promotion.activa ? precioBase : precioBase
        });
    }
};

const validar = ({ nombre, descuentoPorcentaje, fechaInicio, fechaFin, productos }) => {
    const ids = normalizarProductos(productos);
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) return 'El nombre de la promoción es obligatorio';
    const discount = Number(descuentoPorcentaje);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) return 'El descuento debe estar entre 0 y 100';
    if (ids.some((id) => !mongoose.isValidObjectId(id))) return 'Hay productos inválidos';
    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) return 'La fecha final no puede ser anterior a la inicial';
    return null;
};

export const getPromotions = async (_req, res) => {
    const promotions = await Promotion.find({}).populate('productos', 'nombre precio precioOferta enOferta').sort({ createdAt: -1 });
    return res.json(promotions);
};

export const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id).populate('productos', 'nombre precio precioOferta enOferta');
        if (!promotion) return res.status(404).json({ message: 'Promoción no encontrada' });
        return res.json(promotion);
    } catch {
        return res.status(400).json({ message: 'Id de promoción inválido' });
    }
};

export const createPromotion = async (req, res) => {
    try {
        const error = validar(req.body);
        if (error) return res.status(400).json({ message: error });

        const productos = normalizarProductos(req.body.productos);
        const existing = await Product.countDocuments({ _id: { $in: productos } });
        if (existing !== productos.length) return res.status(404).json({ message: 'Uno o más productos no existen' });

        const promotion = await Promotion.create({
            nombre: req.body.nombre.trim(),
            descripcion: req.body.descripcion || '',
            descuentoPorcentaje: Number(req.body.descuentoPorcentaje),
            fechaInicio: req.body.fechaInicio || new Date(),
            fechaFin: req.body.fechaFin || null,
            activa: req.body.activa !== false,
            productos
        });

        if (promotion.activa) await aplicarPromocion(promotion);
        return res.status(201).json({ message: 'Promoción creada correctamente', promocion: promotion });
    } catch (error) {
        return res.status(400).json({ message: error.message || 'No se pudo crear la promoción' });
    }
};

export const updatePromotion = async (req, res) => {
    try {
        const existing = await Promotion.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Promoción no encontrada' });

        const data = { ...existing.toObject(), ...req.body };
        const error = validar(data);
        if (error) return res.status(400).json({ message: error });

        const productos = normalizarProductos(data.productos);
        const count = await Product.countDocuments({ _id: { $in: productos } });
        if (count !== productos.length) return res.status(404).json({ message: 'Uno o más productos no existen' });

        await restaurarProductosDePromocion(existing._id);
        existing.nombre = data.nombre.trim();
        existing.descripcion = data.descripcion || '';
        existing.descuentoPorcentaje = Number(data.descuentoPorcentaje);
        existing.fechaInicio = data.fechaInicio || existing.fechaInicio;
        existing.fechaFin = data.fechaFin || null;
        existing.activa = data.activa !== false;
        existing.productos = productos;
        await existing.save();

        if (existing.activa) await aplicarPromocion(existing);
        return res.json({ message: 'Promoción actualizada correctamente', promocion: existing });
    } catch (error) {
        return res.status(400).json({ message: error.message || 'No se pudo actualizar la promoción' });
    }
};

export const deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) return res.status(404).json({ message: 'Promoción no encontrada' });

        await restaurarProductosDePromocion(promotion._id);
        await promotion.deleteOne();
        return res.json({ message: 'Promoción eliminada correctamente' });
    } catch {
        return res.status(400).json({ message: 'Id de promoción inválido' });
    }
};
