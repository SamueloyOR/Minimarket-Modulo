import { Router } from 'express';
import { register, login } from '../controllers/authControllers.js';

const authRouter = Router();

// Ruta para registrar usuario
authRouter.post('/register', register);

// Ruta iniciar sesión
authRouter.post('/login', login);

export default authRouter;
