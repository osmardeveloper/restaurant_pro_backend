// ============================================================
// src/middlewares/auth.js — Middleware de verificación JWT
// ============================================================
const jwt = require('jsonwebtoken');

/**
 * Middleware que protege rutas verificando el token JWT
 * Agrega req.usuario con los datos del token si es válido
 */
const verificarToken = (req, res, next) => {
  // El token llega en el header Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, nombre, rol }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = { verificarToken };
