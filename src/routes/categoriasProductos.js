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

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/',       getCategorias);
router.get('/:id',    getCategoriaPorId);
router.post('/',      verificarSoloAdmin, crearCategoria);
router.put('/:id',    verificarSoloAdmin, actualizarCategoria);
router.delete('/:id', verificarSoloAdmin, verificarMasterKey, eliminarCategoria);

module.exports = router;
