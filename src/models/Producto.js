// ============================================================
// src/models/Producto.js — Modelo maestro de productos
// ============================================================
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    tipo: {
      type: String,
      required: [true, 'El tipo de producto es obligatorio'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [0, 'La cantidad no puede ser negativa'],
      default: 0,
    },
    costo: {
      type: Number,
      min: [0, 'El costo no puede ser negativo'],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Producto', productoSchema);
