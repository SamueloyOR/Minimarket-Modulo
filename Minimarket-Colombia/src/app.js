const express = require('express');
const app = express();
const clientesRoutes = require('./routes/clientes.routes');

app.use(express.json());

// Usar las rutas del módulo
app.use('/api', clientesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});