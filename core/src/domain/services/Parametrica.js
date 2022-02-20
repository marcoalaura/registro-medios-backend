'use strict';

const debug = require('debug')('pauteo:core:domain:parametricas');

module.exports = function parametricarvice (repositories, res) {
  const { parametrica } = repositories;

  async function findAll (params = {}, idRol, idEntidad) {
    debug('Lista de parametrica|filtros');

    let lista;
    try {
      lista = await parametrica.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de parametros`));
    }

    return res.success(lista);
  }

  async function findById (id) {
    debug('Buscando entidad por ID');

    let entidad;
    try {
      entidad = await parametrica.findById(id);
    } catch (e) {
      return res.error(e);
    }

    if (!entidad) {
      return res.error(new Error(`Entidad ${id} not found`));
    }

    return res.success(entidad);
  }

  async function createOrUpdate (data) {
    debug('Crear o actualizar entidad');

    let entidad;
    try {
      entidad = await parametrica.createOrUpdate(data);
    } catch (e) {
      return res.error(e);
    }

    if (!entidad) {
      return res.error(new Error(`El entidad no pudo ser creado`));
    }

    return res.success(entidad);
  }

  async function deleteItem (id) {
    debug('Eliminando entidad');

    let deleted;
    try {
      deleted = await parametrica.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe la entidad`));
    }

    if (deleted === 0) {
      return res.error(new Error(`La entidad ya fue eliminada`));
    }

    return res.success(deleted > 0);
  }

  return {
    findAll,
    findById,
    createOrUpdate,
    deleteItem
  };
};
