import bcrypt from 'bcryptjs';
import User from '../models/users.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => ({
    id: user._id,
    nombre: user.nombre,
    correo: user.correo,
    documento: user.documento,
    telefono: user.telefono,
    rol: user.rol,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ nombre: 1 });
        res.json(users.map(sanitizeUser));
    } catch (error) {
        res.status(500).json({ message: 'Error al listar usuarios', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json(sanitizeUser(user.toObject ? user.toObject() : user));
    } catch (error) {
        return res.status(400).json({ message: 'Id de usuario inválido' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { nombre, correo, password, documento, telefono, rol } = req.body;

        if (!nombre || !correo || !password || !documento) {
            return res.status(400).json({ message: 'Nombre, correo, contraseña y documento son obligatorios' });
        }

        if (typeof nombre !== 'string' || typeof correo !== 'string' || typeof password !== 'string' || typeof documento !== 'string') {
            return res.status(400).json({ message: 'Datos de usuario inválidos' });
        }

        if (!EMAIL_PATTERN.test(correo.trim().toLowerCase())) {
            return res.status(400).json({ message: 'El correo no tiene un formato válido' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        const normalized = {
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            documento: documento.trim(),
            telefono: telefono ? telefono.trim() : '',
            rol: ['cliente', 'trabajador', 'admin'].includes(rol) ? rol : 'cliente'
        };

        const existing = await User.findOne({ $or: [{ correo: normalized.correo }, { documento: normalized.documento }] });
        if (existing) {
            return res.status(400).json({ message: 'Ya existe un usuario con ese correo o documento' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            ...normalized,
            password: hashedPassword
        });

        await user.save();

        const userData = await User.findById(user._id).select('-password');
        return res.status(201).json({ message: 'Usuario creado con éxito', user: sanitizeUser(userData.toObject ? userData.toObject() : userData) });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { nombre, correo, documento, telefono, rol } = req.body;
        const updates = {};

        if (nombre !== undefined) {
            if (typeof nombre !== 'string' || !nombre.trim()) {
                return res.status(400).json({ message: 'El nombre es obligatorio' });
            }
            updates.nombre = nombre.trim();
        }

        if (correo !== undefined) {
            if (typeof correo !== 'string' || !EMAIL_PATTERN.test(correo.trim().toLowerCase())) {
                return res.status(400).json({ message: 'El correo no tiene un formato válido' });
            }
            updates.correo = correo.trim().toLowerCase();
        }

        if (documento !== undefined) {
            if (typeof documento !== 'string' || !documento.trim()) {
                return res.status(400).json({ message: 'El documento es obligatorio' });
            }
            updates.documento = documento.trim();
        }

        if (telefono !== undefined) {
            updates.telefono = typeof telefono === 'string' ? telefono.trim() : '';
        }

        if (rol !== undefined && ['cliente', 'trabajador', 'admin'].includes(rol)) {
            updates.rol = rol;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No hay campos válidos para actualizar' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json({ message: 'Usuario actualizado', user: sanitizeUser(user.toObject ? user.toObject() : user) });
    } catch (error) {
        return res.status(400).json({ message: error.message || 'No se pudo actualizar el usuario' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        return res.status(400).json({ message: 'Id de usuario inválido' });
    }
};
