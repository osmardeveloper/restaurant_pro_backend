// ============================================================
// src/routes/gastos.js
// ============================================================
const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const { verificarToken, verificarMasterKey } = require('../middlewares/auth');

router.get('/', verificarToken, gastoController.getGastos);
router.post('/', verificarToken, gastoController.crearGasto);
router.put('/:id', verificarToken, gastoController.actualizarGasto);
router.delete('/:id', verificarToken, verificarMasterKey, gastoController.eliminarGasto);

module.exports = router;
