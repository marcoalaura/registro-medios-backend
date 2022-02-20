'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function personasRepository (models, Sequelize) {
  const { personas } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.nombre_completo) {
      query.where[Op.or] = [
        { nombres: { [Op.iLike]: `%${params.nombre_completo}%` } },
        { primer_apellido: { [Op.iLike]: `%${params.nombre_completo}%` } },
        { segundo_apellido: { [Op.iLike]: `%${params.nombre_completo}%` } }
      ];
    }

    if (params.tipo_documento) {
      query.where.tipo_documento = params.tipo_documento;
    }

    if (params.nro_documento) {
      query.where.nro_documento = {
        [Op.iLike]: `%${params.nro_documento}%`
      };
    }

    if (params.telefono) {
      query.where.telefono = {
        [Op.iLike]: `%${params.telefono}%`
      };
    }

    if (params.movil) {
      query.where.movil = {
        [Op.iLike]: `%${params.movil}%`
      };
    }

    if (params.nacionalidad) {
      query.where.nacionalidad = params.nacionalidad;
    }

    if (params.pais_origen) {
      query.where.pais_origen = params.pais_origen;
    }

    if (params.genero) {
      query.where.genero = params.genero;
    }

    if (params.estado) {
      query.where.estado = params.estado;
    }

    return personas.findAndCountAll(query);
  }

  function findById (id) {
    return personas.findOne({
      where: {
        id
      }
    });
  }

  function findByCI (ci, fechaNacimiento) {
    return personas.findOne({
      where: {
        nro_documento: ci,
        fecha_nacimiento: fechaNacimiento
      }
    });
  }

  async function createOrUpdate (usuario) {
    const cond = {
      where: {
        id: usuario.id
      }
    };

    const item = await personas.findOne(cond);

    if (item) {
      let updated;
      try {
        updated = await personas.update(usuario, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? personas.findOne(cond) : item;
    }

    let result;
    try {
      result = await personas.create(usuario);
    } catch (e) {
      errorHandler(e);
    }
    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, personas);
  }

  return {
    findAll,
    findById,
    findByCI,
    createOrUpdate,
    deleteItem
  };
};
