import 'dotenv/config';
import mongoose from 'mongoose';
import { seedProducts } from './utils/products.util.js';

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    if (!MONGO_URI) {
        console.error('Falta MONGO_URI en el .env');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la base de datos para el seed...');

    const insertados = await seedProducts();
    insertados.forEach((nombre) => console.log(`✔ ${nombre}`));

    console.log('Seed de productos completado.');
    await mongoose.disconnect();
}

run().catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
});
