import { Router } from 'express';
import { register, login } from '../controllers/authControllers.js';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

export default router;