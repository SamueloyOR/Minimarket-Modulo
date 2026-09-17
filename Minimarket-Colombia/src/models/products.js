import { Schema, model } from 'mongoose';

const categories = ['Frutas y verduras', 'Lácteos', 'Aseo y hogar', 'Snacks'];

const productSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    categoria: { type: String, required: true, enum: categories },
    imagen: { type: String, trim: true },
    enOferta: { type: Boolean, default: false },
    precioOferta: { type: Number, min: 0 }
}, {
    timestamps: true
});

export const CATEGORIAS_VALIDAS = categories;
export default model('Product', productSchema);
