import {Router} from "express";
import {
    obtenerOrdenes,
    obtenerOrdenesUsuario,
    obtenerTodasOrdenes,
    actualizarEstadoOrden,
    eliminarOrden} from "../controllers/orderControllers.js";

const authMiddleware = require("../middlewares/authMiddleware.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const workerMiddleware = require("../middlewares/workerMiddleware.js");

const router = Router();

// Rutas para clientes

router.post("/", authMiddleware, obtenerOrdenes);
router.get("/user", authMiddleware, obtenerOrdenesUsuario);

// Rutas para administradores y trabajadores

router.get("/", authMiddleware, adminMiddleware, workerMiddleware, obtenerTodasOrdenes);
router.put("/:id", authMiddleware, adminMiddleware, workerMiddleware, actualizarEstadoOrden);
router.delete("/:id", authMiddleware, adminMiddleware, workerMiddleware, eliminarOrden);

export default router;