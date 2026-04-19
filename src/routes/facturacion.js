// ============================================================
// src/routes/facturacion.js
// ============================================================
const router = require('express').Router();
const { verificarToken, verificarMasterKey } = require('../middlewares/auth');
const facturacionController = require('../controllers/facturacionController');

router.use(verificarToken);

router.get('/', facturacionController.getFacturas);
router.get('/comanda/:comandaId', facturacionController.getFacturaPorComanda);
router.get('/:id', facturacionController.getFacturaPorId);
router.post('/', facturacionController.crearFactura);
router.delete('/:id', verificarMasterKey, facturacionController.eliminarFactura);

module.exports = router;
