'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function parametricaRepository (models, Sequelize) {
  const { parametrica } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.nombre) {
      query.where.nombre = {
        [Op.iLike]: `%${params.nombre}%`
      };
    }

    if (params.grupo) {
      query.where.grupo = {
        [Op.iLike]: `%${params.grupo}%`
      };
    }

    if (params.idParametrica) {
      query.where.id = params.idParametrica;
    }
    return parametrica.findAndCountAll(query);
  }

  function findById (id) {
    return parametrica.findOne({
      where: {
        id
      }
    });
  }

  async function verifyByGrupo (id, grupo) {
    const result = await parametrica.findOne({
      where: {
        id
      }
    });
    if (!result) {
      errorHandler(new Error(`No se encuentra el parámetro solicitado.`));
    }
    if (result.grupo !== grupo) {
      errorHandler(new Error(`El parámetro ingresado no se encuentra en el grupo ${grupo}.`));
    }
    return result;
  }

  async function createOrUpdate (parametricaObj) {
    const cond = {
      where: {
        id: parametricaObj.id
      }
    };

    const item = await parametrica.findOne(cond);
    if (item) {
      let updated;
      try {
        updated = await parametrica.update(parametricaObj, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? parametrica.findOne(cond) : item;
    }

    let result;
    try {
      result = await parametrica.create(parametricaObj);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, parametrica);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate,
    verifyByGrupo
  };
};
