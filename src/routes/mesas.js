// ============================================================
// src/routes/mesas.js
// ============================================================
const router = require('express').Router();
const { verificarToken, verificarMasterKey } = require('../middlewares/auth');
const {
  getMesas,
  getMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
} = require('../controllers/mesaController');

router.get('/',    verificarToken, getMesas);
router.get('/:id', verificarToken, getMesaPorId);
router.post('/',   verificarToken, crearMesa);
router.put('/:id', verificarToken, actualizarMesa);
router.delete('/:id', verificarToken, verificarMasterKey, eliminarMesa);

module.exports = router;
