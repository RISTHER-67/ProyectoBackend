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
const forgotRoutes = require('./routes/password');
const resetRoutes = require('./routes/resetPassword');


// Midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true

}));
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor corriendo',
        timestamp: new Date().toISOString()
    });
});

// api principal
app.get('/api', (req, res) => {
    res.json({
        message: 'Api Funcionando',
        enpoints: ['Post api/login', 'Post api/register', 'Post api/login/google'],
    })
})


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
app.use('/api', forgotRoutes);
app.use('/api', resetRoutes);


// Inicializar el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
