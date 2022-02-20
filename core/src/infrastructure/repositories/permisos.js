'use strict';

const { getQuery } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function permisosRepository (models, Sequelize) {
  const { permisos, modulos, roles } = models;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    query.include = [
      {
        attributes: ['label', 'ruta'],
        model: modulos,
        as: 'modulo'
      },
      {
        attributes: ['nombre', 'descripcion'],
        model: roles,
        as: 'rol'
      }
    ];

    if (params.id_modulo) {
      query.where.id_modulo = params.id_modulo;
    }

    if (params.id_rol) {
      query.where.id_rol = params.id_rol;
    }

    return permisos.findAndCountAll(query);
  }

  function findById (id) {
    return permisos.findOne({
      where: {
        id
      },
      include: [
        {
          attributes: ['label'],
          model: modulos,
          as: 'modulo'
        },
        {
          attributes: ['nombre'],
          model: roles,
          as: 'rol'
        }
      ],
      raw: true
    });
  }

  async function createOrUpdate (permiso) {
    const cond = {
      where: {
        id: permiso.id
      }
    };

    const item = await permisos.findOne(cond);

    if (item) {
      const updated = await permisos.update(permiso, cond);
      return updated ? permisos.findOne(cond) : item;
    }

    const result = await permisos.create(permiso);
    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, permisos);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate
  };
};
