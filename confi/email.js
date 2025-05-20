const nodemailer = require("nodemailer");

// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
    host: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

//funcion para enviar el correo de restablecimineto de contraseña
const sendResetsPassword = async (to, resetUrl) =>{
    try{
        const mailOptions = {
            from: process.SMTP_USER,
            to: to, // list of receivers
            subject:'Restablecimineto de contraseña',
            html:`<B>Solicitaste el restablecimineto de tu contraseña?</b>
            <p>Haz click en el siguiente enlace para restablecer tu contraseña</p>
            <a href="${resetUrl}" target="_blank"> Restablecer contaseña </a>
            <p>Este enlace expira en 1h</p>
            <p>Si no fuiste tu ignoralo</p>`,

    };
    const info = await transporter.sendMail(mailOptions);
    console .log("Mensaje enviado: %s", info.messageId);
    return true;
    }catch(err){
        console.error("Error al enviar el correo", err);
    }
    
};
module.exports = {transporter, sendResetsPassword};
