import { Router } from 'express';
import {
    getProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderPurchaseHistory
} from '../controllers/providersControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import puedeGestionarClientes from '../middlewares/workersMIddleware.js';
import soloAdmin from '../middlewares/adminMiddleware.js';

const router = Router();

router.get('/', verifyToken, puedeGestionarClientes, getProviders);
router.get('/:id', verifyToken, puedeGestionarClientes, getProviderById);
router.get('/:id/historial-compras', verifyToken, puedeGestionarClientes, getProviderPurchaseHistory);
router.post('/', verifyToken, puedeGestionarClientes, createProvider);
router.put('/:id', verifyToken, puedeGestionarClientes, updateProvider);
router.delete('/:id', verifyToken, soloAdmin, deleteProvider);

export default router;
