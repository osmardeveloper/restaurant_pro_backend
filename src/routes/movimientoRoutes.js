// ============================================================
// src/routes/movimientoRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const { getMovimientos, crearMovimiento } = require('../controllers/movimientoController');
const { verificarToken } = require('../middlewares/auth');

// Rutas de Inventario
router.get('/',  verificarToken, getMovimientos);
router.post('/', verificarToken, crearMovimiento);

module.exports = router;
