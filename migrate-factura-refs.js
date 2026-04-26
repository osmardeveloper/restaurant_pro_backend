// ============================================================
// migrate-factura-refs.js — Script de migración
// Asocia facturas existentes con sus comandas
// ============================================================
require('dotenv').config();
const mongoose = require('mongoose');
const Facturacion = require('./src/models/Facturacion');
const Comanda = require('./src/models/Comanda');

async function migrate() {
  try {
    console.log('🔄 Iniciando migración...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurante');
    console.log('✓ Conectado a MongoDB');

    // Obtener todas las facturas que tienen id_comanda
    const facturas = await Facturacion.find({ id_comanda: { $exists: true, $ne: null } });
    console.log(`📊 Encontradas ${facturas.length} facturas con id_comanda`);

    let actualizadas = 0;
    for (const factura of facturas) {
      try {
        // Actualizar la comanda para que tenga referencia a la factura
        const resultado = await Comanda.findByIdAndUpdate(
          factura.id_comanda,
          { id_factura: factura._id },
          { new: true }
        );
        
        if (resultado) {
          actualizadas++;
          if (actualizadas % 10 === 0) {
            console.log(`✓ Procesadas ${actualizadas} comandas...`);
          }
        }
      } catch (err) {
        console.error(`✗ Error al actualizar comanda ${factura.id_comanda}:`, err.message);
      }
    }

    console.log(`\n✅ Migración completada!`);
    console.log(`📝 Comandas actualizadas: ${actualizadas}/${facturas.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  }
}

migrate();
