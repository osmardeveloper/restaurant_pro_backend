// ============================================================
// cleanup-categorias.js — Limpiar índices duplicados y documentos inválidos
// ============================================================
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const CategoriasProductos = require('./src/models/CategoriasProductos');

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');

    try {
      // Paso 1: Obtener info de índices
      const collection = mongoose.connection.collection('categoriasproductos');
      console.log('\n📋 Índices actuales:');
      const indices = await collection.getIndexes();
      console.log(JSON.stringify(indices, null, 2));

      // Paso 2: Eliminar índice de 'nombre' si existe
      if (indices.nombre_1) {
        console.log('\n🗑️  Eliminando índice antiguo "nombre"...');
        await collection.dropIndex('nombre_1');
        console.log('✅ Índice "nombre" eliminado');
      } else {
        console.log('\n✅ No hay índice "nombre" para eliminar');
      }

      // Paso 3: Buscar documentos inválidos
      console.log('\n📋 Buscando documentos sin estructura válida...');
      const docsInvalidos = await CategoriasProductos.find({
        $or: [
          { 'detalles.label': { $exists: false } },
          { 'detalles.value': { $exists: false } },
        ]
      });

      if (docsInvalidos.length > 0) {
        console.log(`⚠️  Encontrados ${docsInvalidos.length} documentos inválidos:`);
        docsInvalidos.forEach(doc => {
          console.log(`   - ${doc._id}: ${JSON.stringify(doc)}`);
        });

        console.log('\n🗑️  Eliminando documentos inválidos...');
        await CategoriasProductos.deleteMany({
          $or: [
            { 'detalles.label': { $exists: false } },
            { 'detalles.value': { $exists: false } },
          ]
        });
        console.log(`✅ ${docsInvalidos.length} documentos inválidos eliminados`);
      } else {
        console.log('✅ No hay documentos inválidos');
      }

      // Paso 4: Mostrar documentos válidos restantes
      console.log('\n📋 Categorías válidas en la base de datos:');
      const docsValidos = await CategoriasProductos.find();
      if (docsValidos.length > 0) {
        docsValidos.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.detalles.label} (${doc.detalles.value}) - Estado: ${doc.activa ? '✅ Activa' : '❌ Inactiva'}`);
        });
      } else {
        console.log('   (Ninguna)');
      }

      console.log('\n🎉 Limpieza completada exitosamente. Ahora puedes crear nuevas categorías sin problemas.');

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
