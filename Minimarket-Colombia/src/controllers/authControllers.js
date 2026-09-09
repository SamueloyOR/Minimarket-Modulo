import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "minimarket-secret-2026";

export const register = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
        }

        const existingUser = await User.findOne({ correo: correo.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            password: hashedPassword,
            rol: rol || "cliente"
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

        if (!correo || !password) {
            return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
        }

        const user = await User.findOne({ correo: correo.trim().toLowerCase() });
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
