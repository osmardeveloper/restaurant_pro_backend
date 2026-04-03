// ============================================================
// src/models/Mesa.js — Modelo de Mesa del restaurante
// ============================================================
const mongoose = require('mongoose');

const mesaSchema = new mongoose.Schema(
  {
    numero_mesa: {
      type: Number,
      required: [true, 'El número de mesa es obligatorio'],
      unique: true,
      min: 1,
    },
    estado: {
      type: String,
      enum: ['disponible', 'pedido tomado'],
      default: 'disponible',
    },
    // Referencia a un Documento Comanda
    pedido_actual: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comanda',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mesa', mesaSchema);
