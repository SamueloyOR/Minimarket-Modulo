import { Router } from 'express';
import { 
    obtenerClientes, 
    crearCliente, 
    actualizarCliente, 
    eliminarCliente 
} from "../controllers/clientes.controllers.js";

import verifyToken from "../middlewares/authMiddleware.js"
import soloAdmin from '../middlewares/adminMiddleware.js';

const clientesRouter = Router();

clientesRouter.get('/', verifyToken, obtenerClientes);
clientesRouter.post('/', verifyToken, crearCliente);
clientesRouter.put('/:id', verifyToken, actualizarCliente);
clientesRouter.delete('/:id', verifyToken, soloAdmin, eliminarCliente);

export default clientesRouter;