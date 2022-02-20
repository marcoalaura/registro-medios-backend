'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function coberturaCampanaRepository (models, Sequelize) {
  const { coberturaCampana } = models;

  function findAll (params = {}, include = true) {
    let query = getQuery(params);
    query.where = {};

    if (params.id_campana) {
      query.where.id_campana = params.id_campana;
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

    return coberturaCampana.findAndCountAll(query);
  }

  function findById (id) {
    return coberturaCampana.findOne({
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

    const item = await coberturaCampana.findOne(cond);

    if (item) {
      let updated;
      try {
        updated = await coberturaCampana.update(data, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? coberturaCampana.findOne(cond) : item;
    }

    let result;
    try {
      result = await coberturaCampana.create(data);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function bulkCreate (data, t) {
    try {
      return coberturaCampana.bulkCreate(data, t ? {transaction: t} : {});
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
      return coberturaCampana.destroy(params, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function deleteItem (id) {
    return deleteItemModel(id, coberturaCampana);
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
