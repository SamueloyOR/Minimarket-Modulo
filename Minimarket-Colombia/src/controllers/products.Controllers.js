import Product from "../models/products.js";
import { CATEGORIAS_VALIDAS } from "../models/products.js";

const CAMPOS_PRODUCTO = [
    "nombre",
    "descripcion",
    "precio",
    "stock",
    "categoria",
    "imagen",
    "enOferta",
    "precioOferta"
];

function obtenerCamposProducto(body) {
    return Object.fromEntries(
        Object.entries(body ?? {}).filter(([campo]) => CAMPOS_PRODUCTO.includes(campo))
    );
}

function esIdMongooseValido(id) {
    return /^[a-f\d]{24}$/i.test(id);
}

function escaparRegex(valor) {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get obtener productos
export const getProducts = async (req, res) => {
    try {
        const { categoria, oferta, buscar } = req.query;
        const filtro = {};

        if (categoria) filtro.categoria = categoria;
        if (oferta === "true" || oferta === "false") filtro.enOferta = oferta === "true";
        if (buscar?.trim()) filtro.nombre = { $regex: escaparRegex(buscar.trim()), $options: "i" };

        const productos = await Product.find(filtro).sort({ nombre: 1 });
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET por id
export const getProductById = async (req, res) => {
    try {
        if (!esIdMongooseValido(req.params.id)) {
            return res.status(400).json({ message: "Id de producto inválido" });
        }

        const producto = await Product.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST crear productos
export const createProduct = async (req, res) => {
    try {
        const producto = obtenerCamposProducto(req.body);
        const { nombre, precio, categoria } = producto;

        if (typeof nombre !== "string" || !nombre.trim() || precio === undefined || !categoria) {
            return res.status(400).json({ message: "nombre, precio y categoria son obligatorios" });
        }

        const precioNumero = Number(precio);
        const stockNumero = producto.stock === undefined ? 0 : Number(producto.stock);

        if (
            !Number.isFinite(precioNumero) ||
            precioNumero < 0 ||
            !Number.isInteger(stockNumero) ||
            stockNumero < 0 ||
            !CATEGORIAS_VALIDAS.includes(categoria)
        ) {
            return res.status(400).json({ message: "Datos de producto inválidos" });
        }

        const nuevo = await Product.create({
            ...producto,
            nombre: nombre.trim(),
            precio: precioNumero,
            stock: stockNumero
        });

        res.status(201).json(nuevo);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(400).json({ message: error.message || "No se pudo crear el producto" });
    }
};

// PUT actualizar productos
export const updateProduct = async (req, res) => {
    try {
        if (!esIdMongooseValido(req.params.id)) {
            return res.status(400).json({ message: "Id de producto inválido" });
        }

        const cambios = obtenerCamposProducto(req.body);
        if (Object.keys(cambios).length === 0) {
            return res.status(400).json({ message: "No hay campos válidos para actualizar" });
        }

        if (cambios.nombre !== undefined && (typeof cambios.nombre !== "string" || !cambios.nombre.trim())) {
            return res.status(400).json({ message: "El nombre del producto es obligatorio" });
        }

        if (cambios.precio !== undefined) cambios.precio = Number(cambios.precio);
        if (cambios.stock !== undefined) cambios.stock = Number(cambios.stock);

        if (
            (cambios.precio !== undefined && (!Number.isFinite(cambios.precio) || cambios.precio < 0)) ||
            (cambios.stock !== undefined && (!Number.isInteger(cambios.stock) || cambios.stock < 0)) ||
            (cambios.categoria !== undefined && !CATEGORIAS_VALIDAS.includes(cambios.categoria))
        ) {
            return res.status(400).json({ message: "Datos de producto inválidos" });
        }

        const producto = await Product.findByIdAndUpdate(req.params.id, cambios, {
            new: true,
            runValidators: true
        });

        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(producto);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(400).json({ message: error.message || "No se pudo actualizar el producto" });
    }
};

// DELETE eliminar productos
export const deleteProduct = async (req, res) => {
    try {
        if (!esIdMongooseValido(req.params.id)) {
            return res.status(400).json({ message: "Id de producto inválido" });
        }

        const producto = await Product.findByIdAndDelete(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
