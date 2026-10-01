import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    tipo: {
        type: String,
        enum: ['entrada', 'salida'],
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        default: null
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    motivo: {
        type: String,
        default: '',
        trim: true
    },
    costoUnitario: {
        type: Number,
        min: 0,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('InventoryMovement', inventoryMovementSchema);
