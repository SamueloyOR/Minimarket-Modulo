import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Forzar la carga del .env apuntando a la raíz del proyecto
dotenv.config();

// O si prefieres asegurar los datos de manera directa para evitar fallos de lectura del .env:
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'minimarket_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Base de datos conectada correctamente.");
export default pool;