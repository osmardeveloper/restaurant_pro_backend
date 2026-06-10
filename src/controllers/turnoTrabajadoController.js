// ============================================================
// src/controllers/turnoTrabajadoController.js — CRUD de Turnos Trabajados
// ============================================================
const TurnoTrabajado = require('../models/TurnoTrabajado');
const Usuario = require('../models/Usuario');

// ── GET /api/turnos-trabajados — Obtener todos los registros ──────────
const getTurnosTrabajados = async (req, res) => {
  try {
    const registros = await TurnoTrabajado.find()
      .populate('usuarioId', 'nombre rol')
      .sort({ mes: -1, 'usuarioId.nombre': 1 });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los turnos trabajados.', error: err.message });
  }
};

// ── GET /api/turnos-trabajados/:id — Obtener registro por ID ──────────
const getTurnoTrabajadoPorId = async (req, res) => {
  try {
    const registro = await TurnoTrabajado.findById(req.params.id)
      .populate('usuarioId', 'nombre rol');
    if (!registro) {
      return res.status(404).json({ message: 'Registro de turnos no encontrado.' });
    }
    res.json(registro);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el registro de turnos.', error: err.message });
  }
};

// ── GET /api/turnos-trabajados/usuario/:usuarioId/mes/:mes — Obtener por usuario y mes ──────────
const getTurnoTrabajadoPorUsuarioYMes = async (req, res) => {
  try {
    const { usuarioId, mes } = req.params;
    
    // Validar formato del mes
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ message: 'El formato del mes debe ser YYYY-MM.' });
    }

    const registro = await TurnoTrabajado.findOne({ usuarioId, mes })
      .populate('usuarioId', 'nombre rol');
      
    if (!registro) {
      // Devolver un objeto vacío o indicar que no existe para que el front lo maneje
      return res.status(200).json(null);
    }
    
    res.json(registro);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el registro de turnos por usuario y mes.', error: err.message });
  }
};

// ── POST /api/turnos-trabajados — Crear nuevo registro (Valida duplicados) ─────────────────
const crearOActualizarTurnoTrabajado = async (req, res) => {
  try {
    const { usuarioId, mes, diasTrabajados } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio.' });
    }
    if (!mes) {
      return res.status(400).json({ message: 'El mes es obligatorio.' });
    }
    if (!Array.isArray(diasTrabajados)) {
      return res.status(400).json({ message: 'Los días trabajados deben ser un arreglo de números.' });
    }

    // Verificar que el usuario exista
    const usuarioExiste = await Usuario.findById(usuarioId);
    if (!usuarioExiste) {
      return res.status(404).json({ message: 'El usuario especificado no existe.' });
    }

    // Validar duplicado
    const existe = await TurnoTrabajado.findOne({ usuarioId, mes });
    if (existe) {
      return res.status(400).json({ message: 'Ya existe un registro de turnos para este usuario en el mes seleccionado.' });
    }

    const nuevoRegistro = new TurnoTrabajado({ usuarioId, mes, diasTrabajados });
    await nuevoRegistro.save();

    const registroPoblado = await TurnoTrabajado.findById(nuevoRegistro._id)
      .populate('usuarioId', 'nombre rol');

    res.status(201).json(registroPoblado);
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar los turnos trabajados.', error: err.message });
  }
};

// ── PUT /api/turnos-trabajados/:id — Actualizar registro por ID ───────────────
const actualizarTurnoTrabajado = async (req, res) => {
  try {
    const { diasTrabajados, mes, usuarioId } = req.body;
    
    // Obtener el registro actual
    const registro = await TurnoTrabajado.findById(req.params.id);
    if (!registro) {
      return res.status(404).json({ message: 'Registro de turnos no encontrado.' });
    }

    // Si se intentan cambiar usuarioId o mes, verificar duplicados
    const targetUsuarioId = usuarioId || registro.usuarioId;
    const targetMes = mes || registro.mes;

    if (usuarioId || mes) {
      // Verificar que el usuario exista
      const usuarioExiste = await Usuario.findById(targetUsuarioId);
      if (!usuarioExiste) {
        return res.status(404).json({ message: 'El usuario especificado no existe.' });
      }

      const duplicado = await TurnoTrabajado.findOne({ 
        usuarioId: targetUsuarioId, 
        mes: targetMes,
        _id: { $ne: req.params.id }
      });
      if (duplicado) {
        return res.status(400).json({ message: 'Ya existe un registro de turnos para este usuario en el mes seleccionado.' });
      }
    }

    if (usuarioId) registro.usuarioId = usuarioId;
    if (mes) registro.mes = mes;
    if (diasTrabajados) registro.diasTrabajados = diasTrabajados;

    await registro.save();
    
    const registroPoblado = await TurnoTrabajado.findById(registro._id)
      .populate('usuarioId', 'nombre rol');

    res.json(registroPoblado);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el registro de turnos.', error: err.message });
  }
};

// ── DELETE /api/turnos-trabajados/:id — Eliminar registro ──────────────
const eliminarTurnoTrabajado = async (req, res) => {
  try {
    const registro = await TurnoTrabajado.findByIdAndDelete(req.params.id);
    if (!registro) {
      return res.status(404).json({ message: 'Registro de turnos no encontrado.' });
    }
    res.json({ message: 'Registro de turnos eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el registro de turnos.', error: err.message });
  }
};

module.exports = {
  getTurnosTrabajados,
  getTurnoTrabajadoPorId,
  getTurnoTrabajadoPorUsuarioYMes,
  crearOActualizarTurnoTrabajado,
  actualizarTurnoTrabajado,
  eliminarTurnoTrabajado,
};
