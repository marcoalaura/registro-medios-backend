'use strict';

const { getQuery, errorHandler } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');
const { text } = require('common');

module.exports = function usuariosRepository (models, Sequelize) {
  const { usuarios, roles, personas, entidades } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    query.include = [
      {
        attributes: ['nombre'],
        model: roles,
        as: 'rol'
      },
      {
        attributes: ['nombre'],
        model: entidades,
        as: 'entidad'
      },
      {
        attributes: [
          'nombres',
          'primer_apellido',
          'segundo_apellido',
          'nombre_completo',
          'tipo_documento',
          'tipo_documento_otro',
          'nro_documento',
          'fecha_nacimiento',
          'telefono',
          'movil',
          'nacionalidad',
          'pais_nacimiento',
          'genero',
          'estado'
        ],
        model: personas,
        as: 'persona'
      }
    ];

    if (params.usuario) {
      query.where.usuario = {
        [Op.iLike]: `%${params.usuario}%`
      };
    }

    if (params.email) {
      query.where.email = {
        [Op.iLike]: `%${params.email}%`
      };
    }

    if (params.cargo) {
      query.where.cargo = {
        [Op.iLike]: `%${params.cargo}%`
      };
    }

    if (params.estado) {
      query.where.estado = params.estado;
    }

    if (params.id_rol) {
      query.where.id_rol = params.id_rol;
    }

    if (params.id_entidad) {
      query.where.id_entidad = params.id_entidad;
    }

    if (params.id_persona) {
      query.where.id_persona = params.id_persona;
    }

    if (params.id_roles) {
      query.where.id_rol = {
        [Op.or]: params.id_roles
      };
    }

    return usuarios.findAndCountAll(query);
  }

  function findById (id) {
    return usuarios.findOne({
      where: {
        id
      },
      include: [
        {
          attributes: ['nombre'],
          model: roles,
          as: 'rol'
        },
        {
          attributes: ['nombre'],
          model: entidades,
          as: 'entidad'
        },
        {
          attributes: [
            'nombres',
            'primer_apellido',
            'segundo_apellido',
            'nombre_completo',
            'tipo_documento',
            'tipo_documento_otro',
            'nro_documento',
            'fecha_nacimiento',
            'telefono',
            'movil',
            'nacionalidad',
            'pais_nacimiento',
            'genero',
            'estado'
          ],
          model: personas,
          as: 'persona'
        }
      ],
      raw: true
    });
  }

  function findByUsername (usuario, include = true) {
    return findByField('usuario', usuario, include);
  }

  async function findByNit (nit, include = true) {
    return findByField('nit', nit, include);
  }

  async function createOrUpdate (usuario) {
    const cond = {
      where: {
        id: usuario.id
      }
    };

    const item = await usuarios.findOne(cond);

    if (item) {
      let updated;
      try {
        if (usuario.contrasena) {
          usuario.contrasena = text.encrypt(usuario.contrasena);
        }
        updated = await usuarios.update(usuario, cond);
      } catch (e) {
        errorHandler(e);
      }
      return updated ? usuarios.findOne(cond) : item;
    }

    let result;
    try {
      usuario.contrasena = usuario.contrasena ? text.encrypt(usuario.contrasena) : null;
      result = await usuarios.create(usuario);
    } catch (e) {
      errorHandler(e);
    }
    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, usuarios);
  }

  async function findByField (field, value, include = true) {
    let cond = {
      where: {}
    };
    cond.where[`${field}`] = value;
    if (include) {
      cond.include = [
        {
          attributes: ['nombre'],
          model: roles,
          as: 'rol'
        }, {
          attributes: ['nombre'],
          model: entidades,
          as: 'entidad'
        }, {
          attributes: [
            'nombres',
            'primer_apellido',
            'segundo_apellido',
            'nombre_completo',
            'tipo_documento',
            'tipo_documento_otro',
            'nro_documento',
            'fecha_nacimiento',
            'telefono',
            'movil',
            'nacionalidad',
            'pais_nacimiento',
            'genero',
            'estado'
          ],
          model: personas,
          as: 'persona'
        }
      ];
      if (field === 'nit') {
        cond.include.push({
          attributes: ['id', 'matricula', 'nit', 'estado'],
          model: models.medio,
          as: 'medios'
        });
      }
      cond.raw = true;
      cond.comment = 'DEBUG: Testing .findOne().';
    }
    return usuarios.findOne(cond);
  }

  return {
    findAll,
    findById,
    findByUsername,
    findByNit,
    createOrUpdate,
    deleteItem
  };
};
