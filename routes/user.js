const express = require('express');
const router = express.Router();
const db = require('../confi/db');

// Middleware de autenticación (ajusta según tu sistema)
function isAuthenticated(req, res, next) {
    // Aquí deberías validar la sesión o token del usuario
    // Por simplicidad, asumimos que usuario_id viene en query o body
    if (req.body.usuario_id || req.query.usuario_id) {
        return next();
    }
    res.status(401).json({ message: 'No autenticado' });
}

// Ruta para obtener datos del usuario autenticado
router.get('/user', isAuthenticated, async (req, res) => {
    const usuario_id = req.query.usuario_id || req.body.usuario_id;

    // Aquí deberías consultar la base de datos para obtener datos del usuario
    // Por ejemplo:
    const [user] = await db.query('SELECT usuario_id, nombre_usuario, contraseña FROM usuarios WHERE usuario_id = ?', [usuario_id]);
    if (user.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user[0]);

    // Por ahora, simulamos respuesta
    return res.status(200).send({
        "message": "Login susefuly",
        usuario: {
            usuario_id: usuario.usuario_id,
            nombre_usuario: usuario.nombre_usuario,
            correo: usuario.correo
        }
    });
});
module.exports = router;
