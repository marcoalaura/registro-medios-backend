'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function plantillaRepository (models, Sequelize) {
  const { plantilla } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.nombre) {
      query.where.nombre = {
        [Op.iLike]: `%${params.nombre}%`
      };
    }

    if (params.id) {
      query.where.id = params.id;
    }
    return plantilla.findAndCountAll(query);
  }

  function findById (id) {
    return plantilla.findOne({
      where: {
        id
      }
    });
  }

  return {
    findAll,
    findById
  };
};
