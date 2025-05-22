const express = require('express');
const router = express.Router();
const db = require('../confi/db');

router.post('/pedido', async (req, res) => {
  const { usuario_id, metodo_pago, numero_operacion, productos } = req.body;

  if (!usuario_id || !metodo_pago || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos o carrito vacío' });
  }

  try {
    // Insertar pedido
    const [result] = await db.query(
      'INSERT INTO pedidos (usuario_id, metodo_pago, numero_operacion, fecha_creacion) VALUES (?, ?, ?, NOW())',
      [usuario_id, metodo_pago, numero_operacion]
    );

    const pedido_id = result.insertId;

    // Insertar cada producto 
    for (const producto of productos) {
      const { id, quantity, price } = producto;
      if (!id || !quantity || !price) continue; 

      await db.query(
        'INSERT INTO pedidos_productos (pedido_id, productos_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedido_id, id, quantity, price]
      );
    }

    res.status(200).json({ message: 'Pedido registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar pedido:', error);
    res.status(500).json({ message: 'Error interno al registrar el pedido' });
  }
});

module.exports = router;
