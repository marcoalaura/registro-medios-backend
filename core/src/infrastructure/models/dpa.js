'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    nivel_dpa: {
      type: DataTypes.INTEGER,
      xlabel: lang.t('fields.nivel_dpa')
    },
    nombre: {
      type: DataTypes.STRING(250),
      allowNull: false,
      xlabel: lang.t('fields.nombre')
    },
    codigo_ine: {
      type: DataTypes.STRING(20),
      xlabel: lang.t('fields.codigo_ine')
    },
    latitud: {
      type: DataTypes.DECIMAL(18, 5),
      xlabel: lang.t('fields.latitud')
    },
    longitud: {
      type: DataTypes.DECIMAL(18, 5),
      xlabel: lang.t('fields.longitud')
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['ACTIVO', 'INACTIVO'],
      defaultValue: 'ACTIVO',
      allowNull: false,
      xlabel: lang.t('fields.estado')
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Dpa = sequelize.define('dpa', fields, {
    timestamps: false,
    tableName: 'dpa'
  });

  return Dpa;
};
