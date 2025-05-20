const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const bcrypt = require('bcrypt');


//Registro usuario
router.post('/register', async (req, res) => {
    const { nombre_usuario, correo, contraseña, telefono } = req.body;


    //Validacion basica
    if (!nombre_usuario || !correo || !contraseña || !telefono) {
        return res.status(400).send('Falta datos obligatorios');
    }
    try {
        //Aqui se epcripta la contraseña
        const hash = await bcrypt.hash(contraseña, 10);
        const fecha = new Date();


        // Insertar en la base de datos 
        const query = `INSERT INTO usuarios (nombre_usuario, correo, telefono, contraseña, fecha_registro)
        VALUES(?,?,?,?,?)`
        db.query(query, [nombre_usuario, correo, telefono, hash, fecha], (err, result) => {
            if (err) {
                console.log('Error al registrar', err)
                return res.status(400).send('Error al registrar usuario');
            }
            res.status(200).send('Usuario registrado exitosamente');

        })
    }
    catch (error) {
        console.log('Error al registrar');
        res.status(500).send('Error interno');
    }
})
module.exports = router;