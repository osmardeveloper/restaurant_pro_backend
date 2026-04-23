// ============================================================
// src/models/AuditoriaFacturacion.js — Historial de Facturas Eliminadas
// ============================================================
const mongoose = require('mongoose');

const auditoriaFacturacionSchema = new mongoose.Schema(
  {
    id_factura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facturacion',
      required: true,
    },
    numero_factura: {
      type: Number,
      required: true,
    },
    id_usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    motivo_eliminacion: {
      type: String,
      required: [true, 'El motivo de eliminación es obligatorio'],
      trim: true,
    },
    fecha_eliminacion: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditoriaFacturacion', auditoriaFacturacionSchema);
