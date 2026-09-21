import mongoose from "mongoose";
import Product from "../models/products.js"
import { CATEGORIAS_VALIDAS } from "../models/products.js";

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

    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0)
});

const esIdMongoValido = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

export const getCart = (req, res) => {
    const items = getCartByUser(req);
    return res.json(calcularResumen(items));
};

export const addItem = async (req, res) => {
    try {
        const {productId, quantity = 1} = req.body;
        const cantidad = NUmber(quantity)

        if (!productId  || !esIdMongoValido(productId) || !Number.isFinite(cantidad) || cantidad <= 0) {
            return res.status(400).json({ message: 'Datos del producto inválidos.' });
        }

        const producto = await Product.findById(productId);
        if (!producto){
            return res.status(404).json({message: 'El producto no existe'});
        };

        const cart = getCartByUser(req);
        const existente = cart.find((item) => item.id === String(producto._id));
        const cantidadDeseada = (existente?.quantity || 0) + cantidad;

        if (producto.stock < cantidadDeseada) {
            return res.status(400).json({ message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`})
        };

        const precioUnitario = producto.endOferta && producto.precioOferta ? producto.precioOferta : producto.precio;

        if(existente){
            existente.quantity = cantidadDeseada;
        }else{
            cart.push({
                id: String(producto._id),
                name: producto.nombre,
                price: precioUnitario,
                image: producto.imagen || "",
                quantity: cantidad
            })
        }

        return res.status(201).json({
            message: "producto agregado al carrito",
            ...calcularResumen(cart)
        });
    } catch (error) {
        console.error("Erroe al agregar al carrito:", error)
        return res.status(500).json({message: "Error al agregar producto al carrito"})
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
    return res.json({message:"Cantidad actualziada.", ...calcularResumen(cart)});

};

export const removeItem = (req, res) => {
    const { itemId } = req.params;
    const cart = getCartByUser(req);
    const filtered = cart.filter((item) => item.id !== itemId);

    if (filtered.length === cart.length) {
        return res.status(404).json({ message: "Producto no encontrado en el carrito." });
    }

    carts.set(getCartKey(req), filtered);
    return res.json({ message: "Producto eliminado del carrito.", ...calcularResumen(filtered) });
};


export const clearCart = (req, res) => {
    carts.set(getCartKey(req), []);
    return res.json({message: "Carrito vaciado.", items: [], total: 0, count: 0});
};


export const checkoutCart = async (req, res) => {

    const cart = getCartByUser(req);

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'El carrito está vacío o formato inválido.' });
    }

    const session = await mongoose.startSession();

    try {
        let calculatedTotal = 0;

        await session.withTransaction(async () => {
            for (const item of cart) {
                const producto = catalogoProductos.find((item.id).session(session));

                if (!producto) {
                    throw new Error(`El producto ${item.name} no esta disponible.`);
                }

                if (producto.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
                }

                const precioUnitario = precio.endOferta && producto.precioOferta ? producto.precioOferta : producto.precio;
                totalMonto += precioUnitario * item.quantity;

                product.stock -= item.quantity;
                await producto.save({ session})
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

