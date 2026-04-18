// ============================================================
// src/controllers/categoriasProductosController.js — Controlador de Categorías
// ============================================================
const CategoriasProductos = require('../models/CategoriasProductos');

// ── GET /api/categorias-productos — Obtener todas las categorías ──
const getCategorias = async (req, res) => {
  try {
    const categorias = await CategoriasProductos.find().sort({ 'detalles.label': 1 });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener categorías.', error: err.message });
  }
};

// ── GET /api/categorias-productos/:id ─────────────────────────
const getCategoriaPorId = async (req, res) => {
  try {
    const categoria = await CategoriasProductos.findById(req.params.id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada.' });
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la categoría.', error: err.message });
  }
};

// ── POST /api/categorias-productos — Crear nueva categoría ──────
const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio.' });
    }

    const label = String(nombre).trim();
    const value = label.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Verificar si ya existe (case-insensitive)
    const existente = await CategoriasProductos.findOne({ 
      'detalles.value': value
    });
    
    if (existente) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre.' });
    }

    const categoria = new CategoriasProductos({
      detalles: { label, value },
    });
    
    await categoria.save();
    res.status(201).json(categoria);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la categoría.', error: err.message });
  }
};

// ── PUT /api/categorias-productos/:id ─────────────────────────
const actualizarCategoria = async (req, res) => {
  try {
    const { nombre, activa } = req.body;

    if (nombre && !String(nombre).trim()) {
      return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
    }

    const datosActualizacion = {};
    
    if (nombre) {
      const label = String(nombre).trim();
      const value = label.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Verificar duplicado si se está cambiando el nombre
      const existente = await CategoriasProductos.findOne({
        _id: { $ne: req.params.id },
        'detalles.value': value
      });
      
      if (existente) {
        return res.status(400).json({ message: 'Ya existe otra categoría con ese nombre.' });
      }

      datosActualizacion.detalles = { label, value };
    }
    
    if (activa !== undefined) datosActualizacion.activa = activa;

    const categoria = await CategoriasProductos.findByIdAndUpdate(
      req.params.id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada.' });
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la categoría.', error: err.message });
  }
};

// ── DELETE /api/categorias-productos/:id ──────────────────────
const eliminarCategoria = async (req, res) => {
  try {
    const categoria = await CategoriasProductos.findByIdAndDelete(req.params.id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada.' });
    res.json({ message: 'Categoría eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la categoría.', error: err.message });
  }
};

module.exports = {
  getCategorias,
  getCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
