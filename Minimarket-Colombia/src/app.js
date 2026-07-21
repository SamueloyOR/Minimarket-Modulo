import "dotenv/config"
import express from 'express';
import clientesRoutes from './routes/clientes.routes.js';


const app = express();
app.use(express.json());

// Usar las rutas del módulo
app.use('/api', clientesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});