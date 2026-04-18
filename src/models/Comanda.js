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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comanda', comandaSchema);
