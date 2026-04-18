// ============================================================
// src/models/CategoriasProductos.js — Modelo de Categorías de Productos
// ============================================================
const mongoose = require('mongoose');

const CategoriaProductoSchema = new mongoose.Schema(
  {
    detalles: {
      label: {
        type: String,
        required: [true, 'El label de la categoría es obligatorio'],
        trim: true,
        minlength: [2, 'El label debe tener mínimo 2 caracteres'],
        maxlength: [100, 'El label no puede exceder 100 caracteres'],
      },
      value: {
        type: String,
        required: [true, 'El value de la categoría es obligatorio'],
        lowercase: true,
        trim: true,
        unique: true,
        minlength: [2, 'El value debe tener mínimo 2 caracteres'],
        maxlength: [100, 'El value no puede exceder 100 caracteres'],
      },
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CategoriasProductos', CategoriaProductoSchema);
