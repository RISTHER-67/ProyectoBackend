const express = require('express'); 
const router = express.Router();
const db = require('../confi/db');

// Ruta base del servidor para acceder a imágenes y videos
const HOST = 'http://localhost:3000'; // cambia si estás en producción

router.get('/products', (req, res) => {
    const queryProductos = 'SELECT * FROM productos WHERE disponibilidad >= 1';

    db.query(queryProductos, (err, productos) => {
        if (err) return res.status(500).json({ error: 'Error cargando productos' });

        const productIds = productos.map(p => p.id);
        if (productIds.length === 0) return res.json([]);

        const queryVideos = 'SELECT * FROM videos_productos WHERE productos_id IN (?)';
        const queryCaracteristicas = 'SELECT * FROM caracteristicas_tecnicas WHERE productos_id IN (?)';

        db.query(queryVideos, [productIds], (err, videos) => {
            if (err) return res.status(500).json({ error: 'Error cargando videos' });

            db.query(queryCaracteristicas, [productIds], (err, caracteristicas) => {
                if (err) return res.status(500).json({ error: 'Error cargando características' });

                const result = productos.map(p => {
                    return {
                        name: p.nombre,
                        brand: `${p.marca} ${p.modelo}`,
                        storage: p.capacidad,
                        price: p.precio,
                        image: `${HOST}${p.imagen_url}`,
                        description: p.descripcion,
                        availability: p.disponibilidad,
                        features: caracteristicas
                            .filter(c => c.productos_id === p.id)
                            .map(c => c.caracteristica),
                        video: videos
                            .filter(v => v.productos_id === p.id)
                            .map(v => `${HOST}${v.url_videos}`)
                    };
                });

                res.json(result);
            });
        });
    });
});

module.exports = router;


