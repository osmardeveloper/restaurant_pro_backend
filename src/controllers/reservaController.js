// ============================================================
// src/controllers/reservaController.js — CRUD de Reservas
// ============================================================
const Reserva = require('../models/Reserva');
const Mesa = require('../models/Mesa');

const normalizarMesas = (mesas = []) => [...new Set(mesas.filter(Boolean).map(String))];

const reservarMesasOcupadas = async (datos, excluirId = null) => {
  const horaEnMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  let reservas = await Reserva.find({
    dia: datos.dia,
    mesas: { $in: datos.mesas },
  })
    .populate('mesas', 'numero_mesa')
    .lean();

  if (excluirId) {
    reservas = reservas.filter(r => String(r._id) !== String(excluirId));
  }

  const nuevaHoraInicio = horaEnMinutos(datos.hora_inicio);
  const nuevaHoraFin = horaEnMinutos(datos.hora_fin);

  for (const reserva of reservas) {
    const horaExistenteInicio = horaEnMinutos(reserva.hora_inicio);
    const horaExistenteFin = horaEnMinutos(reserva.hora_fin);

    // Verificar si hay solapamiento
    if (nuevaHoraInicio < horaExistenteFin && nuevaHoraFin > horaExistenteInicio) {
      return reserva;
    }
  }

  return null;
};

const construirFiltroFecha = (desde, hasta) => {
  const filtro = {};

  if (desde || hasta) {
    filtro.dia = {};
    if (desde) filtro.dia.$gte = desde;
    if (hasta) filtro.dia.$lte = hasta;
  }

  return filtro;
};

const poblarReserva = async (reserva) => {
  const lista = Array.isArray(reserva) ? reserva : [reserva];
  return lista.map((item) => {
    const obj = item.toObject ? item.toObject() : item;
    return obj;
  });
};

const getReservas = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const filtro = construirFiltroFecha(desde, hasta);

    const reservas = await Reserva.find(filtro)
      .populate('mesas', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido telefono tipo_documento')
      .sort({ dia: 1, hora_inicio: 1, createdAt: -1 });

    res.json(await poblarReserva(reservas));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las reservas.', error: err.message });
  }
};

const getReservaPorId = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('mesas', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido telefono tipo_documento');
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });
    res.json((await poblarReserva(reserva))[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la reserva.', error: err.message });
  }
};

const crearReserva = async (req, res) => {
  try {
    const datos = {
      ...req.body,
      mesas: Array.isArray(req.body.mesas) ? normalizarMesas(req.body.mesas) : [],
    };

    if (datos.mesas.length === 0) {
      return res.status(400).json({ message: 'Debes seleccionar al menos una mesa.' });
    }

    if (!datos.id_cliente) {
      return res.status(400).json({ message: 'Debes seleccionar un cliente.' });
    }

    const conflicto = await reservarMesasOcupadas(datos);
    if (conflicto) {
      return res.status(409).json({
        message: 'Una o más mesas ya tienen reserva para esa fecha y hora.',
        conflicto: {
          id: conflicto._id,
          dia: conflicto.dia,
          hora_inicio: conflicto.hora_inicio,
          hora_fin: conflicto.hora_fin,
        },
      });
    }

    const reserva = new Reserva(datos);
    await reserva.save();

    const reservaPoblada = await Reserva.findById(reserva._id)
      .populate('mesas', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido telefono tipo_documento');
    res.status(201).json(reservaPoblada);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear la reserva.', error: err.message });
  }
};

const actualizarReserva = async (req, res) => {
  try {
    const datos = {
      ...req.body,
      mesas: Array.isArray(req.body.mesas) ? normalizarMesas(req.body.mesas) : [],
    };

    if (datos.mesas.length === 0) {
      return res.status(400).json({ message: 'Debes seleccionar al menos una mesa.' });
    }

    if (!datos.id_cliente) {
      return res.status(400).json({ message: 'Debes seleccionar un cliente.' });
    }

    const conflicto = await reservarMesasOcupadas(datos, req.params.id);
    if (conflicto) {
      return res.status(409).json({
        message: 'Una o más mesas ya tienen reserva para esa fecha y hora.',
        conflicto: {
          id: conflicto._id,
          dia: conflicto.dia,
          hora: conflicto.hora,
        },
      });
    }

    const reserva = await Reserva.findByIdAndUpdate(req.params.id, datos, {
      new: true,
      runValidators: true,
    })
      .populate('mesas', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido telefono tipo_documento');

    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });
    res.json(reserva);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar la reserva.', error: err.message });
  }
};

const eliminarReserva = async (req, res) => {
  try {
    // Obtener la reserva antes de eliminarla
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });
    
    // Si la reserva tiene mesas asociadas, limpiar sus observaciones
    if (reserva.mesas && reserva.mesas.length > 0) {
      await Mesa.updateMany(
        { _id: { $in: reserva.mesas } },
        { observaciones: '' }
      );
    }
    
    // Ahora eliminar la reserva
    await Reserva.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reserva eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la reserva.', error: err.message });
  }
};

module.exports = {
  getReservas,
  getReservaPorId,
  crearReserva,
  actualizarReserva,
  eliminarReserva,
};
