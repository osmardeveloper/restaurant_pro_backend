const Configuracion = require('../models/Configuracion');

/**
 * Obtener configuración (permisos) por ID de usuario
 */
const getConfigByUser = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const config = await Configuracion.findOne({ id_usuario });
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada para este usuario.' });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Guardar o actualizar configuración (permisos) de un usuario
 */
const saveConfig = async (req, res) => {
  try {
    const { id_usuario, tipo, subtipo, detalles } = req.body;

    let config = await Configuracion.findOne({ id_usuario });

    if (config) {
      // Actualizar existente
      config.tipo = tipo || config.tipo;
      config.subtipo = subtipo || config.subtipo;
      config.detalles = detalles || config.detalles;
      await config.save();
    } else {
      // Crear nueva
      config = new Configuracion({ id_usuario, tipo, subtipo, detalles });
      await config.save();
    }

    res.json(config);
  } catch (err) {
    res.status(400).json({ message: 'Error al guardar la configuración.' });
  }
};

module.exports = {
  getConfigByUser,
  saveConfig
};
