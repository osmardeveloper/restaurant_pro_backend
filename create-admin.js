// ============================================================
// create-admin.js — Script para crear usuario admin
// ============================================================
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Usuario  = require('./src/models/Usuario');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_db';

const createAdmin = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar admin existente si lo hay
    await Usuario.deleteOne({ nombre: 'admin' });
    console.log('🗑️ Admin anterior eliminado (si existía)');

    // Crear nuevo admin
    const admin = new Usuario({
      nombre:   'admin',
      password: '1234', // Se encriptará automáticamente
      rol:      'admin'
    });
    
    await admin.save();
    console.log('🚀 Admin creado correctamente:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: 1234');
    console.log('   Rol: admin');

    mongoose.connection.close();
    console.log('✅ Conexión cerrada');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createAdmin();
