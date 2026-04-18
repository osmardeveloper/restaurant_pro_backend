// ============================================================
// src/routes/categoriasProductos.js — Rutas de Categorías de Productos
// ============================================================
const express = require('express');
const router = express.Router();
const {
  getCategorias,
  getCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require('../controllers/categoriasProductosController');
const { verificarToken, verificarSoloAdmin, verificarMasterKey } = require('../middlewares/auth');

// GET routes are public (for public menu)
router.get('/',       getCategorias);
router.get('/:id',    getCategoriaPorId);

// POST, PUT, DELETE routes require authentication
router.post('/',      verificarToken, verificarSoloAdmin, crearCategoria);
router.put('/:id',    verificarToken, verificarSoloAdmin, actualizarCategoria);
router.delete('/:id', verificarToken, verificarSoloAdmin, verificarMasterKey, eliminarCategoria);

module.exports = router;
