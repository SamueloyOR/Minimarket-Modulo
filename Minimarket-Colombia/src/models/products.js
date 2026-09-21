import mongoose, { Schema, model } from 'mongoose';

//esquema de los productos
const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    },
    precioRegular: { type: Number, required: true },
    precioOferta: { type: Number, default: null }, // Si es null, no está en oferta
    enOferta: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 0 },
    imagenUrl: { type: String },
    activo: { type: Boolean, default: true },
    },
{
    timestamps: true,
});

export const Product = mongoose.model("Product", productSchema)

