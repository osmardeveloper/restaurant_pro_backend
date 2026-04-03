// ============================================================
// src/controllers/clienteController.js — CRUD de Clientes
// ============================================================
const Cliente = require('../models/Cliente');

// ── GET /api/clientes — Obtener clientes (con paginación simple o completo)
const getClientes = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;
    let query = Cliente.find().sort({ createdAt: -1 });
    if (limit > 0) query = query.limit(limit);
    
    const clientes = await query;
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener clientes.', error: err.message });
  }
};

// ── GET /api/clientes/:id
const getClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el cliente.', error: err.message });
  }
};

// ── POST /api/clientes — Crear
const crearCliente = async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Error de validación', error: messages.join('. ') });
    }
    res.status(500).json({ message: 'Error al crear el cliente.', error: err.message });
  }
};

// ── PUT /api/clientes/:id — Actualizar
const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.json(cliente);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Error de validación', error: messages.join('. ') });
    }
    res.status(500).json({ message: 'Error al actualizar el cliente.', error: err.message });
  }
};

// ── DELETE /api/clientes/:id — Eliminar
const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.json({ message: 'Cliente eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el cliente.', error: err.message });
  }
};

module.exports = {
  getClientes,
  getClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
