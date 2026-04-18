// ============================================================
// src/routes/comandas.js
// ============================================================
const router = require('express').Router();
const { verificarToken, verificarNoEsCocina } = require('../middlewares/auth');
const comandaController = require('../controllers/comandaController');

// Todas estas rutas requieren estar autenticado
router.use(verificarToken);

router.get('/', comandaController.getComanadas);
router.get('/:id', comandaController.getComandaPorId);
router.post('/', comandaController.crearComanda);
router.put('/:id', verificarNoEsCocina, comandaController.actualizarComanda);

module.exports = router;
