const express = require("express");
const router = express.Router();
const db = require("../confi/db");
require('dotenv').config();

const HOST = 'http://localhost:3000';

router.get("/products", (req, res) => {
  // Primera consulta: obtener productos
  db.query("SELECT * FROM productos WHERE disponible >= 1", (err, productos) => {
    if (err) {
      console.error("Error cargando productos:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (productos.length === 0) {
      return res.json([]);
    }

    const productIds = productos.map(p => p.productos_id);

    // Segunda consulta: obtener videos
    db.query("SELECT * FROM videos_productos WHERE productos_id IN (?)", [productIds], (err, videos) => {
      if (err) {
        console.error("Error cargando videos:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      // Tercera consulta: obtener características
      db.query("SELECT * FROM caracteristicas_tecnicas WHERE productos_id IN (?)", [productIds], (err, caracteristicas) => {
        if (err) {
          console.error("Error cargando características:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }

        // Procesar y formatear los resultados
        const result = productos.map(p => {
          return {
            id: p.productos_id,
            name: p.nombre,
            brand: `${p.marca} ${p.modelo}`,
            storage: p.capacidad,
            price: p.precio,
            image: `${HOST}${p.imagen_url}`,
            description: p.descripcion,
            availability: p.disponible,
            features: caracteristicas
              .filter(c => c.productos_id === p.productos_id)
              .map(c => c.caracteristica),
            video: videos
              .filter(v => v.productos_id === p.productos_id)
              .map(v => `${HOST}${v.url_videos}`),
          };
        });

        res.json(result);
      });
    });
  });
});

module.exports = router;