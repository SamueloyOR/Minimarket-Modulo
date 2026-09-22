import mongoose, { Schema, model } from 'mongoose';

const categorySchema = new Schema({
    nombre: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    descripcion: { type: String, default: '' }
}, { timestamps: true });

const Category = model('Category', categorySchema);

export default Category;
