import { Router } from 'express';
import {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    checkoutCart
} from '../controllers/cartControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';


const cartRouter = Router();

cartRouter.use(verifyToken);

cartRouter.get('/', getCart);
cartRouter.post('/', addItem);
cartRouter.put('/', updateItem);
cartRouter.delete('/clear', clearCart);
cartRouter.delete('/:itemId', removeItem);
cartRouter.post('/checkout', checkoutCart);

export default cartRouter;
