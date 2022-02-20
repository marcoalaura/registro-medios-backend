'use strict';

const Sequelize = require('sequelize');
const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function campanaRepository (models, Sequelize) {
  const { campana, campanaMedio } = models;
  const Op = Sequelize.Op;

  /**
   * @param {object} parametros de la consulta
   * @param {boolean} valor booleano que indica si se incluye o no a la tabla parámetrica para obtener el tipo de campaña y el tećnico que creó
   */

  async function costoCampanaTV (params) {
    
    try {
      const campanha = await campana.buscarCampanaPorId(params);
      if (!campanha) {
        throw new Error('No se encontro solicitud con ese Id');
      }
      return campanha;
    } catch (error) {
      console.log(error);
      throw new Error(error.code);
    }
  };

  function findAll (params = {}, include = true) {
    let query = getQuery(params);

    query.where = {};
    query.raw = false;

    if (params.id_tipo_campana) {
      query.where.id_medio_tipo_medio = params.id_tipo_medio;
    }

    if (params.id_tecnico) {
      query.where.id_tecnico = params.id_tecnico;
    }

    if (params.gestion) {
      query.where.gestion = params.gestion;
    }

    if (params.nombre) {
      query.where.nombre = {
        [Op.iLike]: `${params.nombre}`
      };
    }

    if (include) {
      const includeTipoCampana = {
        model: models.parametrica,
        as: 'tipo_campana'
      };

      const includePersona = {
        attributes: ['id', 'nombres', 'primer_apellido', 'segundo_apellido', 'nombre_completo', 'nro_documento', 'fecha_nacimiento', 'estado'],
        model: models.personas,
        as: 'persona'
      };

      const includeTecnico = {
        model: models.usuarios,
        attributes: ['id', 'usuario', 'email', 'estado'],
        as: 'tecnico',
        include: [includePersona]
      };

      query.include = [includeTipoCampana, includeTecnico];
    }
    return campana.findAndCountAll(query);
  }

  async function findById (id) {
    const includeTipoCampana = {
      model: models.parametrica,
      as: 'tipo_campana'
    };

    const includePersona = {
      attributes: ['id', 'nombres', 'primer_apellido', 'segundo_apellido', 'nombre_completo', 'nro_documento', 'fecha_nacimiento', 'estado'],
      model: models.personas,
      as: 'persona'
    };

    const includeTecnico = {
      model: models.usuarios,
      attributes: ['id', 'usuario', 'email', 'estado'],
      as: 'tecnico',
      include: [includePersona]
    };

    const includeMedios = {
      model: models.medio,
      as: 'medios',
      attributes: ['id', 'razon_social'],
      through: 'campanaMedio'
    };

    const campanaReturn = await campana.findOne({
      where: {
        id
      },
      include: [includeTipoCampana, includeTecnico, includeMedios],
      raw: false
    });
    return campanaReturn ? campanaReturn.toJSON() : campanaReturn;
  }

  async function findCampanaMedioById (id) {
    const campanaMedioObj = await campanaMedio.findById(id, {
      include: [{
        model: models.referencia,
        as: 'referencia',
        include: [{
          model: models.personas,
          as: 'persona'
        }]
      }]
    });
    return campanaMedioObj;
  }

  async function createOrUpdate (data, t) {
    const cond = {
      where: {
        id: data.id
      }
    };

    const item = await campana.findOne(cond);

    if (item) {
      let updated;
      try {
        if (t) {
          cond.transaction = t;
        }

        updated = await campana.update(data, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? campana.findOne(cond) : item;
    }

    let result;
    try {
      result = await campana.create(data, t ? { transaction: t } : {});
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function bulkCreate (data, t) {
    try {
      return campana.bulkCreate(data, t ? {transaction: t} : {});
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
      return campana.destroy(params, t ? {transaction: t} : {});
    } catch (e) {
      errorHandler(e);
    }
  }

  async function deleteItem (id) {
    return deleteItemModel(id, campana);
  }

  async function assignMedios (idCampana, medios, t) {
    try {
      await campanaMedio.destroy({
        where: {
          id_campana: idCampana
        }
      }, t ? {transaction: t} : {});
      const campanasMedios = await campanaMedio.bulkCreate(medios, t ? { transaction: t, returning: true } : {returning: true});
      return campanasMedios;
    } catch (e) {
      errorHandler(e);
    }
  }

  async function createOrUpdateCampanaMedio (data, t) {
    const cond = {
      where: {
        id: data.id
      }
    };

    const item = await campanaMedio.findOne(cond);

    if (item) {
      let updated;
      try {
        if (t) {
          cond.transaction = t;
        }

        updated = await campanaMedio.update(data, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? campanaMedio.findOne(cond) : item;
    }

    let result;
    try {
      result = await campanaMedio.create(data, t ? { transaction: t } : {});
    } catch (e) {
      errorHandler(e);
    }

    return result.toJSON();
  }

  async function findAllMedios (idCampana) {
    return campanaMedio.findAll({
      where: {
        id_campana: idCampana
      },
      include: [{
        attributes: ['id', 'razon_social'],
        model: models.medio,
        as: 'medio'
      }, {
        model: models.ordenPublicidad,
        as: 'ordenes',
        raw: false
      }],
      raw: false
    });
  }

  async function deleteCampanaMedioItem (id) {
    return deleteItemModel(id, campanaMedio);
  }

  return {
    costoCampanaTV,
    findAll,
    findById,
    deleteItem,
    createOrUpdate,
    bulkCreate,
    bulkDelete,
    assignMedios,
    findAllMedios,
    deleteCampanaMedioItem,
    findCampanaMedioById,
    createOrUpdateCampanaMedio,
  };
};
