// ============================================================
// src/routes/gastos.js
// ============================================================
const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
// const { protect } = require('../middlewares/authMiddleware'); 
// Asumiendo que el middleware global o la arquitectura actual no protege fuertemente routers individuales si no se indica

router.get('/', gastoController.getGastos);
router.post('/', gastoController.crearGasto);
router.put('/:id', gastoController.actualizarGasto);
router.delete('/:id', gastoController.eliminarGasto);

module.exports = router;
