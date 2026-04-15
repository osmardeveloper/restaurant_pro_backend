// ============================================================
// src/routes/costos.js
// ============================================================
const express = require('express');
const router = express.Router();
const costoController = require('../controllers/costoController');
const { verificarToken, verificarMasterKey } = require('../middlewares/auth');

router.get('/', verificarToken, costoController.getCostos);
router.post('/', verificarToken, costoController.crearCosto);
router.put('/:id', verificarToken, costoController.actualizarCosto);
router.delete('/:id', verificarToken, verificarMasterKey, costoController.eliminarCosto);

module.exports = router;
