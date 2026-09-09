import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['cliente', 'trabajador', 'admin'], default: 'cliente' }
}, {
    timestamps: true
});

export default model('User', userSchema);
