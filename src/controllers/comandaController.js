// ============================================================
// src/controllers/comandaController.js — Solo lectura
// ============================================================
const Comanda = require('../models/Comanda');
const Mesa = require('../models/Mesa');

// ── GET /api/comandas — Obtener todas las comandas ───────────
const getComanadas = async (req, res) => {
  try {
    const comandas = await Comanda.find()
      .populate('id_mesa', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido numero_documento')
      .populate('ids_productos', 'nombre precio')
      .sort({ createdAt: -1 });
    res.json(comandas);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las comandas.', error: err.message });
  }
};

// ── GET /api/comandas/:id ────────────────────────────────────
const getComandaPorId = async (req, res) => {
  try {
    const comanda = await Comanda.findById(req.params.id)
      .populate('id_mesa', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido numero_documento')
      .populate('ids_productos', 'nombre precio');
    if (!comanda) return res.status(404).json({ message: 'Comanda no encontrada.' });
    res.json(comanda);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la comanda.', error: err.message });
  }
};

// ── POST /api/comandas — Crear comanda (para uso interno) ────
const crearComanda = async (req, res) => {
  try {
    const comanda = new Comanda(req.body);
    await comanda.save();

    // Cambiar estado de la mesa a 'pedido tomado' y referenciar a la comanda única
    await Mesa.findByIdAndUpdate(req.body.id_mesa, { estado: 'pedido tomado', pedido_actual: comanda._id });

    const populated = await comanda.populate([
      { path: 'id_mesa', select: 'numero_mesa estado' },
      { path: 'id_cliente', select: 'nombre apellido numero_documento' },
      { path: 'ids_productos', select: 'nombre precio' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la comanda.', error: err.message });
  }
};

// ── PUT /api/comandas/:id — Actualizar comanda ───────────────
const actualizarComanda = async (req, res) => {
  try {
    const comanda = await Comanda.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'id_mesa', select: 'numero_mesa estado' },
      { path: 'id_cliente', select: 'nombre apellido numero_documento' },
      { path: 'ids_productos', select: 'nombre precio' }
    ]);
    if (!comanda) return res.status(404).json({ message: 'Comanda no encontrada.' });
    res.json(comanda);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la comanda.', error: err.message });
  }
};

module.exports = {
  getComanadas,
  getComandaPorId,
  crearComanda,
  actualizarComanda,
};
