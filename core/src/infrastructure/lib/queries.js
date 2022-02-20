'use strict';
const { errorHandler } = require('./util');

async function deleteItemModel (id, model) {
  const cond = {
    where: {
      id
    }
  };

  const item = await model.findOne(cond);

  if (item) {
    const deleted = await model.destroy(cond);
    return +!!deleted; //  Devuelve 1 si se eliminó correctamente y 0 si no se pudo eliminar
  }

  return -1; // Devuelve -1 si no se encontró el registro
}

async function findById (id, model, raw = false) {
  const obj = await model.findById(id, {
    raw
  });
  return obj ? (!raw ? obj.toJSON() : obj) : obj;
}

async function createOrUpdate (obj, model, t, raw = false) {
  const cond = {
    where: {
      id: obj.id
    }
  };

  const item = await model.findOne(cond);

  if (item) {
    let updated;
    try {
      updated = await model.update(obj, cond);
    } catch (e) {
      errorHandler(e);
    }
    return updated ? model.findOne(cond) : item;
  }

  let result;
  try {
    result = await model.create(obj);
  } catch (e) {
    errorHandler(e);
  }

  return result.toJSON();
}

module.exports = {
  deleteItemModel,
  findById,
  createOrUpdate
};
