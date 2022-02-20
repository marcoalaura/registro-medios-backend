'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      xlabel: lang.t('fields.nombre')
    },
    descripcion: {
      type: DataTypes.TEXT,
      xlabel: lang.t('fields.descripcion')
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Roles = sequelize.define('roles', fields, {
    timestamps: false,
    tableName: 'sys_roles'
  });

  return Roles;
};
