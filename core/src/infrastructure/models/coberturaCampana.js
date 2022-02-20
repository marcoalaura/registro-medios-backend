'use strict';

const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let CoberturaCampana = sequelize.define('coberturaCampana', fields, {
    timestamps: false,
    tableName: 'cobertura_campana'
  });

  return CoberturaCampana;
};
