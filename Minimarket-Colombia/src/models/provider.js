import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
    timestamps: true
});

export default mongoose.model('Provider', providerSchema);
