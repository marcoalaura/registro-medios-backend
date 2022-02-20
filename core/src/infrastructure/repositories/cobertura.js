'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function coberturaMedioRepository (models, Sequelize) {
  const { coberturaMedio } = models;

  function findAll (params = {}, include = true) {
    let query = getQuery(params);
    query.where = {};

    if (params.id_tipo_medio) {
      query.where.id_medio_tipo_medio = params.id_tipo_medio;
    }

    if (include) {
      query.include = [{
        model: models.dpa,
        as: 'dpa',
        include: [{
          model: models.dpa,
          as: 'superior',
          include: [{
            model: models.dpa,
            as: 'superior'
          }]
        }]
      }];
    }

    return coberturaMedio.findAndCountAll(query);
  }

  function findById (id) {
    return coberturaMedio.findOne({
      where: {
        id
      }
    });
  }

  async function createOrUpdate (data) {
    const cond = {
      where: {
        id: data.id
      }
    };

    const item = await coberturaMedio.findOne(cond);

    if (item) {
      let updated;
      try {
        updated = await coberturaMedio.update(data, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? coberturaMedio.findOne(cond) : item;
    }

    let result;
    try {
      result = await coberturaMedio.create(data);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function bulkCreate (data, t) {
    try {
      return coberturaMedio.bulkCreate(data, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function bulkDelete (cond, t) {
    try {
      let params = {};
      if (cond) {
        params.where = cond;
      }
      return coberturaMedio.destroy(params, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function deleteItem (id) {
    return deleteItemModel(id, coberturaMedio);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate,
    bulkCreate,
    bulkDelete
  };
};
