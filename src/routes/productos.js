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

// Todas las rutas de productos requieren autenticación
router.use(verificarToken);

router.get('/',       getProductos);
router.get('/:id',    getProductoPorId);
router.post('/',      verificarSoloAdmin, crearProducto);
router.put('/:id',    verificarSoloAdmin, actualizarProducto);
router.delete('/:id', verificarSoloAdmin, verificarMasterKey, eliminarProducto);

module.exports = router;
