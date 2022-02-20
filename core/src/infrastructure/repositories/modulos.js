'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function modulosRepository (models, Sequelize) {
  const { modulos } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.label) {
      query.where.label = {
        [Op.iLike]: `%${params.label}%`
      };
    }

    if (params.estado) {
      query.where.estado = params.estado;
    }

    if (params.visible) {
      query.where.visible = params.visible;
    }

    if (params.id_modulo) {
      query.where.id_modulo = params.id_modulo;
    }

    if (params.id_modulo !== undefined && params.id_modulo === 0) {
      query.where.id_modulo = {
        [Op.eq]: null
      };
    }

    if (params.id_seccion) {
      query.where.id_seccion = params.id_seccion;
    }

    if (params.id_seccion !== undefined && params.id_seccion === 0) {
      query.where.id_seccion = {
        [Op.eq]: null
      };
    }

    return modulos.findAndCountAll(query);
  }

  function findById (id) {
    return modulos.findOne({
      where: {
        id
      }
    });
  }

  async function createOrUpdate (modulo) {
    const cond = {
      where: {
        id: modulo.id
      }
    };

    const item = await modulos.findOne(cond);

    if (item) {
      let updated;
      try {
        updated = await modulos.update(modulo, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? modulos.findOne(cond) : item;
    }

    let result;
    try {
      result = await modulos.create(modulo);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, modulos);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate
  };
};
