// ============================================================
// src/models/Gasto.js — Modelo para registros de Egresos
// ============================================================
const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema(
  {
    numero_gasto: {
      type: Number,
      required: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del gasto es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    metodo_pago: {
      type: String,
      required: [true, 'El método de pago es obligatorio'],
      enum: ['efectivo', 'bancolombia', 'nequi', 'daviplata', 'datafono'],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: 0,
    },
    id_usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El autor del registro es obligatorio'],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gasto', gastoSchema);
