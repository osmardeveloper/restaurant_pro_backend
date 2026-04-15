// ============================================================
// src/controllers/costoController.js
// ============================================================
const Costo = require('../models/Costo');
const Contador = require('../models/Contador');

// ── GET /api/costos ─────────────────────────────────────────
const getCostos = async (req, res) => {
  try {
    const costos = await Costo.find()
      .populate('id_usuario', 'nombre')
      .sort({ createdAt: -1 });
    res.json(costos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener costos.', error: err.message });
  }
};

// ── POST /api/costos ────────────────────────────────────────
const crearCosto = async (req, res) => {
  try {
    // Generar consecutivo
    const counter = await Contador.findOneAndUpdate(
      { concepto: 'costo' },
      { $inc: { contador: 1 } },
      { new: true, upsert: true }
    );

    const nuevaData = {
      ...req.body,
      numero_costo: counter.contador
    };

    const costo = new Costo(nuevaData);
    await costo.save();

    const populated = await costo.populate('id_usuario', 'nombre');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear costo.', error: err.message });
  }
};

// ── DELETE /api/costos/:id ──────────────────────────────────
const eliminarCosto = async (req, res) => {
  try {
    const costo = await Costo.findByIdAndDelete(req.params.id);
    if (!costo) return res.status(404).json({ message: 'Costo no encontrado.' });
    res.json({ message: 'Costo eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar costo.', error: err.message });
  }
};

// ── PUT /api/costos/:id ─────────────────────────────────────
const actualizarCosto = async (req, res) => {
  try {
    const costo = await Costo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!costo) return res.status(404).json({ message: 'Costo no encontrado.' });
    const populated = await costo.populate('id_usuario', 'nombre');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar costo.', error: err.message });
  }
};

module.exports = {
  getCostos,
  crearCosto,
  eliminarCosto,
  actualizarCosto,
};
