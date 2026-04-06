// ============================================================
// src/models/Usuario.js — Modelo de Usuario con bcrypt
// ============================================================
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 4,
    },
    rol: {
      type: String,
      enum: ['admin', 'mesero', 'cocina', 'cajero'],
      default: 'mesero',
    },
  },
  { timestamps: true }
);

// ── Hook pre-save: encriptar contraseña antes de guardar ─────
usuarioSchema.pre('save', async function (next) {
  // Solo encriptar si el campo password fue modificado
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Método de instancia: comparar contraseña ─────────────────
usuarioSchema.methods.compararPassword = async function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

// Ocultar password en respuestas JSON
usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Usuario', usuarioSchema);
