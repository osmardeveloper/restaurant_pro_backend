// ============================================================
// src/routes/usuarios.js
// ============================================================
const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const {
  getUsuarios,
  getUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuarioController');

// Todas las rutas de usuarios requieren autenticación
router.get('/',    verificarToken, getUsuarios);
router.get('/:id', verificarToken, getUsuarioPorId);
router.post('/',   verificarToken, crearUsuario);
router.put('/:id', verificarToken, actualizarUsuario);
router.delete('/:id', verificarToken, eliminarUsuario);

module.exports = router;
