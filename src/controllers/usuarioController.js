// ============================================================
// src/controllers/usuarioController.js — CRUD de Usuarios
// ============================================================
const Usuario = require('../models/Usuario');

// ── GET /api/usuarios — Obtener todos los usuarios ──────────
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: err.message });
  }
};

// ── GET /api/usuarios/:id — Obtener usuario por ID ──────────
const getUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el usuario.', error: err.message });
  }
};

// ── POST /api/usuarios — Crear nuevo usuario ─────────────────
const crearUsuario = async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;

    // Convertir nombre a minúscula
    const nombreMinuscula = nombre.toLowerCase();

    // Verificar que el nombre no esté en uso
    const existe = await Usuario.findOne({ nombre: nombreMinuscula });
    if (existe) return res.status(400).json({ message: 'El nombre de usuario ya existe.' });

    const usuario = new Usuario({ nombre: nombreMinuscula, password, rol });
    await usuario.save(); // El hook pre-save encripta la contraseña

    res.status(201).json(usuario); // toJSON() oculta el password
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el usuario.', error: err.message });
  }
};

// ── PUT /api/usuarios/:id — Actualizar usuario ───────────────
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // Actualizar solo los campos enviados
    if (nombre)   usuario.nombre = nombre.toLowerCase();
    if (rol)      usuario.rol    = rol;
    if (password) usuario.password = password; // El hook pre-save lo volverá a encriptar

    await usuario.save();
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el usuario.', error: err.message });
  }
};

// ── DELETE /api/usuarios/:id — Eliminar usuario ──────────────
const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el usuario.', error: err.message });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
