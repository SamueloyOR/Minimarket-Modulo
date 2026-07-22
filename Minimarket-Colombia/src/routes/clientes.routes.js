import { Router } from 'express';
import { 
    obtenerClientes, 
    crearCliente, 
    actualizarCliente, 
    eliminarCliente 
} from "../controllers/clientes.controllers.js";

const router = Router();

router.get('/clientes', obtenerClientes);
router.post('/clientes', crearCliente);
router.put('/clientes/:id', actualizarCliente);
router.delete('/clientes/:id', eliminarCliente);

export default router;