import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado");
}

export const register = async (req, res) => {
    try {
        const { nombre, correo, password, documento, telefono } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
        }

        if (
            typeof nombre !== "string" ||
            typeof correo !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Datos de registro inválidos"
            });
        }

        if (!nombre.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" });
        }
        const correoNormalizado = correo.trim().toLowerCase();
        const documentoNormalizado = typeof documento === "string" ? documento.trim() : "";
        const telefonoNormalizado = typeof telefono === "string" ? telefono.trim() : "";

        if (!EMAIL_PATTERN.test(correoNormalizado)) {
            return res.status(400).json({ message: "El correo no tiene un formato válido" });
        }

        if (!/^\d{6,15}$/.test(documentoNormalizado)) {
            return res.status(400).json({ message: "El documento debe contener entre 6 y 15 dígitos" });
        }

        if (telefonoNormalizado && !/^\+?[0-9 ]{7,20}$/.test(telefonoNormalizado)) {
            return res.status(400).json({ message: "El teléfono no tiene un formato válido" });
        }
        if (password.length < 8) {
            return res.status(400).json({
                message: "La contraseña debe contener al menos 8 caracteres"
            });
        }

        const existingUser = await User.findOne({ $or: [{ correo: correoNormalizado }, { documento: documentoNormalizado }] });
        if (existingUser) {
            return res.status(400).json({ message: "El correo o documento ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            documento: documentoNormalizado,
            telefono: telefonoNormalizado,
            password: hashedPassword,
            rol: "cliente"
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (typeof correo !== "string" || typeof password !== "string" || !correo.trim() || !password) {
            return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        if (!EMAIL_PATTERN.test(correoNormalizado)) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = await User.findOne({ correo: correoNormalizado });
        if (!user) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign({ id: user._id, rol: user.rol }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user._id, nombre: user.nombre, correo: user.correo, rol: user.rol } });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

