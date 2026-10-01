import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '', trim: true },
    descuentoPorcentaje: { type: Number, required: true, min: 0, max: 100 },
    fechaInicio: { type: Date, default: Date.now },
    fechaFin: { type: Date, default: null },
    activa: { type: Boolean, default: true },
    productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model('Promotion', promotionSchema);
