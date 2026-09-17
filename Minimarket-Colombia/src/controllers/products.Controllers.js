import Product from "../models/products.js";

// Get obtener productos
export const getProducts = async (req, res) => {
    try {
        const { categoria, oferta, buscar } = req.query;
        const filtro = {};

        if (categoria) filtro.categoria = categoria;
        if (oferta === "true") filtro.enOferta = true;
        if (buscar) filtro.nombre = { $regex: buscar, $options: "i" };

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
        const { nombre, descripcion, precio, stock, categoria, imagen, enOferta, precioOferta } = req.body;

        if (!nombre || precio === undefined || !categoria) {
            return res.status(400).json({ message: "nombre, precio y categoria son obligatorios" });
        }

        const nuevo = await Product.create({
            nombre, descripcion, precio, stock, categoria, imagen, enOferta, precioOferta
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
        const producto = await Product.findByIdAndUpdate(req.params.id, req.body, {
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
