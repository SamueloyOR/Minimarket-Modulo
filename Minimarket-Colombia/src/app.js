import 'dotenv/config';
import express from 'express';
import cors from "cors";
import morgan from "morgan";
import path from "node:path"
import {fileURLToPath} from 'node:url';
import mongoose from "mongoose";


import clientesRoutes from "./routes/clientes.routes.js";
import authRoutes from "./routes/authRouters.js";

const app = express();
const PORT = process.env.PORT || 4000;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://samuelosro23:rosemeri123@minimarket101.hshogla.mongodb.net/";

//Midlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//archivos 
app.use(express.static("../public"));

//rutas de paginhas

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
    res.sendFile(path.join(dirname, "../public/html/dashboard.html"));
});
app.get("/api", (req, res) => {
    res.json({
        ok: true,
        mensaje: "Api de gestor de clientes funciona correctamente"
    });
});

app.use("/api/clientes", clientesRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            ok: false,
            mensaje: "Ruta de la API no encontrada"
        });
    }
    next();
});

//conexion con mongo
console.log("Conectando a la base de datos..."), process.env.MONGO_URI;
mongoose.connect("mongodb+srv://samuelosro23:rosemeri123@minimarket101.hshogla.mongodb.net/")
    .then(() => console.log("Conectado a la base de datos"))
    .catch((err) => console.error("Error al conectar a la base de datos:", err));


app.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto 4000")
})