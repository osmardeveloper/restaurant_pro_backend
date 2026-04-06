// ============================================================
// src/routes/clientes.js — Rutas de Clientes
// ============================================================
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken, verificarMasterKey } = require('../middlewares/auth');

// Todas estas rutas requieren estar autenticado
router.use(verificarToken);

router.get('/', clienteController.getClientes);
router.get('/:id', clienteController.getClientePorId);
router.post('/', clienteController.crearCliente);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', verificarMasterKey, clienteController.eliminarCliente);

module.exports = router;
