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
const { verificarToken } = require('../middlewares/auth');

// Todas las rutas de productos requieren autenticación
router.use(verificarToken);

router.get('/',       getProductos);
router.get('/:id',    getProductoPorId);
router.post('/',      crearProducto);
router.put('/:id',    actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
