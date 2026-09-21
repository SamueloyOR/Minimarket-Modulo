import {Router} from "express";
import {obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria} from "../controllers/categoryControllers.js";
import {authenticateToken, authorizeAdmin} from "../middlewares/authMiddleware.js";

const router = Router();

//Rutas para categorías

router.get("/", obtenerCategorias);
router.post("/", authenticateToken, authorizeAdmin, crearCategoria);
router.put("/:id", authenticateToken, authorizeAdmin, actualizarCategoria);
router.delete("/:id", authenticateToken, authorizeAdmin, eliminarCategoria);

export default router;