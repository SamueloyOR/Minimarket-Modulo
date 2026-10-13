import mongoose from 'mongoose';
import Product from '../models/products.js';
import Category from '../models/category.js';

// enOferta, precioOferta y promocion se gestionan solo desde el modulo de promociones
const PRODUCT_FIELDS = [
    'nombre', 'descripcion', 'sku', 'categoria', 'precio', 'precioRegular',
    'stock', 'imagen', 'imagenUrl', 'proveedores', 'activo'
];

const productFieldsFrom = (body = {}) => {
    const data = Object.fromEntries(
        Object.entries(body).filter(([field]) => PRODUCT_FIELDS.includes(field))
    );
    // Un SKU vacio chocaria con el indice unico: se descarta
    if (typeof data.sku === 'string' && !data.sku.trim()) delete data.sku;
    return data;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const categoryExists = (nombre) =>
    Category.exists({ nombre: new RegExp(`^${escapeRegex(nombre)}$`, 'i') });

const validPrice = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;

export const getProducts = async (req, res, next) => {
    try {
        const { categoria, buscar, oferta, minPrecio, maxPrecio } = req.query;
        const filter = { activo: true };

        if (categoria) filter.categoria = categoria;
        if (oferta === 'true' || oferta === 'false') filter.enOferta = oferta === 'true';
        if (buscar?.trim()) filter.$text = { $search: buscar.trim() };

        if (minPrecio !== undefined || maxPrecio !== undefined) {
            filter.precio = {};
            if (minPrecio !== undefined) {
                if (!validPrice(minPrecio)) return res.status(400).json({ message: 'Precio mínimo inválido' });
                filter.precio.$gte = Number(minPrecio);
            }
            if (maxPrecio !== undefined) {
                if (!validPrice(maxPrecio)) return res.status(400).json({ message: 'Precio máximo inválido' });
                filter.precio.$lte = Number(maxPrecio);
            }
            if (filter.precio.$gte !== undefined && filter.precio.$lte !== undefined && filter.precio.$gte > filter.precio.$lte) {
                return res.status(400).json({ message: 'El precio mínimo no puede superar el máximo' });
            }
        }

        const products = await Product.find(filter).sort({ nombre: 1 });
        return res.json(products);
    } catch (error) {
        return next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Id de producto inválido' });
        }

        const product = await Product.findOne({ _id: req.params.id, activo: true });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        return res.json(product);
    } catch (error) {
        return next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const data = productFieldsFrom(req.body);
        const { nombre, categoria, precio } = data;
        const stock = data.stock === undefined ? 0 : Number(data.stock);

        if (typeof nombre !== 'string' || !nombre.trim() || typeof categoria !== 'string' || !categoria.trim() || precio === undefined || precio === '') {
            return res.status(400).json({ message: 'Nombre, categoría y precio son obligatorios' });
        }
        if (!validPrice(precio) || !Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({ message: 'Precio o stock inválidos' });
        }
        if (!(await categoryExists(categoria.trim()))) {
            return res.status(400).json({ message: 'La categoría no existe' });
        }

        const price = Number(precio);
        const product = await Product.create({
            ...data,
            nombre: nombre.trim(),
            categoria: categoria.trim(),
            precio: price,
            precioRegular: data.precioRegular === undefined ? price : Number(data.precioRegular),
            stock
        });
        return res.status(201).json(product);
    } catch (error) {
        return next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Id de producto inválido' });
        }

        const changes = productFieldsFrom(req.body);
        if (!Object.keys(changes).length) {
            return res.status(400).json({ message: 'No hay campos válidos para actualizar' });
        }
        if (changes.nombre !== undefined) {
            if (typeof changes.nombre !== 'string' || !changes.nombre.trim()) {
                return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
            }
            changes.nombre = changes.nombre.trim();
        }
        if (changes.categoria !== undefined) {
            if (typeof changes.categoria !== 'string' || !changes.categoria.trim()) {
                return res.status(400).json({ message: 'La categoría es obligatoria' });
            }
            changes.categoria = changes.categoria.trim();
            if (!(await categoryExists(changes.categoria))) {
                return res.status(400).json({ message: 'La categoría no existe' });
            }
        }

        for (const field of ['precio', 'precioRegular']) {
            if (changes[field] !== undefined && changes[field] !== null) {
                if (!validPrice(changes[field])) return res.status(400).json({ message: 'Precio inválido' });
                changes[field] = Number(changes[field]);
            }
        }
        if (changes.stock !== undefined) {
            changes.stock = Number(changes.stock);
            if (!Number.isInteger(changes.stock) || changes.stock < 0) {
                return res.status(400).json({ message: 'Stock inválido' });
            }
        }

        const product = await Product.findByIdAndUpdate(req.params.id, changes, {
            returnDocument: 'after',
            runValidators: true
        });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        return res.json(product);
    } catch (error) {
        return next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Id de producto inválido' });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, { activo: false }, {
            returnDocument: 'after',
            runValidators: true
        });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        return res.json({ message: 'Producto removido' });
    } catch (error) {
        return next(error);
    }
};
