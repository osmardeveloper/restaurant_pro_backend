// ============================================================
// reset-stock.js — Resetear cantidad de todos los productos a 0
// ============================================================
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Producto = require('./src/models/Producto');

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');

    try {
      console.log('\n📋 Productos actuales:');
      const productosAntes = await Producto.find().select('nombre cantidad');
      console.log(`Total de productos: ${productosAntes.length}`);
      productosAntes.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre} - Cantidad: ${p.cantidad}`);
      });
      if (productosAntes.length > 5) {
        console.log(`   ... y ${productosAntes.length - 5} más`);
      }

      // Actualizar todos los productos a cantidad 0
      console.log('\n🔄 Actualizando cantidad a 0 para todos los productos...');
      const resultado = await Producto.updateMany(
        {},
        { $set: { cantidad: 0 } }
      );

      console.log(`✅ ${resultado.modifiedCount} productos actualizados`);

      // Verificar que se actualizaron correctamente
      console.log('\n✅ Verificación final:');
      const productosDespues = await Producto.find().select('nombre cantidad');
      const todosEnCero = productosDespues.every(p => p.cantidad === 0);
      
      if (todosEnCero) {
        console.log('✅ Todos los productos están con cantidad: 0');
      } else {
        console.log('⚠️  Algunos productos no tuvieron cantidad 0:');
        productosDespues.filter(p => p.cantidad !== 0).forEach(p => {
          console.log(`   - ${p.nombre}: ${p.cantidad}`);
        });
      }

      console.log('\n🎉 Script completado exitosamente');

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
