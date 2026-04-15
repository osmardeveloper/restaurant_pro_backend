const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      default: 'interfaz'
    },
    subtipo: {
      type: String,
      required: true,
      default: 'front'
    },
    detalles: {
      type: Object,
      required: true,
      default: {
        inicio: true,
        clientes: true,
        usuarios: false,
        historia_clinica: true,
        facturacion: true,
        cartera: true,
        abonos: true,
        cierre_caja: true,
        gastos: true,
        costos: true,
        laboratorios: true,
        remisiones: true,
        productos: true,
        cumpleaneros: true,
        sucursales: true
      }
    },
    id_usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Configuracion', configuracionSchema);
