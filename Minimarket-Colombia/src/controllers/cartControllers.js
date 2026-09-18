import mongoose from "mongoose";

const catalogoProductos = [
    { id: '1', name: 'Arroz', price: 4000, stock: 20 },
    { id: '2', name: 'Aceite 1L', price: 9000, stock: 10 },
    { id: '3', name: 'Leche', price: 3500, stock: 25 },
    { id: '4', name: 'Pan integral', price: 2800, stock: 15 }
];

const carts = new Map();

const getCartKey = (req) => {
    const userId = req.user.id;
    return `cart:${userId}`;
};

const getCartByUser = (req) => {
    const key = getCartKey(req);
    if (!carts.has(key)) {
        carts.set(key, []);
    }
    return carts.get(key);
};

export const getCart = (req, res) => {
    const items = getCartByUser(req);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
        items,
        total,
        count: items.reduce((sum, item) => sum + item.quantity, 0)
    });
};

export const addItem = (req, res) => {
    try {
        const { id, name, price, quantity = 1 } = req.body;

        if (!id || !name || !price || Number(quantity) <= 0) {
            return res.status(400).json({ message: 'Datos del producto inválidos.' });
        }

        const cart = getCartByUser(req);
        const productIndex = cart.findIndex((item) => item.id === id);

        if (productIndex >= 0) {
            cart[productIndex].quantity += Number(quantity);
        } else {
            cart.push({ id, name, price: Number(price), quantity: Number(quantity) });
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        return res.status(201).json({
            message: 'Producto agregado al carrito.',
            items: cart,
            total,
            count: cart.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al agregar producto al carrito.' });
    }
};

export const updateItem = (req, res) => {
    const { id, quantity } = req.body;

    if (!id || !quantity || Number(quantity) <= 0) {
        return res.status(400).json({ message: 'El id y la cantidad son obligatorios.' });
    }

    const cart = getCartByUser(req);
    const item = cart.find((product) => product.id === id);

    if (!item) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    item.quantity = Number(quantity);
    const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

    return res.json({
        message: 'Cantidad actualizada.',
        items: cart,
        total,
        count: cart.reduce((sum, product) => sum + product.quantity, 0)
    });
};

export const removeItem = (req, res) => {
    const { itemId } = req.params;
    const cart = getCartByUser(req);
    const filtered = cart.filter((item) => item.id !== itemId);

    if (filtered.length === cart.length) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    carts.set(getCartKey(req), filtered);
    const total = filtered.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
        message: 'Producto eliminado del carrito.',
        items: filtered,
        total,
        count: filtered.reduce((sum, item) => sum + item.quantity, 0)
    });
};

export const clearCart = (req, res) => {
    const key = getCartKey(req);
    carts.set(key, []);

    return res.json({
        message: 'Carrito vaciado.',
        items: [],
        total: 0,
        count: 0
    });
};


export const checkoutCart = async (req, res) => {
    const { items } = req.body;
    const cart = Array.isArray(items) && items.length ? items : getCartByUser(req);

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'El carrito está vacío o formato inválido.' });
    }
    const session = await mongoose.startSession();

    try {
        let calculatedTotal = 0;

        await session.withTransaction(async () => {
            for (const item of cart) {
                const product = catalogoProductos.find((p) => p.id === item.id);
                if (!product) {
                    throw new Error(`El producto con ID ${item.id} no existe.`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}.`);
                }

                calculatedTotal += product.price * item.quantity;
            }

            carts.set(getCartKey(req), []);
        });

        return res.status(200).json({
            message: 'Compra procesada correctamente',
            totalMonto: calculatedTotal,
            items: cart
        });

    } catch (error) {
        return res.status(400).json({ message: error.message || 'Error al procesar la compra.' });
    } finally {
        await session.endSession();
    }
};
