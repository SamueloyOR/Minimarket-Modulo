import { Router } from 'express';
import {
    getInventoryMovements,
    getInventoryAlerts,
    registrarEntrada,
    registrarSalida
} from '../controllers/inventoryControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import puedeGestionarClientes from '../middlewares/workersMIddleware.js';

const router = Router();
router.use(verifyToken, puedeGestionarClientes);

router.get('/', getInventoryMovements);
router.get('/alerts', getInventoryAlerts);
router.post('/entry', registrarEntrada);
router.post('/exit', registrarSalida);

export default router;
