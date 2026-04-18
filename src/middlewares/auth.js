// ============================================================
// src/middlewares/auth.js — Middleware de verificación JWT
// ============================================================
const jwt = require('jsonwebtoken');

/**
 * Middleware que protege rutas verificando el token JWT
 * Agrega req.usuario con los datos del token si es válido
 */
/**
 * Middleware que protege rutas verificando el token JWT
 * Agrega req.usuario con los datos del token si es válido
 */
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token de acceso no solicitado o faltante.' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.', error: err.message });
  }
};

/**
 * Middleware que verifica una Clave Maestra establecida en el .env
 * Se usa para operaciones sensibles como eliminaciones
 */
const verificarMasterKey = (req, res, next) => {
  const masterKey = req.headers['x-master-key'];
  const expectedKey = process.env.MASTER_KEY;

  if (!masterKey || masterKey !== expectedKey) {
    return res.status(403).json({ message: 'Clave Maestra de seguridad incorrecta o no proporcionada.' });
  }
  next();
};

/**
 * Middleware que verifica que el usuario no sea 'cocina' (rol de solo lectura)
 * Se usa en operaciones de actualización/edición
 */
const verificarNoEsCocina = (req, res, next) => {
  if (req.usuario?.rol === 'cocina') {
    return res.status(403).json({ message: 'Los usuarios de cocina solo pueden visualizar, no editar.' });
  }
  next();
};

/**
 * Middleware que verifica que el usuario sea 'admin'
 * Se usa en operaciones sensibles que solo admin debe poder realizar
 */
const verificarSoloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ message: 'Esta operación solo está permitida para administradores.' });
  }
  next();
};

module.exports = { verificarToken, verificarMasterKey, verificarNoEsCocina, verificarSoloAdmin };
