// ============================================================
// src/controllers/gastoController.js
// ============================================================
const Gasto = require('../models/Gasto');
const Contador = require('../models/Contador');

// ── GET /api/gastos ─────────────────────────────────────────
const getGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find()
      .populate('id_usuario', 'nombre')
      .sort({ createdAt: -1 });
    res.json(gastos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener gastos.', error: err.message });
  }
};

// ── POST /api/gastos ────────────────────────────────────────
const crearGasto = async (req, res) => {
  try {
    // Generar consecutivo
    const counter = await Contador.findOneAndUpdate(
      { concepto: 'gasto' },
      { $inc: { contador: 1 } },
      { new: true, upsert: true }
    );

    const nuevaData = {
      ...req.body,
      numero_gasto: counter.contador
    };

    const gasto = new Gasto(nuevaData);
    await gasto.save();

    const populated = await gasto.populate('id_usuario', 'nombre');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear gasto.', error: err.message });
  }
};

// ── DELETE /api/gastos/:id ──────────────────────────────────
const eliminarGasto = async (req, res) => {
  try {
    const gasto = await Gasto.findByIdAndDelete(req.params.id);
    if (!gasto) return res.status(404).json({ message: 'Gasto no encontrado.' });
    res.json({ message: 'Gasto eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar gasto.', error: err.message });
  }
};

// ── PUT /api/gastos/:id ─────────────────────────────────────
const actualizarGasto = async (req, res) => {
  try {
    const gasto = await Gasto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gasto) return res.status(404).json({ message: 'Gasto no encontrado.' });
    const populated = await gasto.populate('id_usuario', 'nombre');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar gasto.', error: err.message });
  }
};

module.exports = {
  getGastos,
  crearGasto,
  eliminarGasto,
  actualizarGasto,
};
