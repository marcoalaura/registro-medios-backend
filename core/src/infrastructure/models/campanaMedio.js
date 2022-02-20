'use strict';

const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    observacion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    correlativo: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let CampanaMedio = sequelize.define('campanaMedio', fields, {
    timestamps: false,
    tableName: 'campana_medio'
  });

  return CampanaMedio;
};
