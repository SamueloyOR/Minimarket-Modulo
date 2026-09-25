import mongoose, { Schema, model } from 'mongoose';

export const CATEGORIAS_VALIDAS = [
    'Frutas y verduras',
    'Lácteos',
    'Aseo y hogar',
    'Snacks'
];

const productSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    categoria: {
        type: String,
        required: true,
        trim: true
    },
    precio: { type: Number, required: true, min: 0 },
    precioRegular: { type: Number, default: 0, min: 0 },
    precioOferta: { type: Number, default: null, min: 0 },
    enOferta: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imagen: { type: String, default: '' },
    imagenUrl: { type: String, default: '' },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Product = model('Product', productSchema);

export { Product };
export default Product;

