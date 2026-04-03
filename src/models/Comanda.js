// ============================================================
// src/models/Comanda.js — Modelo de Comanda (orden)
// ============================================================
const mongoose = require('mongoose');

const comandaSchema = new mongoose.Schema(
  {
    id_mesa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mesa',
      required: [true, 'La mesa es obligatoria'],
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comanda', comandaSchema);
