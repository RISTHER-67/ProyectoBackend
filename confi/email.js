const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Función para enviar el correo de restablecimiento de contraseña
const sendResetPassword = async (to, resetUrl) => { 
    try {
        const mailOptions = {
            from: process.env.SMTP_USER, 
            to: to,
            subject: 'Restablecimiento de contraseña',
            html: `<b>¿Solicitaste el restablecimiento de tu contraseña?</b>
            <p>Haz click en el siguiente enlace para restablecer tu contraseña</p>
            <a href="${resetUrl}" target="_blank">Restablecer contraseña</a>
            <p>Este enlace expira en 1h</p>
            <p>Si no fuiste tú, ignóralo</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Mensaje enviado: %s", info.messageId);
        return true;
    } catch (err) {
        console.error("Error al enviar el correo", err);
        throw err;
    }
};

module.exports = { transporter, sendResetPassword }; 