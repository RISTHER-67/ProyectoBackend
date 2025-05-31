const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const bcrypt = require('bcrypt');

// Registro usuario
router.post('/register', (req, res) => {
    const { nombre_usuario, correo, contraseña, telefono } = req.body;

    // Validación básica
    if (!nombre_usuario || !correo || !contraseña || !telefono) {
        return res.status(400).send('Faltan datos obligatorios');
    }

    // Hash de la contraseña
    bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) {
            console.error('Error al hashear contraseña:', err);
            return res.status(500).send('Error interno');
        }

        const fecha = new Date();
        const query = `INSERT INTO usuarios (nombre_usuario, correo, telefono, contraseña, fecha_registro)
        VALUES (?, ?, ?, ?, ?)`;

        // Consulta a la base de datos
        db.query(query, [nombre_usuario, correo, telefono, hash, fecha], (err, result) => {
            if (err) {
                console.error('Error al registrar:', err);
                return res.status(500).send('Error interno');
            }

            res.status(200).send('Usuario registrado exitosamente');
        });
    });
});

// Registro con google
router.post('/register-google', (req, res) => {
    const { nombre_usuario, correo, } = req.body;

    //Validacion basica 
    if (!nombre_usuario || !correo) {
        return res.status(400).send('Faltan datos obligatorios');


    }
    const iud = `test_iud_${Date.now()}`;

    db.query(
        "INSERT INTO usuarios (firebase_iud, nombre_usuario, correo, auth_provider, email_verified, fecha_registro) values(?,?,?,?,?,?)"
        [iud, nombre_usuario, correo, 'google', true, new Date()],
        (err, result) => {
            if (err) {
                console.error('Error al registrar:', err);
                return res.status(500).send('Error interno');
            }
            console.log("Usuario creado con exito", result.insertId);
            res.json({
                sucess: true,
                message: "Usuario creado con exito",
                user: {
                    id: result.insertId,
                    firebase_iud: iud,
                    nombre_usuario: nombre_usuario,
                    correo: correo,
                    auth_provider: 'google'
                }
            })
        }
    )

})
router.post('/login/google', async (req, res) => {

    const { nombre_usuario, correo, firebase_uid, email_verified } = req.body;

    if (!correo || !firebase_uid) {
        return res.status(400).send('Faltan datos obligatorios');
    }
    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
        if (err) {
            console.error('Error en consulta:', err);
            return res.status(500).send('Error en el servidor');
        }
        if (results.length === 0) {
            // Usuario no existe, lo registramos
            const insertQuery = `
            INSERT INTO usuarios (nombre_usuario, correo, fecha_registro, auth_provider, firebase_iud, email_verified)
            VALUES (?, ?, NOW(), 'google', ?, ?)`;
            db.query(insertQuery, [nombre_usuario, correo, firebase_uid, email_verified ? 1 : 0], (err, result) => {
                if (err) {
                    console.error('Error al insertar usuario Google:', err);
                    return res.status(500).send('Error al registrar usuario');
                }
                return res.status(201).json({
                    mensaje: 'Usuario registrado con Google',
                    usuario: {
                        id: result.insertId,
                        nombre_usuario,
                        correo,
                        auth_provider: 'google'
                    }
                });
            });
        } else {
            // Usuario ya existe
            return res.status(200).json({
                mensaje: 'Login con Google exitoso',
                usuario: results[0]
            });
        }
    });
});
module.exports = router;