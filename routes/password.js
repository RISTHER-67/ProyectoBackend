const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const crypto = require('crypto');
const { sendResetPassword } = require('../confi/email');
require('dotenv').config();

router.post('/olvide-contrasena', (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send('El correo es obligatorio');
    }

    // Buscar usuario por correo
    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
        if (err) {
            console.log('Error en la consulta:', err);
            return res.status(500).send('Error en la base de datos');
        }

        if (results.length === 0) {
            return res.status(200).send('Si el correo existe recibirás un url');
        }

        const usuario = results[0];
        
        // Generando token del usuario
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1h validez (corregido: 3600000 = 1 hora)

        // Actualizar usuario con el token
        db.query(
            'UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE usuario_id = ?', 
            [resetToken, resetTokenExpiry, usuario.usuario_id],
            (updateErr) => {
                if (updateErr) {
                    console.log('Error al actualizar el token:', updateErr);
                    return res.status(500).send('Error al actualizar el token');
                }

                const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5505/';
                const resetUrl = `${frontendUrl}/html/reset.html?token=${resetToken}`; 


                sendResetPassword(usuario.correo, resetUrl)
                    .then(() => {
                        res.status(200).send('Si el correo existe recibirás un link');
                    })
                    .catch((mailError) => {
                        console.error('Error al enviar el correo:', mailError);
                        return res.status(500).send('Error al enviar el correo de restablecimiento');
                    });
            }
        );
    });
});

module.exports = router;