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

export const app = express();
const PORT = process.env.PORT || 4000;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const MONGO_URI = process.env.MONGO_URL;

import Product from './models/products.js';
import initialProducts from './data/products.json' with { type: 'json' };

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
app.get('/api', (req, res) => {
    res.json({
        ok: true,
        mensaje: 'Api de gestor de clientes funciona correctamente'
    });
});

app.get('/api/health', (req, res) => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        ok: true,
        mongoState: mongoose.connection.readyState,
        mongoStateName: states[mongoose.connection.readyState]
    });
});

app.use('/api/clientes', clientesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Ruta de la API no encontrada'
        });
    }
    next();
});

export async function startServer() {
    if (!MONGO_URI) {
        throw new Error('MONGO_URI no está configurado');
    }

    try {
        console.log('Conectando a MongoDB...');

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log('MongoDB conectado');
        await seedProductsDatabaseonStart();

        return app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
}

if (process.argv[1]) {
    const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;
    if (isDirectRun) {
        startServer();
    }
}

async function seedProductsDatabaseonStart() {
    const count = await Product.countDocuments();

    if (count === 0 && Array.isArray(initialProducts) && initialProducts.length > 0) {
        await Product.insertMany(initialProducts);
        console.log('Productos iniciales cargados en el arranque');
    } else {
        console.log('La base de datos ya tiene productos');
    }
}
