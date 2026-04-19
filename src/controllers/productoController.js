// ============================================================
// src/controllers/productoController.js — CRUD de Productos
// ============================================================
const Producto = require('../models/Producto');

// ── GET /api/productos — Obtener productos (con filtros opcionales)
const getProductos = async (req, res) => {
  try {
    const { tipo } = req.query;
    const query = {};
    if (tipo) query.tipo = tipo;

    const productos = await Producto.find(query).sort({ nombre: 1 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos.', error: err.message });
  }
};

// ── GET /api/productos/:id ────────────────────────────────────
const getProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el producto.', error: err.message });
  }
};

// ── POST /api/productos — Crear producto ──────────────────────
const crearProducto = async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el producto.', error: err.message });
  }
};

// ── PUT /api/productos/:id — Actualizar producto ──────────────
const actualizarProducto = async (req, res) => {
  try {
    // No permitimos actualizar la cantidad directamente (solo vía inventario)
    const datosActualizar = { ...req.body };
    delete datosActualizar.cantidad;
    
    const producto = await Producto.findByIdAndUpdate(req.params.id, datosActualizar, {
      new:           true,
      runValidators: true,
    });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el producto.', error: err.message });
  }
};

// ── DELETE /api/productos/:id — Eliminar producto ────────────
const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el producto.', error: err.message });
  }
};

module.exports = {
  getProductos,
  getProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
