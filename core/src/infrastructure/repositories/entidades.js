'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function entidadesRepository (models, Sequelize) {
  const { entidades } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.nombre) {
      query.where.nombre = {
        [Op.iLike]: `%${params.nombre}%`
      };
    }

    if (params.sigla) {
      query.where.sigla = {
        [Op.iLike]: `%${params.sigla}%`
      };
    }

    if (params.estado) {
      query.where.estado = params.estado;
    }

    if (params.idEntidad) {
      query.where.id = params.idEntidad;
    }

    return entidades.findAndCountAll(query);
  }

  function findById (id) {
    return entidades.findOne({
      where: {
        id
      }
    });
  }

  async function createOrUpdate (entidad) {
    const cond = {
      where: {
        id: entidad.id
      }
    };

    const item = await entidades.findOne(cond);

    if (item) {
      let updated;
      try {
        updated = await entidades.update(entidad, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? entidades.findOne(cond) : item;
    }

    let result;
    try {
      result = await entidades.create(entidad);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, entidades);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate
  };
};
