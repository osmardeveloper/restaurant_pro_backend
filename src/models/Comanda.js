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
        id_producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Producto',
          required: true,
        },
        cantidad: {
          type: Number,
          default: 1,
          min: 1,
        },
        observacion: {
          type: String,
          trim: true,
          default: '',
        },
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
