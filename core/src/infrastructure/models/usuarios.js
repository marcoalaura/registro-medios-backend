'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    usuario: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      xlabel: lang.t('fields.usuario')
    },
    nit: {
      type: DataTypes.STRING(15),
      allowNull: true,
      xlabel: lang.t('fields.nit')
    },
    contrasena: {
      type: DataTypes.STRING(255),
      xlabel: lang.t('fields.contrasena'),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      xlabel: lang.t('fields.email'),
      validate: {
        isEmail: true
      },
      allowNull: true
    },
    cargo: {
      type: DataTypes.STRING(255),
      xlabel: lang.t('fields.cargo')
    },
    tour: {
      type: DataTypes.JSON,
      xlabel: lang.t('fields.tour')
    },
    ultimo_login: {
      type: DataTypes.DATE,
      xlabel: lang.t('fields.ultimo_login')
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['ACTIVO', 'INACTIVO', 'PENDIENTE'],
      defaultValue: 'ACTIVO',
      allowNull: false,
      xlabel: lang.t('fields.estado')
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Users = sequelize.define('usuarios', fields, {
    timestamps: false,
    tableName: 'sys_usuarios'
  });

  return Users;
};
