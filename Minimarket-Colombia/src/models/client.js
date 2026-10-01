import { Schema, model } from "mongoose";

const clientSchema = new Schema(
    {
        nombres: {
            type: String,
            required: true,
            trim: true
        },
        apellidos: {
            type: String,
            required: true,
            trim: true
        },
        documento: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        telefono: {
            type: String,
            trim: true
        },
        correo: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

export default model("Client", clientSchema);