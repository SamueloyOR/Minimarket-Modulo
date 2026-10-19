//impoarta las dependencias
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import mongoose from 'mongoose';

import clientesRoutes from './routes/clientes.routes.js';
import authRoutes from './routes/auth.routes.js';
import cartRoutes from './routes/cart.routes.js';
import productsRouter from './routes/products.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import usersRoutes from './routes/users.routes.js';
import providersRoutes from './routes/providers.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import promotionRoutes from './routes/promotion.routes.js';
import { seedProducts } from './products.js';

export const app = express();
const PORT = process.env.PORT || 4000;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/auth/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/auth/signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/dashboard/client.html'));
});

app.get('/dashboard/client', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/dashboard/client.html'));
});

app.get('/dashboard/admin', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/dashboard/admin.html'));
});

app.get('/dashboard/worker', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/dashboard/worker.html'));
});

app.get('/manager/users.html', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/manager/users.html'));
});

app.get('/pages/shopping_cart.html', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/shopping_cart.html'))
})
app.get('/orders', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/orders.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/profile.html'));
});

app.get('/inventory', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/manager/inventory.html'));
});

app.get('/promotions', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/manager/promotions.html'));
});

app.get('/aboutUS', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/aboutUs.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/contac.html'));
});

app.get('/terminos', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/termsconditions.html'));
});

app.get('/termino', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/termsconditions.html'));
});

app.get('/cookies', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/cookies.html'));
});

app.get('/privacidad', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/privacy.html'));
});

app.get('/payment-methods', (req, res) => {
    res.sendFile(path.join(dirname, '../public/html/pages/payment-methods.html'));
});

//Agregar los endspoints del proyecto
//Metodo get para obtener la api del proyecto
app.get('/api', (req, res) => {
    res.json({
        ok: true,
        mensaje: 'La api funciona correctamente'
    });
});

//metodo get para obtener, si la base de datos funciona
//Se crea la variable de estados para establecer si hay un error y marcar en la consola posibles errores
app.get('/api/health', (req, res) => {
    const estados = {
        0: 'desconectado',
        1: 'conectado',
        2: 'conectando',
        3: 'desconectando'
    };
//envia un en formato json el estado actual del mongo
    res.json({
        ok: true,
        mongoState: mongoose.connection.readyState,
        mongoStateName: estados[mongoose.connection.readyState]
    });
});

//Establecer las rutas de cada modulo del proyecto

app.use('/api/clientes', clientesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/promotions', promotionRoutes);

//Si al consultar una ruta esta no existe hay un condicional para validar si no existe o no
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Ruta de la API no encontrada'
        });
    }
    next();
});

// Manejador global de errores: siempre responde JSON
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const mensajes = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: mensajes.join(', ') });
    }
    if (err.code === 11000) {
        const campo = Object.keys(err.keyValue || {})[0] || 'valor';
        return res.status(409).json({ message: `Ya existe un registro con ese ${campo}` });
    }
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
});

//Variable para validar si el server de mongo funciona correctamente
export async function startServer() {

    //Si la variable de la url es diferente tire un error
    if (!MONGO_URL) {
        throw new Error('Hubo un error en la url del mongo, no está configurado');
    }

    //intentar si la base de datos funciona sin un error
    try {
        console.log('Conectando con la base de datos MONGODB');

        await mongoose.connect(MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        console.log('Mongo conectado');
        await seedProducts();

        return app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    //capturar el error y mostrar en consola y salir del proceso
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
}
//apartir de este condicional llamo a startServer() al ejecutar el node src/app.js para q el servidor arranque
if (process.argv[1]) {
    const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;
    if (isDirectRun) {
        startServer();
    }
}

