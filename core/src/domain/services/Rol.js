'use strict';

const debug = require('debug')('pauteo:core:domain:roles');

module.exports = function rolService (repositories, res) {
  const { roles } = repositories;

  async function findAll (params = {}, idRol) {
    debug('Lista de roles|filtros');

    let lista;
    try {
      switch (idRol) {
        case 1: // rol: SUPERADMIN
          // params['id_roles'] = [1, 2, 3];
          break;
        case 2: // rol: ADMININSTRADOR
          params['id_roles'] = [2, 3, 4];
          break;
      }

      lista = await roles.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de roles`));
    }

    return res.success(lista);
  }

  async function findById (id) {
    debug('Buscando rol por ID');

    let rol;
    try {
      rol = await roles.findById(id);
    } catch (e) {
      return res.error(e);
    }

    if (!rol) {
      return res.error(new Error(`Rol ${id} not found`));
    }

    return res.success(rol);
  }

  async function createOrUpdate (data) {
    debug('Crear o actualizar rol');

    let rol;
    try {
      rol = await roles.createOrUpdate(data);
    } catch (e) {
      return res.error(e);
    }

    if (!rol) {
      return res.error(new Error(`El rol no pudo ser creado`));
    }

    return res.success(rol);
  }

  async function deleteItem (id) {
    debug('Eliminando rol');

    let deleted;
    try {
      deleted = await roles.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe el rol`));
    }

    if (deleted === 0) {
      return res.error(new Error(`El rol ya fue eliminado`));
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
