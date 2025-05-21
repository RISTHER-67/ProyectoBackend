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
const cartRoute = require('./routes/cart');
const userRoute = require('./routes/user');



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
app.use('/api', cartRoute);
app.use('/api', userRoute);

// Inicializar el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
