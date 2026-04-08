// ============================================================
// src/models/Facturacion.js — Modelo de Cierres de Venta / Facturación
// ============================================================
const mongoose = require('mongoose');

const facturacionSchema = new mongoose.Schema(
  {
    numero_factura: {
      type: Number,
      required: true,
      unique: true,
    },
    metodo_pago: {
      type: String,
      enum: ['bancolombia', 'nequi', 'efectivo', 'daviplata', 'datafono'],
      required: [true, 'El método de pago es obligatorio'],
    },
    total_pagado: {
      type: Number,
      required: [true, 'El total pagado es obligatorio'],
      min: 0,
    },
    // Array estático con una instantánea del momento de compra
    detalle_pedido: [
      {
        id_producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
        nombre: { type: String, required: true },
        precio: { type: Number, required: true },
        costo: { type: Number, default: null },
        cantidad: { type: Number, default: 1 },
      },
    ],
    id_cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      default: null,
    },
    id_comanda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comanda',
      default: null,
    },
    fecha_emision: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facturacion', facturacionSchema);
