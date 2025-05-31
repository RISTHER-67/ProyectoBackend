const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).send('Token y contraseña son obligatorios');
  }

  // Buscar usuario por token y verificar que el token no haya expirado
  db.query(
    'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expiry > ?',
    [token, Date.now()],
    async (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).send('Error en la base de datos');
      }

      if (results.length === 0) {
        return res.status(400).send('Token inválido o expirado');
      }

      const usuario = results[0];

      try {
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña hasheada y limpiar el token y su expiración
        db.query(
          'UPDATE usuarios SET contraseña = ?, reset_token = NULL, reset_token_expiry = NULL WHERE usuario_id = ?',
          [hashedPassword, usuario.usuario_id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error al actualizar la contraseña:', updateErr);
              return res.status(500).send('Error al actualizar la contraseña');
            }

            res.status(200).send('Contraseña restablecida correctamente');
          }
        );
      } catch (hashErr) {
        console.error('Error al hashear la contraseña:', hashErr);
        return res.status(500).send('Error al procesar la contraseña');
      }
    }
  );
});

module.exports = router;
