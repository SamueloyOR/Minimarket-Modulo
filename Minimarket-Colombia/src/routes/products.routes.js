import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/products.Controllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import soloAdmin from '../middlewares/adminMiddleware.js';

const productsRouter = Router();

//lectura si ven sin inicaiar sesion
productsRouter.get('/', getProducts);
productsRouter.get('/:id', getProductById);

// escritura solo para admins logueados
productsRouter.post('/', verifyToken, soloAdmin, createProduct);
productsRouter.put('/:id', verifyToken, soloAdmin, updateProduct);
productsRouter.delete('/:id', verifyToken, soloAdmin, deleteProduct);

export default productsRouter;