// ============================================================
// src/models/Cliente.js — Modelo de Cliente
// ============================================================
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      default: ''
    },
    apellido: {
      type: String,
      trim: true,
      default: ''
    },
    telefono: {
      type: String,
      trim: true,
      default: ''
    },
    tipo_documento: {
      type: String,
      enum: {
        values: ['cedula_identidad', 'cedula_extranjeria', 'pasaporte', 'documento_extranjero', ''],
        message: '{VALUE} no es un tipo de documento soportado'
      },
      default: ''
    },
    numero_documento: {
      type: String,
      trim: true,
      default: ''
    },
    correo: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cliente', clienteSchema);
