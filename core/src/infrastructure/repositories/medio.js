'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function medioRepository (models, Sequelize) {
  const { medio, medioTiposMedio, referencia } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.razon_social) {
      query.where.razon_social = {
        [Op.iLike]: `%${params.razon_social}%`
      };
    }

    if (params.nit) {
      query.where.nit = {
        [Op.iLike]: `%${params.nit}%`
      };
    }

    if (params.matricula) {
      query.where.matricula = params.matricula;
    }

    if (params.idMedio) {
      query.where.id = params.idMedio;
    }

    if (params.estado) {
      query.where.estado = params.estado;
    }

    if (params.email) {
      query.where.email = params.email;
    }

    query.include = [{
      model: models.parametrica,
      as: 'tipos_medio',
      through: 'medioTiposMedio'
    }, {
      model: models.referencia,
      as: 'referencia',
      where: { estado: 'ACTIVO' },
      include: [{
        model: models.personas,
        as: 'persona',
        // required: true
      }]
    // {
    //   model: models.personas,
    //   as: 'referencias',
    //   through: 'referencia'
    }];

    query.raw = false;

    return medio.findAndCountAll(query);
  }

  async function findById (id) {
    const result = await medio.findOne({
      where: {
        id
      },
      include: [{
        model: models.parametrica,
        as: 'tipos_medio'
      }],
      raw: false
    });
    return result ? result.toJSON() : result;
  }

  async function createOrUpdate (medioObj, t) {
    const cond = {
      where: {
        id: medioObj.id
      }
    };

    const item = await medio.findOne(cond);
    if (item) {
      let updated;
      try {
        if (t) {
          cond.transaction = t;
        }
        updated = await medio.update(medioObj, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? medio.findOne(cond) : item;
    }

    let result;
    try {
      result = await medio.create(medioObj, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, medio);
  }

  async function assignTiposMedio (id, tiposMedio, t) {
    try {
      const medioFound = await findById(id);
      if (!medioFound) {
        errorHandler(new Error(`No se encontró el medio solicitado. Por favor, verifique sus datos`));
      }
      await medioTiposMedio.destroy({
        where: {
          id_medio: id
        }
      }, t ? {transaction: t} : {});
      const tiposMedioReturn = await medioTiposMedio.bulkCreate(tiposMedio, t ? { transaction: t, returning: true } : {returning: true});
      return tiposMedioReturn;
    } catch (e) {
      errorHandler(e);
    }
  }

  async function createOrUpdateTipoMedio (idMedio, tipoMedio, t) {
    const cond = {
      where: {
        id: tipoMedio.id
      }
    };
    const item = await medioTiposMedio.findOne(cond);
    if (item) {
      let updated;
      try {
        if (t) {
          cond.transaction = t;
        }
        updated = await medioTiposMedio.update(tipoMedio, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? medioTiposMedio.findOne(cond) : item;
    }
    let result;
    try {
      result = await medioTiposMedio.create(tipoMedio, t ? { transaction: t } : {});
    } catch (e) {
      errorHandler(e);
    }
    return result.toJSON();
  }

  async function deleteTipoMedio (idTipoMedio, t) {
    try {
      return medioTiposMedio.destroy({
        where: {
          id: idTipoMedio
        }
      }, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function destroyTiposMedio (id, tiposMedio, t) {
    try {
      const medioFound = await findById(id);
      if (!medioFound) {
        errorHandler(new Error(`No se encontró el medio solicitado. Por favor, verifique sus datos`));
      }
      return medioTiposMedio.destroy({
        where: {
          id_medio: id
        }
      }, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function findByIdDetails (id, params = {}) {
    return medio.findById(id, {
      attributes: ['id', 'nit', 'matricula', 'razon_social', 'tipo_societario', 'tipo_grupo', 'medios', 'email', 'telefonos', 'direccion', 'web', 'fecha_envio', 'estado', 'ruta_att', 'ruta_contrato_medio', 'ruta_rupe', 'ruta_no_comercial', 'id_usuario'],
      include: [{
        attributes: ['id', 'usuario', 'nit', 'email', 'estado'],
        model: models.usuarios,
        as: 'usuario'
      }, {
        model: models.referencia,
        as: 'referencia',
        where: { estado: 'ACTIVO' },
        required: false,
        include: [{
          model: models.personas,
          as: 'persona',
          required: true
        }]
      }, {
        model: models.parametrica,
        as: 'tipos_medio',
        through: 'medioTiposMedio'
      }]
    });
  }

  async function findByCampana (params) {
    const medios = await medio.findAll({
      raw: false,
      include: [{
        required: true,
        model: models.parametrica,
        as: 'tipos_medio',
        raw: false,
        through: {
          attributes: ['id', 'tipo_cobertura']
        },
        where: {
          id: params.id_tipo_campana
        }
      }, {
        model: models.afpCertificacion,
        as: 'afp_certificacion'
      }],
      where: {
        estado: 'ACTIVO'
      }
    });
    return medios;
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate,
    createOrUpdateTipoMedio,
    assignTiposMedio,
    findByIdDetails,
    deleteTipoMedio,
    destroyTiposMedio,
    findByCampana
  };
};
