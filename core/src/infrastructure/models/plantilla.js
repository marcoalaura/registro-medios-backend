'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      xlabel: lang.t('fields.nombre')
    },
    contenido: {
      type: DataTypes.TEXT
    },
    asunto: {
      type: DataTypes.STRING(100)
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Plantilla = sequelize.define('plantilla', fields, {
    timestamps: false,
    tableName: 'plantilla'
  });

  return Plantilla;
};
