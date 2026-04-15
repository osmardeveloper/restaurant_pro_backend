// ============================================================
// src/models/Costo.js — Modelo para registros de Costos
// ============================================================
const mongoose = require('mongoose');

const costoSchema = new mongoose.Schema(
  {
    numero_costo: {
      type: Number,
      required: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del costo es obligatorio'],
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

module.exports = mongoose.model('Costo', costoSchema);
