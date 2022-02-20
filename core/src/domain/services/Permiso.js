'use strict';

const debug = require('debug')('pauteo:core:domain:permisos');

module.exports = function permisoService (repositories, res) {
  const { permisos } = repositories;

  async function getPermisos (idRol) {
    debug('Obteniendo permisos');
    let lista;
    let permissions = [];

    try {
      lista = await permisos.findAll({ id_rol: idRol });
      lista.rows.map(item => {
        let path = item['modulo.ruta'];
        if (item.read) {
          permissions.push(`${path}:read`);
        }
        if (item.create) {
          permissions.push(`${path}:create`);
        }
        if (item.update) {
          permissions.push(`${path}:update`);
        }
        if (item.delete) {
          permissions.push(`${path}:delete`);
        }
        if (item.csv) {
          permissions.push(`${path}:csv`);
        }
        if (item.firma) {
          permissions.push(`${path}:firma`);
        }
      });
    } catch (e) {
      return res.error(e);
    }
    return res.success(permissions);
  }

  async function findAll (params = {}) {
    debug('Lista de permisos|filtros');

    let lista;
    try {
      lista = await permisos.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de permisos`));
    }

    return res.success(lista);
  }

  async function findById (id) {
    debug('Buscando permiso por ID');

    let permiso;
    try {
      permiso = await permisos.findById(id);
    } catch (e) {
      return res.error(e);
    }

    if (!permiso) {
      return res.error(new Error(`Permiso ${id} not found`));
    }

    return res.success(permiso);
  }

  async function createOrUpdate (data) {
    debug('Crear o actualizar permiso');

    let permiso;
    try {
      permiso = await permisos.createOrUpdate(data);
    } catch (e) {
      return res.error(e);
    }

    if (!permiso) {
      return res.error(new Error(`El permiso no pudo ser creado`));
    }

    return res.success(permiso);
  }

  async function deleteItem (id) {
    debug('Eliminando permiso');

    let deleted;
    try {
      deleted = await permisos.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe el permiso`));
    }

    if (deleted === 0) {
      return res.error(new Error(`El permiso ya fue eliminado`));
    }

    return res.success(deleted > 0);
  }

  return {
    getPermisos,
    findAll,
    findById,
    createOrUpdate,
    deleteItem
  };
};
