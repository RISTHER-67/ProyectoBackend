const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const bcrypt = require('bcrypt');

// Registro usuario
router.post('/register', async (req, res) => {
    const { nombre_usuario, correo, contraseña, telefono } = req.body;

    // Validación básica
    if (!nombre_usuario || !correo || !contraseña || !telefono) {
        return res.status(400).send('Faltan datos obligatorios');
    }

    try {
        const hash = await bcrypt.hash(contraseña, 10);
        const fecha = new Date();

        const query = `INSERT INTO usuarios (nombre_usuario, correo, telefono, contraseña, fecha_registro)
        VALUES (?, ?, ?, ?, ?)`;

        await db.query(query, [nombre_usuario, correo, telefono, hash, fecha]);

        res.status(200).send('Usuario registrado exitosamente');
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).send('Error interno');
    }
});

module.exports = router;