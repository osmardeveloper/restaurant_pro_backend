// ============================================================
// verify-admin.js — Verificar y cambiar rol de usuario a admin
// ============================================================
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Usuario = require('./src/models/Usuario');

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');

    try {
      // Buscar si existe el usuario admin
      const admin = await Usuario.findOne({ nombre: 'admin' });

      if (admin) {
        console.log(`\n📋 Usuario encontrado: ${admin.nombre}`);
        console.log(`   Rol actual: ${admin.rol}`);
        console.log(`   ID: ${admin._id}`);

        if (admin.rol === 'admin') {
          console.log('\n✅ El usuario "admin" ya tiene rol de administrador.');
        } else {
          console.log(`\n⚠️  El usuario "admin" tiene rol: ${admin.rol}`);
          console.log('   Cambiando a rol admin...');
          
          admin.rol = 'admin';
          await admin.save();
          console.log('✅ Rol actualizado a admin');
        }
      } else {
        console.log('❌ Usuario "admin" no encontrado en la base de datos');
        console.log('   Crea un usuario primero usando create-admin.js');
      }

      // Listar todos los usuarios
      console.log('\n📋 Todos los usuarios en la base de datos:');
      const usuarios = await Usuario.find().select('nombre rol').exec();
      usuarios.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.nombre} - Rol: ${u.rol}`);
      });

    } catch (err) {
      console.error('❌ Error:', err.message);
    } finally {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
