const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const bcrypt = require('bcrypt');

// Login de usuario (versión con callbacks para mysql2 tradicional)
router.post('/login', (req, res) => {
    const { nombre_usuario, contraseña } = req.body;

    // Validación básica
    if (!nombre_usuario || !contraseña) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    // Buscar el usuario en la base de datos
    db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).send("Error interno del servidor");
        }

        if (results.length === 0) {
            return res.status(404).send("El usuario no existe");
        }

        const usuario = results[0];

        // Comparar la contraseña con bcrypt
        bcrypt.compare(contraseña, usuario.contraseña, (err, match) => {
            if (err) {
                console.error("Error al comparar contraseña:", err);
                return res.status(500).send("Error interno del servidor");
            }

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
        });
    });
});

module.exports = router;