import Product from '../models/products.js';
import Order from '../models/order.js';
import mongoose from 'mongoose';

const carts = new Map();

const getCartKey = (req) => `cart:${req.user.id}`;

const getCartByUser = (req) => {
    const key = getCartKey(req);
    if (!carts.has(key)) {
        carts.set(key, []);
    }
    return carts.get(key);
};

const calcularResumen = (items) => ({
    items,
    total: items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    count: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
});

const esIdMongoValido = (id) => /^[a-f\d]{24}$/i.test(String(id || ''));

export const getCart = (req, res) => {
    const items = getCartByUser(req);
    return res.json(calcularResumen(items));
};

export const addItem = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const cantidad = Number(quantity);

        if (!productId || !esIdMongoValido(productId) || !Number.isFinite(cantidad) || cantidad <= 0) {
            return res.status(400).json({ message: 'Datos del producto inválidos.' });
        }

        const producto = await Product.findById(productId);
        if (!producto) {
            return res.status(404).json({ message: 'El producto no existe' });
        }

        const cart = getCartByUser(req);
        const existente = cart.find((item) => item.id === String(producto._id));
        const cantidadDeseada = (existente?.quantity || 0) + cantidad;

        if (producto.stock < cantidadDeseada) {
            return res.status(400).json({
                message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
            });
        }

        const precioUnitario = producto.enOferta && producto.precioOferta ? producto.precioOferta : producto.precio;

        if (existente) {
            existente.quantity = cantidadDeseada;
        } else {
            cart.push({
                id: String(producto._id),
                name: producto.nombre,
                price: precioUnitario,
                image: producto.imagen || producto.imagenUrl || '',
                quantity: cantidad
            });
        }

        return res.status(201).json({
            message: 'Producto agregado al carrito',
            ...calcularResumen(cart)
        });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        return res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
};

export const updateItem = async (req, res) => {
    const { id, quantity } = req.body;
    const cantidad = Number(quantity);

    if (!id || !Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({ message: "El id y una cantidad válida son obligatorios." });
    }

    const cart = getCartByUser(req);
    const item = cart.find((product) => product.id === id);
    if (!item) {
        return res.status(404).json({ message: "Producto no encontrado en el carrito." });
    }

    const producto = await Product.findById(id);
    if (!producto) {
        return res.status(404).json({ message: "El producto ya no existe." });
    }

    if (producto.stock < cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` });
    }

    item.quantity = cantidad;
    item.price = producto.enOferta && producto.precioOferta != null
        ? producto.precioOferta
        : producto.precio;

    return res.json({ message: "Cantidad actualizada.", ...calcularResumen(cart) });
};

export const removeItem = (req, res) => {
    const { itemId } = req.params;
    const cart = getCartByUser(req);
    const filtered = cart.filter((item) => item.id !== itemId);

    if (filtered.length === cart.length) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    carts.set(getCartKey(req), filtered);
    return res.json({ message: 'Producto eliminado del carrito.', ...calcularResumen(filtered) });
};

export const clearCart = (req, res) => {
    carts.set(getCartKey(req), []);
    return res.json({ message: 'Carrito vaciado.', items: [], total: 0, count: 0 });
};

export const checkoutCart = async (req, res) => {
    const cart = getCartByUser(req);
    const { direccionEnvio, metodosPago } = req.body;

    if (!cart.length) {
        return res.status(400).json({ message: "El carrito está vacío." });
    }

    if (!direccionEnvio?.calle || !direccionEnvio?.ciudad || !metodosPago) {
        return res.status(400).json({ message: "La dirección y el método de pago son obligatorios." });
    }

    const session = await mongoose.startSession();
    try {
        let nuevaOrden;

        await session.withTransaction(async () => {
            const orderItems = [];
            let total = 0;

            for (const item of cart) {
                const producto = await Product.findById(item.id).session(session);
                if (!producto) {
                    throw new Error(`El producto ${item.name} no está disponible.`);
                }

                const cantidad = Number(item.quantity);
                if (!Number.isInteger(cantidad) || cantidad < 1 || producto.stock < cantidad) {
                    throw new Error(`Stock insuficiente para ${item.name}. Disponible: ${producto.stock}`);
                }

                const precioUnitario = producto.enOferta && producto.precioOferta != null
                    ? producto.precioOferta
                    : producto.precio;

                const resultado = await Product.updateOne(
                    { _id: producto._id, stock: { $gte: cantidad } },
                    { $inc: { stock: -cantidad } },
                    { session }
                );

                if (resultado.modifiedCount !== 1) {
                    throw new Error(`El stock de ${item.name} cambió. Intenta de nuevo.`);
                };

                orderItems.push({ producto: producto._id, cantidad, precioUnitario });
                total += precioUnitario * cantidad;
            }

            [nuevaOrden] = await Order.create([{
                cliente: req.user.id,
                items: orderItems,
                total,
                direccionEnvio,
                metodosPago
            }], { session });
        });

        carts.set(getCartKey(req), []);
        return res.status(201).json({
            message: "Compra procesada correctamente",
            orden: nuevaOrden
        });
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        return res.status(400).json({ message: error.message || "No se pudo procesar la compra." });
    } finally {
        await session.endSession();
    }
};

