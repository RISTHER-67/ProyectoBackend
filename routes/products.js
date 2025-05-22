const express = require("express");
const router = express.Router();
const db = require("../confi/db");
require('dotenv').config();

const HOST = 'http://localhost:3000';

router.get("/products", async (req, res) => {
  try {
    const [productos] = await db.query("SELECT * FROM productos WHERE disponible >= 1");

    if (productos.length === 0) return res.json([]);

    const productIds = productos.map(p => p.productos_id);

    const [videos] = await db.query("SELECT * FROM videos_productos WHERE productos_id IN (?)", [productIds]);
    const [caracteristicas] = await db.query("SELECT * FROM caracteristicas_tecnicas WHERE productos_id IN (?)", [productIds]);

    const result = productos.map(p => {
      return {
        id: p.productos_id,
        name: p.nombre,
        brand: `${ p.marca } ${ p.modelo }`,
      storage: p.capacidad,
        price: p.precio,
          image: `${ HOST }${ p.imagen_url }`,
      description: p.descripcion,
        availability: p.disponible,
          features: caracteristicas
            .filter(c => c.productos_id === p.productos_id)
            .map(c => c.caracteristica),
            video: videos
              .filter(v => v.productos_id === p.productos_id)
              .map(v => `${ HOST }${ v.url_videos }`),
      };
  });

res.json(result);
  } catch (err) {
  console.error("Error cargando productos:", err);
  res.status(500).json({ error: "Error interno del servidor" });
}
});

module.exports = router;
