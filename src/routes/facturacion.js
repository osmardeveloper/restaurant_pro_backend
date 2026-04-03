// ============================================================
// src/routes/facturacion.js
// ============================================================
const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const facturacionController = require('../controllers/facturacionController');

router.use(verificarToken);

router.get('/', facturacionController.getFacturas);
router.get('/:id', facturacionController.getFacturaPorId);
router.post('/', facturacionController.crearFactura);

module.exports = router;
