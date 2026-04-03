// ============================================================
// seed.js — Script de inicialización de datos
// ============================================================
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Usuario  = require('./src/models/Usuario');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_db';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB para seed');

    // Verificar si ya existe un admin
    const adminExiste = await Usuario.findOne({ rol: 'admin' });

    if (!adminExiste) {
      const admin = new Usuario({
        nombre:   'admin',
        password: 'admin123', // El hook pre-save lo encriptará
        rol:      'admin'
      });
      await admin.save();
      console.log('🚀 Admin creado: admin / admin123');
    } else {
      console.log('ℹ️ Ya existe un usuario admin.');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
  }
};

seed();
