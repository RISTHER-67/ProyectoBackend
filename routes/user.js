const express = require('express');
const router = express.Router();
const db = require('../confi/db');
const multer = require('multer');
const path = require('path');

// Configuración de multer para guardar imágenes en carpeta images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profile_${req.body.usuario_id}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage: storage });

// Middleware de autenticación (ajusta según tu sistema)
function isAuthenticated(req, res, next) {
    // Aquí deberías validar la sesión o token del usuario
    // Por simplicidad, asumimos que usuario_id viene en query o body
    if (req.body.usuario_id || req.query.usuario_id) {
        return next();
    }
    res.status(401).json({ message: 'No autenticado' });
}

router.get('/user', isAuthenticated, (req, res) => {
    const usuario_id = req.query.usuario_id || req.body.usuario_id;

    db.query('SELECT usuario_id, nombre_usuario, correo, imagen_url FROM usuarios WHERE usuario_id = ?', [usuario_id], (err, user) => {
        if (err) {
            console.error('Error al consultar usuario:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: "Usuario encontrado exitosamente",
            usuario: {
                usuario_id: user[0].usuario_id,
                nombre_usuario: user[0].nombre_usuario,
                correo: user[0].correo,
                imagen_url: user[0].imagen_url
            }
        });
    });
});

// Endpoint para subir foto de perfil
router.post('/user/profile-photo', isAuthenticated, upload.single('profile_photo'), (req, res) => {
  const usuario_id = req.body.usuario_id;
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ninguna imagen' });
  }
  const imagen_url = `/images/${req.file.filename}`;

  // Actualizar ruta de imagen en la base de datos
  db.query('UPDATE usuarios SET imagen_url = ? WHERE usuario_id = ?', [imagen_url, usuario_id], (err, result) => {
    if (err) {
      console.error('Error al actualizar imagen de perfil:', err);
      return res.status(500).json({ message: 'Error interno al actualizar imagen' });
    }
    res.status(200).json({ message: 'Imagen de perfil actualizada', imagen_url });
  });
});

module.exports = router;
