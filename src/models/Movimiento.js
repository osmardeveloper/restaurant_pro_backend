// ============================================================
// src/models/Movimiento.js — Modelo de Movimientos de Inventario
// ============================================================
const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ['ingreso', 'salida'],
    },
    productos: [
      {
        id_producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Producto',
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: [1, 'La cantidad debe ser al menos 1'],
        },
        nombre: String, // Copia del nombre para historial rápido
      },
    ],
    responsable: {
      type: String,
      required: [true, 'El nombre del responsable es obligatorio'],
    },
    motivo: {
      type: String,
      default: '',
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movimiento', movimientoSchema);
