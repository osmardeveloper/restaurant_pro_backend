// ============================================================
// src/routes/reservas.js
// ============================================================
const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const {
  getReservas,
  getReservaPorId,
  crearReserva,
  actualizarReserva,
  eliminarReserva,
} = require('../controllers/reservaController');

router.use(verificarToken);

router.get('/', getReservas);
router.get('/:id', getReservaPorId);
router.post('/', crearReserva);
router.put('/:id', actualizarReserva);
router.delete('/:id', eliminarReserva);

module.exports = router;
