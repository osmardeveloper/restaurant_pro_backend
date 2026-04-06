// ============================================================
// server.js — Punto de entrada del backend
// ============================================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();

// ── Middlewares globales ─────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Importar rutas ──────────────────────────────────────────
const authRoutes     = require('./src/routes/auth');
const usuarioRoutes  = require('./src/routes/usuarios');
const productoRoutes = require('./src/routes/productos');
const mesaRoutes     = require('./src/routes/mesas');
const comandaRoutes  = require('./src/routes/comandas');
const clienteRoutes  = require('./src/routes/clientes');
const facturacionRoutes = require('./src/routes/facturacion');
const gastoRoutes    = require('./src/routes/gastos');
const configuracionRoutes = require('./src/routes/configuracion');
const movimientoRoutes = require('./src/routes/movimientoRoutes');

// ── Montar rutas ────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/mesas',    mesaRoutes);
app.use('/api/comandas', comandaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/facturacion', facturacionRoutes);
app.use('/api/gastos',   gastoRoutes);
app.use('/api/configuraciones', configuracionRoutes);
app.use('/api/inventario', movimientoRoutes);

// ── Ruta de salud ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🍽️  Restaurant API funcionando correctamente' });
});

// ── Conexión a MongoDB y arranque del servidor ───────────────
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB conectado correctamente');
    app.listen(PORT, () => {
      console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
