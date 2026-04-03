// ============================================================
// src/controllers/facturacionController.js
// ============================================================
const Facturacion = require('../models/Facturacion');
const Mesa = require('../models/Mesa');
const Comanda = require('../models/Comanda');
const Contador = require('../models/Contador');

// ── GET /api/facturacion — Obtener facturas ──────────────────
const getFacturas = async (req, res) => {
  try {
    const facturas = await Facturacion.find()
      .populate('id_cliente', 'nombre apellido numero_documento')
      .populate('id_comanda')
      .sort({ createdAt: -1 });
    res.json(facturas);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener facturas.', error: err.message });
  }
};

// ── GET /api/facturacion/:id ─────────────────────────────────
const getFacturaPorId = async (req, res) => {
  try {
    const factura = await Facturacion.findById(req.params.id)
      .populate('id_cliente', 'nombre apellido tipo_documento numero_documento direccion')
      .populate({ path: 'id_comanda', populate: { path: 'id_mesa', select: 'numero_mesa' } });
    if (!factura) return res.status(404).json({ message: 'Factura no encontrada.' });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener factura.', error: err.message });
  }
};

// ── POST /api/facturacion ────────────────────────────────────
// Procesa el pago, cuenta secuencias, limpia la mesa si existe y retorna objeto Factura
const crearFactura = async (req, res) => {
  try {
    // 1. Obtener correlativo secuencial para No. Factura
    const counter = await Contador.findOneAndUpdate(
      { concepto: 'factura' },
      { $inc: { contador: 1 } },
      { new: true, upsert: true }
    );

    const nuevaData = {
      ...req.body,
      numero_factura: counter.contador
    };

    const factura = new Facturacion(nuevaData);
    await factura.save();

    // Si la factura provino de una comanda asociada a una mesa, liberar mesa.
    if (req.body.id_comanda) {
      // Liberar y desvincular mesa para recibir nuevos cobros y clientes
      await Mesa.findOneAndUpdate(
        { pedido_actual: req.body.id_comanda },
        { estado: 'disponible', pedido_actual: null }
      );
      
      // Marcar orden (comanda) como concluida/facturada
      await Comanda.findByIdAndUpdate(req.body.id_comanda, { facturada: true });
    }

    const populated = await factura.populate('id_cliente');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar la factura.', error: err.message });
  }
};

module.exports = {
  getFacturas,
  getFacturaPorId,
  crearFactura,
};
