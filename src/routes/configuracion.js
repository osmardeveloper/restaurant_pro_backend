const express = require('express');
const router = express.Router();
const configsCtrl = require('../controllers/configuracionController');

// Obtener por usuario
router.get('/usuario/:id_usuario', configsCtrl.getConfigByUser);

// Crear/Actualizar
router.post('/', configsCtrl.saveConfig);

module.exports = router;
