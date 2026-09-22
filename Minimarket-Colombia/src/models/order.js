import mongoose, { model, Schema } from 'mongoose';

const orderSchema = new Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            cantidad: { type: Number, required: true, min: 1 },
            precioUnitario: { type: Number, required: true, min: 0 }
        }
    ],
    total: { type: Number, required: true, min: 0 },
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'completado', 'cancelado'],
        default: 'pendiente'
    },
    direccionEnvio: {
        calle: { type: String, required: true },
        ciudad: { type: String, required: true },
        detalles: { type: String }
    },
    metodosPago: { type: String, required: true, enum: ['tarjeta', 'efectivo', 'transferencia'] }
}, { timestamps: true });

const Order = model('Order', orderSchema);

export default Order;

