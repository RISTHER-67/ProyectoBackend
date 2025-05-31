const express = require('express');
const router = express.Router();
const db = require('../confi/db');

router.post('/pedido', (req, res) => {
  const { usuario_id, metodo_pago, numero_operacion, productos } = req.body;

  if (!usuario_id || !metodo_pago || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos o carrito vacío' });
  }

  // Insertar pedido
  db.query(
    'INSERT INTO pedidos (usuario_id, metodo_pago, numero_operacion, fecha_creacion) VALUES (?, ?, ?, NOW())',
    [usuario_id, metodo_pago, numero_operacion],
    (err, result) => {
      if (err) {
        console.error('Error al insertar pedido:', err);
        return res.status(500).json({ message: 'Error interno al registrar el pedido' });
      }

      const pedido_id = result.insertId;

      const insertarProductos = (index) => {
        if (index >= productos.length) {
          return res.status(200).json({ message: 'Pedido registrado correctamente' });
        }

        const producto = productos[index];
        const { id, quantity, price } = producto;

        if (!id || !quantity || !price) {
          return insertarProductos(index + 1);
        }

        db.query(
          'INSERT INTO pedidos_productos (pedido_id, productos_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [pedido_id, id, quantity, price],
          (err) => {
            if (err) {
              console.error('Error al insertar producto:', err);
              return res.status(500).json({ message: 'Error interno al registrar el pedido' });
            }

            insertarProductos(index + 1);
          }
        );
      };

      insertarProductos(0);
    }
  );
});

// Nuevo endpoint para obtener historial de compras de un usuario
router.get('/pedidos/:usuario_id', (req, res) => {
  const usuario_id = req.params.usuario_id;

  const queryPedidos = `
    SELECT p.pedido_id, p.metodo_pago, p.numero_operacion, p.fecha_creacion,
    pp.productos_id, pp.cantidad, pp.precio_unitario,
    pr.nombre AS nombre_producto, pr.imagen_url AS imagen_producto
    FROM pedidos p
    JOIN pedidos_productos pp ON p.pedido_id = pp.pedido_id
    JOIN productos pr ON pp.productos_id = pr.productos_id
    WHERE p.usuario_id = ?
    ORDER BY p.fecha_creacion DESC
  `;

  db.query(queryPedidos, [usuario_id], (err, results) => {
    if (err) {
      console.error('Error al obtener historial de compras:', err);
      return res.status(500).json({ message: 'Error interno al obtener historial de compras' });
    }

    // Organizar resultados por pedido
    const pedidosMap = new Map();

    results.forEach(row => {
      if (!pedidosMap.has(row.pedido_id)) {
        pedidosMap.set(row.pedido_id, {
          pedido_id: row.pedido_id,
          metodo_pago: row.metodo_pago,
          numero_operacion: row.numero_operacion,
          fecha_creacion: row.fecha_creacion,
          productos: []
        });
      }
      pedidosMap.get(row.pedido_id).productos.push({
        productos_id: row.productos_id,
        cantidad: row.cantidad,
        precio_unitario: row.precio_unitario,
        nombre_producto: row.nombre_producto,
        imagen_producto: row.imagen_producto
      });
    });

    const pedidos = Array.from(pedidosMap.values());

    res.status(200).json({ pedidos });
  });
});

module.exports = router;
