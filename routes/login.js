const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const bcrypt = require('bcrypt');

// Login de usuario (versión async/await compatible con mysql2/promise)
router.post('/login', async (req, res) => {
    const { nombre_usuario, contraseña } = req.body;

    // Validación básica
    if (!nombre_usuario || !contraseña) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    try {
        // Buscar el usuario en la base de datos
        const [results] = await db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario]);

        if (results.length === 0) {
            return res.status(404).send("El usuario no existe");
        }

        const usuario = results[0];

        // Comparar la contraseña con bcrypt
        const match = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!match) {
            return res.status(401).send("Contraseña incorrecta");
        }

        // Login exitoso
        return res.status(200).send({
            message: "Login exitoso",
            usuario: {
                usuario_id: usuario.usuario_id,
                nombre_usuario: usuario.nombre_usuario,
                correo: usuario.correo
            }
        });
    } catch (err) {
        console.error("Error en el login:", err);
        return res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;