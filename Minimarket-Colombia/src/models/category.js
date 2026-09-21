import { Schema, model } from "mongoose";

const categorySchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    descripcion: { type: String, default: '' }
});

export const Category = model("Category", categorySchema);