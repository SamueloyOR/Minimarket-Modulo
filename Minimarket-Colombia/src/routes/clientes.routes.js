import { Router } from 'express';
import { 
    obtenerClientes, 
    crearCliente, 
    actualizarCliente, 
    eliminarCliente 
} from "../controllers/clientes.controllers.js";

const clientesRouter = Router();

clientesRouter.get('/', obtenerClientes);
clientesRouter.post('/', crearCliente);
clientesRouter.put('/:id', actualizarCliente);
clientesRouter.delete('/:id', eliminarCliente);

export default clientesRouter;