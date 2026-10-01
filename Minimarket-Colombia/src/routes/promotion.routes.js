import { Router } from 'express';
import {
    getPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion
} from '../controllers/promotionControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import soloAdmin from '../middlewares/adminMiddleware.js';

const router = Router();

router.get('/', getPromotions);
router.get('/:id', getPromotionById);
router.post('/', verifyToken, soloAdmin, createPromotion);
router.put('/:id', verifyToken, soloAdmin, updatePromotion);
router.delete('/:id', verifyToken, soloAdmin, deletePromotion);

export default router;
