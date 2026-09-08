import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from"jsonwebtoken";

//Registrar un nuevo usuario

export const register = async (req, res) => {
    try{
        const { nombre, correo, password, rol } = req.body;

        //verificar si el usuario existe

        const existinUser = await User.findOne({ correo });
        if(existinUser){
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        //constraseña

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creacion del usuario

        const newUser = new User({
            nombre,
            correo,
            password: hashedPassword,
            rol
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//Inicio de sesion

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        //Buscar usuario por correo

        const user = await User.findOne({ correo });
        if (!user) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        //Validar contraseña

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        //token
        const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error interno del servidor" });

    }
};
