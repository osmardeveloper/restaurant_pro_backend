// ============================================================
// src/controllers/authController.js — Autenticación con JWT
// ============================================================
const jwt      = require('jsonwebtoken');
const Usuario  = require('../models/Usuario');

/**
 * POST /api/auth/login
 * Valida credenciales y devuelve un JWT firmado
 */
const login = async (req, res) => {
  try {
    const { nombre, password } = req.body;

    if (!nombre || !password) {
      return res.status(400).json({ message: 'Nombre y contraseña son requeridos.' });
    }

    // Buscar usuario por nombre
    const usuario = await Usuario.findOne({ nombre });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Comparar contraseña
    const esValida = await usuario.compararPassword(password);
    if (!esValida) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Generar JWT con expiración de 8 horas
    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id:     usuario._id,
        nombre: usuario.nombre,
        rol:    usuario.rol,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor.', error: err.message });
  }
};

module.exports = { login };
