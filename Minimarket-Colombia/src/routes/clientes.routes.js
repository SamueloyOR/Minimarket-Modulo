import { Router } from 'express';
import { 
    obtenerClientes, 
    crearCliente, 
    actualizarCliente, 
    eliminarCliente 
} from "../controllers/clientes.controllers.js";

const router = Router();

router.get('/', obtenerClientes);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

export default router;