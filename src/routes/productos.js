// ============================================================
// src/routes/productos.js — Rutas de Productos
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  getProductos,
  getProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productoController');
const { verificarToken, verificarMasterKey, verificarSoloAdmin } = require('../middlewares/auth');

// GET routes are public (for public menu)
router.get('/',       getProductos);
router.get('/:id',    getProductoPorId);

// POST, PUT, DELETE routes require authentication
router.post('/',      verificarToken, verificarSoloAdmin, crearProducto);
router.put('/:id',    verificarToken, verificarSoloAdmin, actualizarProducto);
router.delete('/:id', verificarToken, verificarSoloAdmin, verificarMasterKey, eliminarProducto);

module.exports = router;
