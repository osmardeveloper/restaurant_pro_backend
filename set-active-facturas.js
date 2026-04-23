// ============================================================
// backend/set-active-facturas.js
// Script para establecer active: true en todas las facturas existentes
// ============================================================

const mongoose = require('mongoose');
require('dotenv').config();

const Facturacion = require('./src/models/Facturacion');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Conectado a MongoDB');
  } catch (err) {
    console.error('✗ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

const setActiveFacturas = async () => {
  try {
    console.log('Actualizando facturas...');
    
    const result = await Facturacion.updateMany(
      { active: { $in: [undefined, null, false] } },
      { $set: { active: true } }
    );

    console.log(`✓ Facturas actualizadas: ${result.modifiedCount}`);
    console.log(`✓ Total facturas con active: true: ${result.matchedCount}`);
    
  } catch (err) {
    console.error('✗ Error actualizando facturas:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');
    process.exit(0);
  }
};

(async () => {
  await connectDB();
  await setActiveFacturas();
})();
