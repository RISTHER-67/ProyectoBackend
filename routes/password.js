const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const crypto = require('crypto');
const { sendResetPassword } = require('../confi/email');
require('dotenv').config();


router.post('olvide-contraseña', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send('El correo es obligatorio');
    }

    try {
        bd.query('SELECT * FROM usuarios WHERE correo = ?', [correo],
            async (err, results) => {
                if (err) {
                    console.log('Error en la consulta ');
                    return res.status(500).send('Error en la base de datos');

                }
                if (results.length === 0) {
                    return res.status(200).send('Si el correo existe recibiras un url');
                }
                const usuario = results[0];
                //generando token del usuario
                const resetToken = crypto.randomBytes(20).toString('hex');
                const resetTokenExpiry = Date.now()+ 360000; //1h valildez


                db.query(
                    'UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE id=? ',
                    [resetToken, resetTokenExpiry, usuario.id],
                    async(updateErr)=>{
                        if(updateErr){
                            console.log('Error al actualizar el token', updateErr);
                            return res.status(500).send('Error al actualizar el token');
                        }
                        const frontendUrl = process.env.FRONTEND_URL||'http://127.0.0.1:5503/';
                        const resetUrl = `${frontendUrl}/reset.html?token=/${resetToken}`;

                        try {
                            //Usar la funcion de correo 
                            await sendResetPassword(usuario.correo, resetUrl);
                            res.status(200).send('Si el correo existe recibiras un link');

                        }
                        catch(mailError){
                            console.error('Error al enviar el correo', mailError);
                            return res.status(500).send('Error al enviar el correo de restablecimineto');


                        }

                    }
                )
            }
        );
    } catch (error){
        console.error('Error en olvide contraseña ');
        res.status(500).send('Error interno');

    }

});
module.exports = router;
