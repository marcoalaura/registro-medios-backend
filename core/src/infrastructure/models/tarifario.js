'use strict';

const util = require('../lib/util');
const lang = require('../lang');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    fecha_inicio: {
      type: DataTypes.TIME,
      xlabel: lang.t('fields.hora_inicio')
    },
    fecha_fin: {
      type: DataTypes.TIME,
      xlabel: lang.t('fields.hora_fin')
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['PENDIENTE', 'ACTIVO', 'INACTIVO'],
      defaultValue: 'PENDIENTE',
      validate: {
        isIn: {
          args: [['PENDIENTE', 'ACTIVO', 'INACTIVO']],
          msg: 'El Estado del Tarifario debe ser PENDIENTE, ACTIVO o INACTIVO'
        }
      },
      allowNull: false
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let tarifario = sequelize.define('tarifario', fields, {
    timestamps: false,
    tableName: 'tarifario'
  });

  return tarifario;
};
