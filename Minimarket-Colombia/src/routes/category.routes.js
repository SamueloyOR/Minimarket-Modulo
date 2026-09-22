import { Router } from 'express';
import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from '../controllers/categoryControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import soloAdmin from '../middlewares/adminMiddleware.js';

const router = Router();

router.get('/', obtenerCategorias);
router.post('/', verifyToken, soloAdmin, crearCategoria);
router.put('/:id', verifyToken, soloAdmin, actualizarCategoria);
router.delete('/:id', verifyToken, soloAdmin, eliminarCategoria);

export default router;