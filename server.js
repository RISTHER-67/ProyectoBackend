const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const path = require('path'); // <-- AÑADIDO para manejar rutas de forma segura

// Cargar Rutas
const authRoute = require('./routes/auth');
const loginRoute = require('./routes/login');
const passwordRoute = require('./routes/password');
const productsRoute = require('./routes/products'); // importar ruta
const userRoute = require('./routes/user');
const pedidoRoutes = require('./routes/pedido');


// Midlewares
app.use(cors());
app.use(express.json());

// 🔥 Servir imágenes y videos desde carpetas públicas
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Usar las rutas
app.use('/api', authRoute);
app.use('/api', loginRoute);
app.use('/api', passwordRoute);
app.use('/api', productsRoute);
app.use('/api', userRoute);
app.use('/api', pedidoRoutes);


// Inicializar el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
