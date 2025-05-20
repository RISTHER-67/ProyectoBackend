const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const bcrypt = require('bcrypt');



//Login de usuario 
router.post('/login', (req, res) => {
    const { nombre_usuario, contraseña } = req.body;

    //Validacion basica 
    if (!nombre_usuario || !contraseña) {
        return res.status(400).send("Todos los campos son requeridos")

    }
    //Buscar el usuario en la base de datos 
    db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario],
        async (err, results) => {
            if (err) {
                console.log("Error en la consulta", err);
                return res.status(400).send("Error interno");

            }
            //Si el usuario existe
            if (results.length == 0){
                return res.status(500).send("El usuario no existe");
            }
            const usuario = results[0];

            //Comparar si la contraseña son iguales 
            const match = await bcrypt.compare(contraseña, usuario.contraseña);
            if (!match) {
                return res.status(401).send("Contraseña incorrecta");
            }
            return res.status(200).send({
                "message": "Login susefuly",
                usuario: {
                    usuario_id: usuario.usuario_id,
                    nombre_usuario: usuario.nombre_usuario,
                    correo: usuario.correo
                }
                
            });
            

    })
    
});
module.exports = router;
