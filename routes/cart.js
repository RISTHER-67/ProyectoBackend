const express = require('express');
const router = express.Router();
const db = require('../confi/db');

// Middleware de autenticación (ajusta si usas sesiones)
function isAuthenticated(req, res, next) {
    if (req.body.usuario_id || req.query.usuario_id) {
        return next();
    }
    res.status(401).json({ message: 'No autenticado' });
}

// 📌 1. Agregar producto al carrito (ya lo tenías)
router.post('/cart/add', isAuthenticated, async (req, res) => {
    const { usuario_id, productos_id, cantidad } = req.body;

    try {
        let [carrito] = await db.query('SELECT carrito_id FROM carrito WHERE usuario_id = ?', [usuario_id]);
        let carrito_id = carrito.length === 0
            ? (await db.query('INSERT INTO carrito (usuario_id) VALUES (?)', [usuario_id]))[0].insertId
            : carrito[0].carrito_id;

        let [productoEnCarrito] = await db.query(
            'SELECT id, cantidad FROM carrito_productos WHERE carrito_id = ? AND productos_id = ?',
            [carrito_id, productos_id]
        );

        if (productoEnCarrito.length === 0) {
            await db.query(
                'INSERT INTO carrito_productos (carrito_id, productos_id, cantidad) VALUES (?, ?, ?)',
                [carrito_id, productos_id, cantidad]
            );
        } else {
            const nuevaCantidad = productoEnCarrito[0].cantidad + cantidad;
            await db.query(
                'UPDATE carrito_productos SET cantidad = ? WHERE id = ?',
                [nuevaCantidad, productoEnCarrito[0].id]
            );
        }

        res.status(200).json({ message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// ✅ 2. Visualizar el carrito
router.get('/cart', isAuthenticated, async (req, res) => {
    const usuario_id = req.query.usuario_id;

    try {
        const [carrito] = await db.query('SELECT carrito_id FROM carrito WHERE usuario_id = ?', [usuario_id]);

        if (carrito.length === 0) {
            return res.status(200).json({ productos: [] });
        }

        const carrito_id = carrito[0].carrito_id;

        const [productos] = await db.query(`
    SELECT cp.id AS carrito_producto_id, p.productos_id, p.nombre, p.precio, p.imagen, cp.cantidad
    FROM carrito_productos cp
    JOIN productos p ON cp.productos_id = p.productos_id
    WHERE cp.carrito_id = ?
    `, [carrito_id]);

        res.status(200).json({ productos });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// 🔄 3. Actualizar cantidad de un producto
router.put('/cart/update', isAuthenticated, async (req, res) => {
    const { usuario_id, productos_id, nuevaCantidad } = req.body;

    try {
        const [carrito] = await db.query('SELECT carrito_id FROM carrito WHERE usuario_id = ?', [usuario_id]);

        if (carrito.length === 0) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const carrito_id = carrito[0].carrito_id;

        await db.query(
            'UPDATE carrito_productos SET cantidad = ? WHERE carrito_id = ? AND productos_id = ?',
            [nuevaCantidad, carrito_id, productos_id]
        );

        res.status(200).json({ message: 'Cantidad actualizada' });
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// ❌ 4. Eliminar un producto del carrito
router.delete('/cart/remove', isAuthenticated, async (req, res) => {
    const { usuario_id, productos_id } = req.body;

    try {
        const [carrito] = await db.query('SELECT carrito_id FROM carrito WHERE usuario_id = ?', [usuario_id]);

        if (carrito.length === 0) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const carrito_id = carrito[0].carrito_id;

        await db.query(
            'DELETE FROM carrito_productos WHERE carrito_id = ? AND productos_id = ?',
            [carrito_id, productos_id]
        );

        res.status(200).json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;
