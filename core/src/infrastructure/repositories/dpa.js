'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function dpaRepository (models, Sequelize) {
  const { dpa } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}, include = false, nivel = 1, nivelWhere = null) {
    let query = getQuery(params);
    query.where = {};

    if (params.nombre) {
      query.where.nombre = {
        [Op.iLike]: `%${params.nombre}%`
      };
    }

    if (params.codigo_ine) {
      query.where.codigo_ine = {
        [Op.iLike]: `%${params.codigo_ine}%`
      };
    }

    if (params.nivel_dpa) {
      query.where.nivel_dpa = params.nivel_dpa;
    }

    if (params.id_dpa_superior) {
      query.where.id_dpa_superior = params.id_dpa_superior;
    }

    if (include) {
      query.include = [{
        attributes: [],
        model: models.dpa,
        as: 'superior',
        required: true
      }];
      if (nivel > 1) {
        query.include[0].include = [{
          attributes: [],
          model: models.dpa,
          as: 'superior',
          required: true
        }];
        if (nivelWhere) {
          query.include[0].where = { id_dpa_superior: nivelWhere };
        }
      }
      query.required = true;
    }

    return dpa.findAndCountAll(query);
  }

  function findById (id) {
    return dpa.findOne({
      where: {
        id
      }
    });
  }

  async function createOrUpdate (entidad) {
    const cond = {
      where: {
        id: dpa.id
      }
    };

    const item = await dpa.findOne(cond);

    if (item) {
      let updated;
      try {
        updated = await dpa.update(entidad, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? dpa.findOne(cond) : item;
    }

    let result;
    try {
      result = await dpa.create(entidad);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, dpa);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate
  };
};
