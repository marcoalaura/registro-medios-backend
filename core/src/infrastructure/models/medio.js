'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    nit: {
      type: DataTypes.STRING(15),
      allowNull: false,
      xlabel: lang.t('fields.nit')
    },
    matricula: {
      type: DataTypes.STRING(50),
      allowNull: true,
      xlabel: lang.t('fields.matricula')
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: true,
      xlabel: lang.t('fields.razon_social')
    },
    tipo_societario: {
      type: DataTypes.STRING(200),
      allowNull: true,
      xlabel: lang.t('fields.tipo_societario')
    },
    tipo_grupo: {
      type: DataTypes.ENUM,
      values: ['MEDIO', 'RED', 'PRODUCTOR'],
      defaultValue: 'MEDIO',
      allowNull: false,
      xlabel: lang.t('fields.tipo_grupo')
    },
    medios: {
      type: DataTypes.STRING(200),
      xlabel: lang.t('fields.medios')
    },
    ultima_actualizacion: {
      type: DataTypes.STRING(20),
      xlabel: lang.t('fields.ultima_actualizacion')
    },
    email: {
      type: DataTypes.STRING(100),
      xlabel: lang.t('fields.email')
    },
    telefonos: {
      type: DataTypes.STRING(100),
      xlabel: lang.t('fields.telefonos')
    },
    direccion: {
      type: DataTypes.TEXT,
      xlabel: lang.t('fields.direccion')
    },
    web: {
      type: DataTypes.STRING(100),
      xlabel: lang.t('fields.web')
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['PENDIENTE', 'POR_CLASIFICAR', 'ACTIVO', 'INACTIVO'],
      defaultValue: 'PENDIENTE',
      allowNull: false,
      xlabel: lang.t('fields.estado')
    },
    fecha_envio: {
      type: DataTypes.DATE
    },
    fecha_clasificacion: {
      type: DataTypes.DATE
    },
    clasificacion: {
      type: DataTypes.ENUM,
      values: ['REGULAR', 'EVENTUAL', 'EN_EVALUACION']
    },
    info: {
      type: DataTypes.JSON,
      xlabel: lang.t('fields.info')
    },
    ruta_att: {
      type: DataTypes.STRING(350)
    },
    ruta_rupe: {
      type: DataTypes.STRING(350)
    },
    ruta_contrato_medio: {
      type: DataTypes.STRING(350)
    },
    ruta_no_comercial: {
      type: DataTypes.STRING(350)
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Medio = sequelize.define('medio', fields, {
    timestamps: false,
    tableName: 'medio'
  });

  return Medio;
};
