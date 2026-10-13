import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    descripcion: { type: String, trim: true, default: '' },
    sku: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
    categoria: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    precioRegular: { type: Number, default: null, min: 0 },
    precioOferta: { type: Number, default: null, min: 0 },
    enOferta: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imagen: { type: String, default: '' },
    imagenUrl: { type: String, default: '' },
    proveedores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
    promocion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ nombre: 'text', descripcion: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export { Product };
export default Product;
