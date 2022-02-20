'use strict';

const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let CoberturaMedio = sequelize.define('coberturaMedio', fields, {
    timestamps: false,
    tableName: 'cobertura_medio'
  });

  return CoberturaMedio;
};
