// ============================================================
// src/routes/turnosTrabajados.js — Rutas de Turnos Trabajados (Solo Admin)
// ============================================================
const router = require('express').Router();
const { verificarToken, verificarSoloAdmin, verificarMasterKey } = require('../middlewares/auth');
const {
  getTurnosTrabajados,
  getTurnoTrabajadoPorId,
  getTurnoTrabajadoPorUsuarioYMes,
  crearOActualizarTurnoTrabajado,
  actualizarTurnoTrabajado,
  eliminarTurnoTrabajado
} = require('../controllers/turnoTrabajadoController');

// Todas las rutas de turnos trabajados requieren autenticación y rol admin
router.use(verificarToken, verificarSoloAdmin);

router.get('/',                                getTurnosTrabajados);
router.get('/:id',                            getTurnoTrabajadoPorId);
router.get('/usuario/:usuarioId/mes/:mes',    getTurnoTrabajadoPorUsuarioYMes);
router.post('/',                              crearOActualizarTurnoTrabajado);
router.put('/:id',                             actualizarTurnoTrabajado);
router.delete('/:id',                          verificarMasterKey, eliminarTurnoTrabajado);

module.exports = router;
