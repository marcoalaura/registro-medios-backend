'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function referenciaRepository (models, Sequelize) {
  const { referencia } = models;
  const Op = Sequelize.Op;

  async function personaSegunReferencia (params) {
    
    try {
      const persona = await referencia.obtenerPersonaSegunIdReferencia(params);
      if (!persona) {
        throw new Error('No se encontro solicitud con ese Id');
      }
      return persona;
    } catch (error) {
      throw new Error(error.code);
    }
  };

  function findAll (idMedio, params = {}) {
    let query = getQuery(params);
    // query.where = {};
    query.where = { estado: 'ACTIVO' };

    if (params.email) {
      query.where.email = {
        [Op.iLike]: `%${params.email}%`
      };
    }

    if (params.telefonos) {
      query.where.telefonos = {
        [Op.iLike]: `%${params.telefonos}%`
      };
    }

    if (params.tipo) {
      query.where.tipo = {
        [Op.iLike]: `%${params.tipo}%`
      };
    }

    if (params.idReferencia) {
      query.where.id = params.idReferencia;
    }

    if (idMedio) {
      query.where.id_medio = idMedio;
    }
    query.include = [];
    query.include.push({
      model: models.personas,
      as: 'persona',
      attributes: ['nombres', 'primer_apellido', 'segundo_apellido', 'tipo_documento', 'nro_documento', 'fecha_nacimiento']
    });
    return referencia.findAndCountAll(query);
  }

  function findById (id) {
    return referencia.findOne({
      where: {
        id
      },
      raw: true
    });
  }

  async function createOrUpdate (referenciaObj, t) {
    const cond = {
      where: {
        id: referenciaObj.id
      }
    };

    const item = await referencia.findOne(cond);
    if (item) {
      let updated;
      try {
        if (t) {
          cond.transaction = t;
        }
        updated = await referencia.update(referenciaObj, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? referencia.findOne(cond) : item;
    }

    let result;
    try {
      // result = await referencia.create(referenciaObj);
      result = await referencia.create(referenciaObj, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function update (referenciaObj, cond, t) {
    let updated;
    try {
      if (t) {
        cond.transaction = t;
      }
      updated = await referencia.update(referenciaObj, cond);
    } catch (e) {
      errorHandler(e);
    }
    return updated;
  }

  async function deleteItem (id) {
    return deleteItemModel(id, referencia);
  }

  async function findByMedioTipo (idMedio, tipo) {
    return referencia.findOne({
      where: {
        id_medio: idMedio, tipo, estado: 'ACTIVO'
      },
      order: [['id', 'desc']] 
    });
  }

  return {
    personaSegunReferencia,
    findAll,
    findById,
    deleteItem,
    createOrUpdate,
    findByMedioTipo,
    update
  };
};
