'use strict';

const { getQuery } = require('../lib/util');
const queries = require('../lib/queries');

module.exports = function afpRepository (models, Sequelize) {
  const { afpCertificacion, parametrica } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.mes) {
      query.where.mes = params.mes;
    }

    if (params.gestion) {
      query.where.gestion = params.gestion;
    }

    if (params.estado) {
      query.where.estado = params.estado;
    }

    if (params.id_medio) {
      query.where.id_medio = params.id_medio;
    }

    query.include = [{
      attributes: ['sigla', 'nombre', 'descripcion'],
      model: models.parametrica,
      as: 'tipo'
    }];

    return afpCertificacion.findAndCountAll(query);
  }

  function findAllEstado (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.mes) {
      query.where.mes = params.mes;
    }

    if (params.gestion) {
      query.where.gestion = params.gestion;
    }

    query.where.estado = ['PENDIENTE', 'RECHAZADO'];

    if (params.id_medio) {
      query.where.id_medio = params.id_medio;
    }

    query.include = [{
      attributes: ['sigla', 'nombre', 'descripcion'],
      model: models.parametrica,
      as: 'tipo'
    }];

    return afpCertificacion.findAndCountAll(query);
  }

  function findDistinctAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    query.attributes = ['id_medio', 'mes', 'gestion'];

    query.where.estado = {
      [Op.not]: 'INACTIVO'
    };

    if (params.id_medio) {
      query.where.id_medio = params.id_medio;
    }

    query.group = ['id_medio', 'mes', 'gestion'];

    query.order = ['gestion', 'mes'];

    return afpCertificacion.findAndCountAll(query);
  }

  function findById (id) {
    return afpCertificacion.findOne({
      where: {
        id
      },
      include: [{
        model: parametrica,
        as: 'tipo'
      }],
      raw: true
    });
  }

  async function createOrUpdate (afpObj) {
    return queries.createOrUpdate(afpObj, afpCertificacion);
  }

  async function deleteItem (id) {
    return queries.deleteItemModel(id, afpCertificacion);
  }

  async function findByIdMedio (idMedio, mes, gestion, tipo) {
    return afpCertificacion.findOne({
      where: {
        id_medio: idMedio,
        mes,
        gestion,
        id_tipo: tipo
      }
    });
  }

  return {
    findAll,
    findAllEstado,
    findDistinctAll,
    findById,
    findByIdMedio,
    deleteItem,
    createOrUpdate
  };
};
