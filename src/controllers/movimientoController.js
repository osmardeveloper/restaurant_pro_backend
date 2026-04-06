// ============================================================
// src/controllers/movimientoController.js
// ============================================================
const Movimiento = require('../models/Movimiento');
const Producto = require('../models/Producto');

const getMovimientos = async (req, res) => {
  try {
    const { tipo, desde, hasta } = req.query;
    let query = {};
    if (tipo) query.tipo = tipo;
    if (desde || hasta) {
      query.fecha = {};
      if (desde) {
        // Al concatenar la hora, el constructor Date lo interpreta como hora local del servidor
        query.fecha.$gte = new Date(desde + 'T00:00:00');
      }
      if (hasta) {
        query.fecha.$lte = new Date(hasta + 'T23:59:59');
      }
    }
    const movimientos = await Movimiento.find(query).sort({ fecha: -1 });
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener movimientos.', error: err.message });
  }
};

const crearMovimiento = async (req, res) => {
  try {
    const { tipo, responsable, productos, motivo } = req.body;
    if (!tipo || !responsable || !productos || productos.length === 0) {
      return res.status(400).json({ message: 'Faltan datos obligatorios para registrar el movimiento.' });
    }

    // 1. Crear el registro del movimiento
    const nuevoMov = new Movimiento({ tipo, responsable, productos, motivo });
    await nuevoMov.save();

    // 2. Actualizar el stock en el catálogo de productos
    for (const p of productos) {
      const incremento = tipo === 'ingreso' ? p.cantidad : -p.cantidad;
      await Producto.findByIdAndUpdate(p.id_producto, {
        $inc: { cantidad: incremento }
      });
    }

    res.status(201).json(nuevoMov);
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar el movimiento.', error: err.message });
  }
};

module.exports = {
  getMovimientos,
  crearMovimiento,
};
