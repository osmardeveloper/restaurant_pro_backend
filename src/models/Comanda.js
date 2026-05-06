// ============================================================
// src/models/Comanda.js — Modelo de Comanda (orden)
// ============================================================
const mongoose = require('mongoose');

const comandaSchema = new mongoose.Schema(
  {
    id_mesa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mesa',
    },
    id_cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
    },
    ids_productos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
      },
    ],
    facturada: {
      type: Boolean,
      default: false,
    },
    a_domicilio: {
      type: Boolean,
      default: false,
    },
    direccion_entrega: {
      type: String,
      trim: true,
      default: ''
    },
    observaciones: {
      type: String,
      trim: true,
      default: ''
    },
    monto_domicilio: {
      type: Number,
      default: 0,
      min: 0
    },
    venta_directa: {
      type: Boolean,
      default: false
    },
    id_factura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facturacion',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comanda', comandaSchema);
