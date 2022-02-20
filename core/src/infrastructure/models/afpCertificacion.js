'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      xlabel: lang.t('fields.mes')
    },
    gestion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      xlabel: lang.t('fields.gestion')
    },
    ruta_adjunto: {
      type: DataTypes.STRING(350),
      xlabel: lang.t('fields.ruta')
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['PENDIENTE', 'ACTIVO', 'INACTIVO', 'RECHAZADO'],
      defaultValue: 'PENDIENTE',
      allowNull: false,
      xlabel: lang.t('fields.estado')
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let afpCertificacion = sequelize.define('afpCertificacion', fields, {
    timestamps: false,
    tableName: 'afp_certificacion'
  });

  return afpCertificacion;
};
