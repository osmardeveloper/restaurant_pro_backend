// ============================================================
// src/models/Reserva.js — Modelo de Reservas
// ============================================================
const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema(
  {
    cantidad_personas: {
      type: Number,
      required: [true, 'La cantidad de personas es obligatoria'],
      min: 1,
    },
    mesas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mesa',
        required: true,
      },
    ],
    id_cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio'],
    },
    dia: {
      type: String,
      required: [true, 'El día es obligatorio'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'El día debe tener formato YYYY-MM-DD'],
    },
    hora_inicio: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria'],
      trim: true,
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm'],
    },
    hora_fin: {
      type: String,
      required: [true, 'La hora de fin es obligatoria'],
      trim: true,
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm'],
    },
    observaciones: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Validación personalizada: hora_fin debe ser posterior a hora_inicio
reservaSchema.pre('validate', function (next) {
  if (this.hora_inicio && this.hora_fin) {
    const [hI, mI] = this.hora_inicio.split(':').map(Number);
    const [hF, mF] = this.hora_fin.split(':').map(Number);
    const minInicio = hI * 60 + mI;
    const minFin = hF * 60 + mF;

    if (minFin <= minInicio) {
      const err = new Error('La hora de fin debe ser posterior a la hora de inicio.');
      err.path = 'hora_fin';
      this.invalidate('hora_fin', err.message);
    }
  }
  next();
});

module.exports = mongoose.model('Reserva', reservaSchema);
