'use strict';

const debug = require('debug')('pauteo:core:domain:entidades');

module.exports = function entidadService (repositories, res) {
  const { entidades } = repositories;

  async function findAll (params = {}, idRol, idEntidad) {
    debug('Lista de entidades|filtros');

    let lista;
    try {
      switch (idRol) {
        case 2: // Administrador
          params['idEntidad'] = idEntidad;
          break;
        case 3: // Usuario
          params['idEntidad'] = idEntidad;
          break;
      }

      lista = await entidades.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de entidades`));
    }

    return res.success(lista);
  }

  async function findById (id) {
    debug('Buscando entidad por ID');

    let entidad;
    try {
      entidad = await entidades.findById(id);
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
      entidad = await entidades.createOrUpdate(data);
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
      deleted = await entidades.deleteItem(id);
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
