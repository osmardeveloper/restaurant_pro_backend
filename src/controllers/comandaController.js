// ============================================================
// src/controllers/comandaController.js — Solo lectura
// ============================================================
const Comanda = require('../models/Comanda');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');
const {
  extraerIdsProductos,
  normalizarLineasPedido,
} = require('../utils/comandaItems');

const poblarComandas = async (comandas) => {
  const lista = Array.isArray(comandas) ? comandas : [comandas];
  const idsFaltantes = extraerIdsProductos(
    lista.flatMap((comanda) => comanda?.ids_productos || [])
  );

  const productos = idsFaltantes.length > 0
    ? await Producto.find({ _id: { $in: idsFaltantes } }).select('nombre precio costo').lean()
    : [];

  const mapaProductos = new Map(productos.map((producto) => [String(producto._id), producto]));

  return lista.map((comanda) => {
    const obj = comanda.toObject ? comanda.toObject() : comanda;
    obj.ids_productos = normalizarLineasPedido(obj.ids_productos || []).map((linea) => {
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

    return obj;
  });
};

// ── GET /api/comandas — Obtener todas las comandas ───────────
const getComanadas = async (req, res) => {
  try {
    const comandas = await Comanda.find()
      .populate('id_mesa', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido numero_documento')
      .populate({ path: 'ids_productos.id_producto', select: 'nombre precio costo' })
      .populate('id_factura', 'numero_factura')
      .sort({ createdAt: -1 });
    res.json(await poblarComandas(comandas));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las comandas.', error: err.message });
  }
};

// ── GET /api/comandas/:id ────────────────────────────────────
const getComandaPorId = async (req, res) => {
  try {
    const comanda = await Comanda.findById(req.params.id)
      .populate('id_mesa', 'numero_mesa estado')
      .populate('id_cliente', 'nombre apellido numero_documento')
      .populate({ path: 'ids_productos.id_producto', select: 'nombre precio costo' })
      .populate('id_factura', 'numero_factura');
    if (!comanda) return res.status(404).json({ message: 'Comanda no encontrada.' });
    res.json((await poblarComandas(comanda))[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la comanda.', error: err.message });
  }
};

// ── POST /api/comandas — Crear comanda (para uso interno) ────
const crearComanda = async (req, res) => {
  try {
    const datos = {
      ...req.body,
      ids_productos: normalizarLineasPedido(req.body.ids_productos),
    };

    const comanda = new Comanda(datos);
    await comanda.save();

    // Cambiar estado de la mesa a 'pedido tomado' y referenciar a la comanda única
    if (req.body.id_mesa) {
      await Mesa.findByIdAndUpdate(req.body.id_mesa, { estado: 'pedido tomado', pedido_actual: comanda._id });
    }

    const populated = await comanda.populate([
      { path: 'id_mesa', select: 'numero_mesa estado' },
      { path: 'id_cliente', select: 'nombre apellido numero_documento' },
      { path: 'ids_productos.id_producto', select: 'nombre precio costo' },
    ]);
    res.status(201).json((await poblarComandas(populated))[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la comanda.', error: err.message });
  }
};

// ── PUT /api/comandas/:id — Actualizar comanda ───────────────
const actualizarComanda = async (req, res) => {
  try {
    const datos = {
      ...req.body,
    };

    if (req.body.ids_productos) {
      datos.ids_productos = normalizarLineasPedido(req.body.ids_productos);
    }

    const comanda = await Comanda.findByIdAndUpdate(req.params.id, datos, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'id_mesa', select: 'numero_mesa estado' },
      { path: 'id_cliente', select: 'nombre apellido numero_documento' },
      { path: 'ids_productos.id_producto', select: 'nombre precio costo' },
    ]);
    if (!comanda) return res.status(404).json({ message: 'Comanda no encontrada.' });
    res.json((await poblarComandas(comanda))[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la comanda.', error: err.message });
  }
};

// ── DELETE /api/comandas/:id — Eliminar comanda ──────────────
const eliminarComanda = async (req, res) => {
  try {
    const masterKey = req.headers['x-master-key'];
    const MASTER_KEY = process.env.MASTER_KEY || 'res2026';
    
    if (!masterKey || masterKey !== MASTER_KEY) {
      return res.status(403).json({ message: 'Clave maestra incorrecta.' });
    }

    const comanda = await Comanda.findByIdAndDelete(req.params.id);
    if (!comanda) return res.status(404).json({ message: 'Comanda no encontrada.' });
    
    // Si la comanda estaba asociada a una mesa, limpiar la mesa
    if (comanda.id_mesa) {
      await Mesa.findByIdAndUpdate(comanda.id_mesa, { estado: 'disponible', pedido_actual: null });
    }
    
    res.json({ message: 'Comanda eliminada correctamente.', comanda });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la comanda.', error: err.message });
  }
};

module.exports = {
  getComanadas,
  getComandaPorId,
  crearComanda,
  actualizarComanda,
  eliminarComanda,
};
