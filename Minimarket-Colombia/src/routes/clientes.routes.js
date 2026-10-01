import { Router } from 'express';
import { 
    obtenerClientes, 
    crearCliente, 
    actualizarCliente, 
    eliminarCliente 
} from "../controllers/clientes.controllers.js";
import puedeGestionarClientes from '../middlewares/workersMIddleware.js';

import verifyToken from "../middlewares/authMiddleware.js"
import soloAdmin from '../middlewares/adminMiddleware.js';

const clientesRouter = Router();

clientesRouter.get('/', verifyToken, puedeGestionarClientes, obtenerClientes);
clientesRouter.post('/', verifyToken, puedeGestionarClientes, crearCliente);
clientesRouter.put('/:id', verifyToken, puedeGestionarClientes, actualizarCliente);
clientesRouter.delete('/:id', verifyToken, soloAdmin, eliminarCliente);

export default clientesRouter;