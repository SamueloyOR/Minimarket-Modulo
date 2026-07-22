import "dotenv/config"
import express from 'express';
import cors from "cors";
import morgan from "morgan";
import path from "node:path"
import {fileURLToPath} from 'node:url';

import clientesRoutes from "./routes/clientes.routes.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(dirname, "../public")));


app.get("/api", (req, res) => {
    res.json({
        ok: true,
        mensaje: "Api de gestor de clientes funciona correctamente"
    });
});

app.use("/api/clientes", clientesRoutes);


app.get("/api/*", (req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: "Ruta no encontrada"
    });
})

app.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto 3000")
})