'use strict';

const { errorHandler } = require('../lib/util');
const queries = require('../lib/queries');

module.exports = function ordenRepository (models, Sequelize) {
  const { ordenPublicidad } = models;

  async function findById (id) {
    return queries.findById(id, ordenPublicidad, true);
  }

  async function createOrUpdate (data, t) {
    return queries.createOrUpdate(data, ordenPublicidad, t);
  }

  async function findAll (idCampanaMedio) {
    return ordenPublicidad.findAll({
      where: {
        id_campana_medio: idCampanaMedio
      },
      raw: true
    });
  }

  async function bulkCreate (data, t) {
    try {
      return ordenPublicidad.bulkCreate(data, t ? {transaction: t, returning: true} : {returning: true});
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
      return ordenPublicidad.destroy(params, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function deleteItem (id) {
    return queries.deleteItemModel(id, ordenPublicidad);
  }

  async function obtenerMaximoNroOrden (idCampanaMedio) {
    const query = {
      attributes: [Sequelize.fn('MAX', Sequelize.col('nro_orden'))],
      where: {
         id_campana_medio: idCampanaMedio
      },
      raw: true
    };
    return ordenPublicidad.findOne(query);
  };

  return {
    deleteItem,
    createOrUpdate,
    bulkCreate,
    bulkDelete,
    findById,
    findAll,
    obtenerMaximoNroOrden
  };
};
