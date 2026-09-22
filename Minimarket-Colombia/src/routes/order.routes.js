import { Router } from 'express';
import {
    obtenerOrdenes,
    obtenerOrdenesUsuario,
    obtenerTodasOrdenes,
    actualizarEstadoOrden,
    eliminarOrden
} from '../controllers/orderControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import soloAdmin from '../middlewares/adminMiddleware.js';
import puedeGestionarCLientes from '../middlewares/workersMIddleware.js';

const router = Router();

router.post('/', verifyToken, obtenerOrdenes);
router.get('/user', verifyToken, obtenerOrdenesUsuario);
router.get('/', verifyToken, soloAdmin, puedeGestionarCLientes, obtenerTodasOrdenes);
router.put('/:id', verifyToken, soloAdmin, puedeGestionarCLientes, actualizarEstadoOrden);
router.delete('/:id', verifyToken, soloAdmin, eliminarOrden);

export default router;