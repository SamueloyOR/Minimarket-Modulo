import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, default: 'cliente' }
}, {
    timestamps: true
});

export default model('User', userSchema);
