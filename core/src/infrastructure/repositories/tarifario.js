'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function tarifarioRepository (models, Sequelize) {
  const { tarifario, tarifarioDetalle } = models;
  const Op = Sequelize.Op;

  function findAll (idMedio, params = {}) {
    let query = getQuery(params);
    query.where = {};

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
      attributes: ['nombres', 'primer_apellido', 'segundo_apellido', 'nro_documento', 'fecha_nacimiento']
    });
    return tarifario.findAndCountAll(query);
  }

  async function findById (id, include = true) {
    const params = {
      where: {
        id
      },
      raw: false
    };

    if (include) {
      params.include = [{
        model: models.tarifarioDetalle,
        as: 'detalles'
      }];
    }

    const tarifarioObj = await tarifario.findOne(params);
    return tarifarioObj ? tarifarioObj.toJSON() : tarifarioObj;
  }

  async function createOrUpdate (tarifarioObj) {
    const cond = {
      where: {
        id: tarifarioObj.id
      }
    };

    const item = await tarifario.findOne(cond);
    if (item) {
      let updated;
      try {
        updated = await tarifario.update(tarifarioObj, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? tarifario.findOne(cond) : item;
    }

    let result;
    try {
      result = await tarifario.create(tarifarioObj);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function createOrUpdateDetalle (tarifarioDetObj) {
    const cond = {
      where: {
        id: tarifarioDetObj.id
      }
    };

    const item = await tarifarioDetalle.findOne(cond);

    if (item) {
      let updated;

      try {
        updated = await tarifarioDetalle.update(tarifarioDetObj, cond);
      } catch (e) {
        errorHandler(e);
      }

      return updated ? tarifarioDetalle.findOne(cond) : item;
    }

    let result;
    try {
      result = await tarifarioDetalle.create(tarifarioDetObj);
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, tarifario);
  }

  async function deleteItemDetalle (id) {
    return deleteItemModel(id, tarifarioDetalle);
  }

  async function findByTipoMedio (idtipoMedio, include = true) {
    const params = {
      where: {
        id_tipo_medio: idtipoMedio
      },
      raw: false
    };

    if (include) {
      params.include = [{
        model: models.tarifarioDetalle,
        as: 'detalles'
      }];
    }

    const tarifarioObj = await tarifario.findOne(params);

    return tarifarioObj;
  }

  async function findByTipoMedioParametrica (idtipoMedioParametrica, estado = 'ACTIVO') {
    return tarifario.findOne({
      include: [{
        model: models.medioTiposMedio,
        as: 'tipo_medio',
        required: true
      }],
      where: {
        '$tipo_medio.id_tipo_medio$': idtipoMedioParametrica
      },
      raw: true
    });
  }

  async function findAllDetalle (params) {
    let query = getQuery(params);

    query.where = {};

    if (params.id_tarifario) {
      query.where.id_tarifario = params.id_tarifario;
    }

    if (params.id_detalle) {
      query.where.id = {[Op.ne]: params.id_detalle};
    }

    // Se ajusto para que controle horarios intermedios
    if (params.hora_inicio && params.hora_fin) {
      query.where.$or = [
        {
          hora_inicio: { [Op.lt]: params.hora_inicio },
          hora_fin: { [Op.gt]: params.hora_inicio }
        },
        {
          hora_inicio: { [Op.lt]: params.hora_fin },
          hora_fin: { [Op.gt]: params.hora_fin }
        },
        {
          hora_inicio: { [Op.lt]: params.hora_inicio },
          hora_fin: { [Op.gt]: params.hora_fin }
        },
        {
          hora_inicio: { [Op.gt]: params.hora_inicio },
          hora_fin: { [Op.lt]: params.hora_fin }
        },
        {
          hora_inicio: params.hora_inicio,
          hora_fin: params.hora_fin
        }
      ];
    }

    return tarifarioDetalle.findAndCountAll(query);
  }

  return {
    findAll,
    findById,
    deleteItem,
    deleteItemDetalle,
    createOrUpdate,
    createOrUpdateDetalle,
    findByTipoMedio,
    findByTipoMedioParametrica,
    findAllDetalle
  };
};
