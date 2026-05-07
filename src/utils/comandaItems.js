// ============================================================
// src/utils/comandaItems.js — Normalización de líneas de pedido
// ============================================================

const extraerProductoBase = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return null;
  return item.id_producto || item.producto || item;
};

const obtenerIdProducto = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return String(item);

  const base = extraerProductoBase(item);
  const id = base?._id || base?.id || item.id_producto || item.producto || item._id || item.id;
  return id ? String(id) : null;
};

const obtenerCantidad = (item) => {
  const cantidad = Number(item?.cantidad ?? item?.qty ?? 1);
  return Number.isFinite(cantidad) && cantidad > 0 ? Math.floor(cantidad) : 1;
};

const obtenerObservacion = (item) => String(item?.observacion ?? item?.observaciones ?? '').trim();

const normalizarLineasPedido = (items = []) => {
  return (Array.isArray(items) ? items : []).map((item) => {
    const producto = extraerProductoBase(item);
    const id_producto = obtenerIdProducto(item);

    return {
      id_producto,
      cantidad: obtenerCantidad(item),
      observacion: obtenerObservacion(item),
      producto: producto && producto._id ? producto : null,
      nombre: producto?.nombre || item?.nombre || '',
      precio: Number(producto?.precio ?? item?.precio ?? 0),
      costo: item?.costo ?? producto?.costo ?? null,
    };
  }).filter((item) => Boolean(item.id_producto));
};

const extraerIdsProductos = (items = []) => {
  const ids = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const id = obtenerIdProducto(item);
    if (id) ids.add(id);
  }
  return [...ids];
};

const agruparLineasPedido = (items = []) => {
  const grupos = new Map();

  for (const item of normalizarLineasPedido(items)) {
    const key = `${item.id_producto}::${item.observacion || ''}`;
    const actual = grupos.get(key);
    if (actual) {
      actual.cantidad += item.cantidad;
      continue;
    }

    grupos.set(key, {
      ...item,
      cantidad: item.cantidad,
    });
  }

  return [...grupos.values()];
};

module.exports = {
  agruparLineasPedido,
  extraerIdsProductos,
  normalizarLineasPedido,
  obtenerCantidad,
  obtenerIdProducto,
  obtenerObservacion,
};
