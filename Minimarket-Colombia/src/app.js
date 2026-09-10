import 'dotenv/config';
import express from 'express';
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import mongoose from "mongoose";

import clientesRoutes from "./routes/clientes.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/auth/login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/auth/signup.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/dashboard/client.html"));
});

app.get("/dashboard/client", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/dashboard/client.html"));
});

app.get("/dashboard/admin", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/dashboard/admin.html"));
});

app.get("/dashboard/worker", (req, res) => {
    res.sendFile(path.join(dirname, "../public/html/dashboard/worker.html"));
});

app.get("/api", (req, res) => {
    res.json({
        ok: true,
        mensaje: "Api de gestor de clientes funciona correctamente"
    });
});

app.use("/api/clientes", clientesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

app.get('/api/products', (req, res) => {
    const products = [
        { id: '1', name: 'Arroz 1kg', price: 4.50 },
        { id: '2', name: 'Aceite 1L', price: 8.00 }
    ];
    res.json(products);
});

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            ok: false,
            mensaje: "Ruta de la API no encontrada"
        });
    }
    next();
});

async function startServer() {
    if (!MONGO_URI) {
        console.error("Error con uel de mongo");
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
        return;
    }

    try {
        console.log("Conectando a la base de datos...");
        await mongoose.connect(MONGO_URI);
        console.log("Conectado a la base de datos");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        process.exit(1);
    }
}

startServer();