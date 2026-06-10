// ============================================================
// src/models/TurnoTrabajado.js — Modelo de Turnos Trabajados
// ============================================================
const mongoose = require('mongoose');

const turnoTrabajadoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es obligatorio'],
    },
    mes: {
      type: String, // Formato "YYYY-MM"
      required: [true, 'El mes es obligatorio'],
      validate: {
        validator: function(v) {
          return /^\d{4}-\d{2}$/.test(v);
        },
        message: props => `${props.value} no es un formato de mes válido (YYYY-MM)`
      }
    },
    diasTrabajados: {
      type: [Number], // Array de días trabajados, ej: [1, 2, 5, 12...]
      default: [],
      validate: {
        validator: function(arr) {
          return arr.every(day => day >= 1 && day <= 31);
        },
        message: 'Los días trabajados deben ser números válidos entre 1 y 31'
      }
    }
  },
  { timestamps: true }
);

// Índice compuesto único para evitar registros duplicados del mismo usuario en el mismo mes
turnoTrabajadoSchema.index({ usuarioId: 1, mes: 1 }, { unique: true });

module.exports = mongoose.model('TurnoTrabajado', turnoTrabajadoSchema);
