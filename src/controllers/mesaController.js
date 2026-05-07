// ============================================================
// src/controllers/mesaController.js — CRUD de Mesas
// ============================================================
const Contador = require('../models/Contador');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');
const {
  extraerIdsProductos,
  normalizarLineasPedido,
} = require('../utils/comandaItems');

const poblarPedidoActual = async (mesas) => {
  const lista = Array.isArray(mesas) ? mesas : [mesas];
  const idsFaltantes = extraerIdsProductos(
    lista.flatMap((mesa) => mesa?.pedido_actual?.ids_productos || [])
  );

  const productos = idsFaltantes.length > 0
    ? await Producto.find({ _id: { $in: idsFaltantes } }).select('nombre precio costo').lean()
    : [];

  const mapaProductos = new Map(productos.map((producto) => [String(producto._id), producto]));

  return lista.map((mesa) => {
    const obj = mesa.toObject ? mesa.toObject() : mesa;
    if (obj.pedido_actual) {
      obj.pedido_actual = obj.pedido_actual.toObject ? obj.pedido_actual.toObject() : obj.pedido_actual;
      obj.pedido_actual.ids_productos = normalizarLineasPedido(obj.pedido_actual.ids_productos || []).map((linea) => {
        const producto = mapaProductos.get(String(linea.id_producto)) || linea.producto || null;
        return {
          id_producto: producto && producto._id ? producto : {
            _id: linea.id_producto,
            nombre: linea.nombre || producto?.nombre || 'Producto',
            precio: linea.precio ?? producto?.precio ?? 0,
            costo: linea.costo ?? producto?.costo ?? null,
          },
          cantidad: linea.cantidad,
          observacion: linea.observacion || '',
        };
      });
    }
    return obj;
  });
};

// ── GET /api/mesas — Obtener todas las mesas ─────────────────
const getMesas = async (req, res) => {
  try {
    const mesas = await Mesa.find()
      .populate({
        path: 'pedido_actual',
        populate: [
          { path: 'ids_productos.id_producto', select: 'nombre precio costo' },
          { path: 'id_cliente' }
        ]
      })
      .sort({ numero_mesa: 1 });
    res.json(await poblarPedidoActual(mesas));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las mesas.', error: err.message });
  }
};

// ── GET /api/mesas/:id ───────────────────────────────────────
const getMesaPorId = async (req, res) => {
  try {
    const mesa = await Mesa.findById(req.params.id)
      .populate({
        path: 'pedido_actual',
        populate: [
          { path: 'ids_productos.id_producto', select: 'nombre precio costo' },
          { path: 'id_cliente' }
        ]
      });
    if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada.' });
    res.json((await poblarPedidoActual(mesa))[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la mesa.', error: err.message });
  }
};

// ── POST /api/mesas — Crear mesa (Consecutivo Automático) ──────
const crearMesa = async (req, res) => {
  try {
    // 1. Obtener y asegurar el contador para 'mesa'
    let contDoc = await Contador.findOne({ concepto: 'mesa' });
    
    // Si no existe, inicializarlo con el máximo numero_mesa actual
    if (!contDoc) {
      const ultimaMesa = await Mesa.findOne().sort({ numero_mesa: -1 });
      const inicio = ultimaMesa ? ultimaMesa.numero_mesa : 0;
      contDoc = await Contador.create({ concepto: 'mesa', contador: inicio });
    }

    // 2. Incrementar atómicamente el contador
    const contActualizado = await Contador.findOneAndUpdate(
      { concepto: 'mesa' },
      { $inc: { contador: 1 } },
      { new: true }
    );

    // 3. Crear la mesa con el nuevo número consecutivo
    const datosMesa = { ...req.body, numero_mesa: contActualizado.contador };
    const mesa = new Mesa(datosMesa);
    await mesa.save();
    
    res.status(201).json(mesa);
  } catch (err) {
    // Manejo de error por duplicado (por si acaso hay race condition antes de que el contador sea atómico)
    if (err.code === 11000) {
      return res.status(400).json({ message: `Conflicto de número: ${err.message}` });
    }
    res.status(500).json({ message: 'Error al crear la mesa.', error: err.message });
  }
};

// ── PUT /api/mesas/:id — Actualizar mesa ─────────────────────
const actualizarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(req.params.id, req.body, {
      new:           true,
      runValidators: true,
    }).populate({
      path: 'pedido_actual',
      populate: [
        { path: 'ids_productos.id_producto', select: 'nombre precio costo' },
        { path: 'id_cliente' }
      ]
    });
    if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada.' });
    res.json((await poblarPedidoActual(mesa))[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la mesa.', error: err.message });
  }
};

// ── DELETE /api/mesas/:id — Eliminar mesa ────────────────────
const eliminarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndDelete(req.params.id);
    if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada.' });
    res.json({ message: 'Mesa eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la mesa.', error: err.message });
  }
};

module.exports = {
  getMesas,
  getMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
};
