// ============================================================
// src/controllers/facturacionController.js
// ============================================================
const Facturacion = require('../models/Facturacion');
const AuditoriaFacturacion = require('../models/AuditoriaFacturacion');
const Mesa = require('../models/Mesa');
const Comanda = require('../models/Comanda');
const Contador = require('../models/Contador');
const Producto = require('../models/Producto');

const METODOS_PAGO = ['bancolombia', 'nequi', 'efectivo', 'daviplata', 'datafono'];

// ── GET /api/facturacion — Obtener facturas ──────────────────
const getFacturas = async (req, res) => {
  try {
    const facturas = await Facturacion.find({ active: true })
      .populate('id_cliente', 'nombre apellido numero_documento')
      .populate({
        path: 'id_comanda',
        populate: { path: 'id_mesa', select: 'numero_mesa' }
      })
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

// ── GET /api/facturacion/comanda/:comandaId ──────────────────
const getFacturaPorComanda = async (req, res) => {
  try {
    const factura = await Facturacion.findOne({ id_comanda: req.params.comandaId })
      .populate('id_cliente', 'nombre apellido tipo_documento numero_documento direccion')
      .populate({ path: 'id_comanda', populate: { path: 'id_mesa', select: 'numero_mesa' } });
    if (!factura) return res.status(404).json({ message: 'Factura no encontrada para esta comanda.' });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener factura.', error: err.message });
  }
};


// ── POST /api/facturacion ────────────────────────────────────
// Procesa el pago, cuenta secuencias, limpia la mesa si existe y retorna objeto Factura
const crearFactura = async (req, res) => {
  try {
    if (req.body.metodo_pago === 'dividido') {
      const pagosParciales = Array.isArray(req.body.pagos_parciales) ? req.body.pagos_parciales : [];
      const totalParciales = pagosParciales.reduce((sum, pago) => sum + Number(pago.monto || 0), 0);
      const totalPagado = Number(req.body.total_pagado || 0);

      if (!pagosParciales.length) {
        return res.status(400).json({ message: 'Debes registrar los pagos parciales de la cuenta dividida.' });
      }

      if (totalParciales !== totalPagado) {
        return res.status(400).json({ message: 'La suma de los pagos parciales debe coincidir con el total de la factura.' });
      }
    }

    const propinas = Array.isArray(req.body.propinas) ? req.body.propinas : [];
    const propinaInvalida = propinas.some(propina =>
      !METODOS_PAGO.includes(propina.metodo_pago) || Number(propina.monto || 0) <= 0
    );

    if (propinaInvalida) {
      return res.status(400).json({ message: 'Cada propina debe tener método de pago válido y monto mayor a cero.' });
    }

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

    // ── DESCONTAR STOCK AUTOMÁTICAMENTE ────────────────────────
    if (req.body.detalle_pedido && req.body.detalle_pedido.length > 0) {
      for (const item of req.body.detalle_pedido) {
        if (item.id_producto) {
          await Producto.findByIdAndUpdate(item.id_producto, {
            $inc: { cantidad: -Number(item.cantidad || 1) }
          });
        }
      }
    }

    const populated = await factura.populate('id_cliente');
    res.status(201).json(populated);
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ message: 'Error al procesar la factura.', error: err.message });
  }
};

// ── DELETE /api/facturacion/:id ──────────────────────────────
const eliminarFactura = async (req, res) => {
  try {
    const { motivo_eliminacion } = req.body;
    // Obtener ID del usuario del token (puede venir en diferentes formatos)
    const id_usuario = req.usuario?._id || req.usuario?.id;

    if (!motivo_eliminacion || !motivo_eliminacion.trim()) {
      return res.status(400).json({ message: 'El motivo de eliminación es obligatorio.' });
    }

    const factura = await Facturacion.findById(req.params.id);
    if (!factura) return res.status(404).json({ message: 'Factura no encontrada.' });

    if (!factura.active) {
      return res.status(400).json({ message: 'Esta factura ya fue eliminada anteriormente.' });
    }

    // ── RESTITUIR STOCK AL INVENTARIO ──────────────────────────
    if (factura.detalle_pedido && factura.detalle_pedido.length > 0) {
      for (const item of factura.detalle_pedido) {
        if (item.id_producto) {
          await Producto.findByIdAndUpdate(item.id_producto, {
            $inc: { cantidad: Number(item.cantidad || 1) }
          });
        }
      }
    }

    // ── REGISTRAR EN AUDITORÍA ────────────────────────────────
    const auditoria = new AuditoriaFacturacion({
      id_factura: factura._id,
      numero_factura: factura.numero_factura,
      id_usuario,
      motivo_eliminacion: motivo_eliminacion.trim(),
    });
    await auditoria.save();

    // ── HACER SOFT DELETE (marcar como inactiva) ────────────────
    await Facturacion.findByIdAndUpdate(req.params.id, { active: false });

    res.json({
      message: 'Factura eliminada e inventario restituido correctamente.',
      auditoria,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la factura.', error: err.message });
  }
};

// ── GET /api/facturacion/auditoria/eliminadas ────────────────
// Obtener historial de facturas eliminadas con filtros
const getFacturasEliminadas = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, id_usuario } = req.query;
    let filtro = {};

    // Zona horaria: Colombia UTC-5
    const OFFSET_COLOMBIA = 5 * 60 * 60 * 1000; // +5 horas en milisegundos (UTC-5 → UTC)

    // Filtro por rango de fechas de eliminación
    if (fechaDesde || fechaHasta) {
      filtro.fecha_eliminacion = {};
      if (fechaDesde) {
        // Parse fecha en formato ISO (YYYY-MM-DD)
        const desde = new Date(fechaDesde);
        // Ajustar a las 00:00:00 en UTC, luego sumar offset de Colombia
        desde.setUTCHours(0, 0, 0, 0);
        desde.setTime(desde.getTime() + OFFSET_COLOMBIA);
        filtro.fecha_eliminacion.$gte = desde;
      }
      if (fechaHasta) {
        // Ajustar a las 23:59:59 en UTC, luego sumar offset de Colombia
        const hasta = new Date(fechaHasta);
        hasta.setUTCHours(23, 59, 59, 999);
        hasta.setTime(hasta.getTime() + OFFSET_COLOMBIA);
        filtro.fecha_eliminacion.$lte = hasta;
      }
    }

    // Filtro por usuario admin
    if (id_usuario) {
      filtro.id_usuario = id_usuario;
    }

    const auditorias = await AuditoriaFacturacion.find(filtro)
      .populate('id_usuario', 'nombre apellido email')
      .populate('id_factura', 'numero_factura total_pagado metodo_pago fecha_emision detalle_pedido propinas pagos_parciales createdAt id_cliente')
      .sort({ fecha_eliminacion: -1 });

    res.json(auditorias);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener facturas eliminadas.', error: err.message });
  }
};

// ── GET /api/facturacion/auditoria/estadisticas ────────────────
// Obtener estadísticas de facturas eliminadas
const getEstadisticasFacturasEliminadas = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    let filtro = {};

    // Zona horaria: Colombia UTC-5
    const OFFSET_COLOMBIA = 5 * 60 * 60 * 1000; // +5 horas en milisegundos (UTC-5 → UTC)

    if (fechaDesde || fechaHasta) {
      filtro.fecha_eliminacion = {};
      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        desde.setUTCHours(0, 0, 0, 0);
        desde.setTime(desde.getTime() + OFFSET_COLOMBIA);
        filtro.fecha_eliminacion.$gte = desde;
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setUTCHours(23, 59, 59, 999);
        hasta.setTime(hasta.getTime() + OFFSET_COLOMBIA);
        filtro.fecha_eliminacion.$lte = hasta;
      }
    }

    const total = await AuditoriaFacturacion.countDocuments(filtro);
    
    const totalMonto = await AuditoriaFacturacion.aggregate([
      { $match: filtro },
      { 
        $lookup: { 
          from: 'facturacions', 
          localField: 'id_factura', 
          foreignField: '_id', 
          as: 'factura' 
        } 
      },
      { $unwind: '$factura' },
      { $group: { _id: null, suma: { $sum: '$factura.total_pagado' } } }
    ]);

    const porUsuario = await AuditoriaFacturacion.aggregate([
      { $match: filtro },
      { 
        $lookup: { 
          from: 'facturacions', 
          localField: 'id_factura', 
          foreignField: '_id', 
          as: 'factura' 
        } 
      },
      { $unwind: '$factura' },
      { $group: { _id: '$id_usuario', cantidad: { $sum: 1 }, monto: { $sum: '$factura.total_pagado' } } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $sort: { cantidad: -1 } }
    ]);

    res.json({
      total,
      totalMonto: totalMonto.length > 0 ? totalMonto[0].suma : 0,
      porUsuario,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadísticas.', error: err.message });
  }
};

module.exports = {
  getFacturas,
  getFacturaPorId,
  getFacturaPorComanda,
  crearFactura,
  eliminarFactura,
  getFacturasEliminadas,
  getEstadisticasFacturasEliminadas,
};
