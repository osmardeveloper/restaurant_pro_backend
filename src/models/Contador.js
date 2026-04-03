// ============================================================
// src/models/Contador.js — Modelo para secuencias automáticas
// ============================================================
const mongoose = require('mongoose');

const contadorSchema = new mongoose.Schema(
  {
    concepto: {
      type:     String,
      required: true,
      unique:   true,
      enum:     ['mesa', 'factura', 'gasto']
    },
    contador: {
      type:     Number,
      default:  0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contador', contadorSchema);
