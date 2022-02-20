'use strict';

const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    tipo_cobertura: {
      type: DataTypes.ENUM,
      values: ['NACIONAL', 'DEPARTAMENTAL', 'PROVINCIAL', 'MUNICIPAL'],
      allowNull: true
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let MedioTiposMedio = sequelize.define('medioTiposMedio', fields, {
    timestamps: false,
    tableName: 'medio_tipos_medio'
  });

  return MedioTiposMedio;
};
