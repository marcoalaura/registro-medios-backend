'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    nombre: {
      type: DataTypes.STRING(70),
      allowNull: false,
      xlabel: lang.t('fields.nombre')
    },
    codigo: {
      type: DataTypes.STRING(30),
      allowNull: true,
      xlabel: lang.t('fields.codigo')
    },
    descripcion: {
      type: DataTypes.STRING(250),
      allowNull: false,
      xlabel: lang.t('fields.descripcion')
    },
    gestion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      xlabel: lang.t('fields.fecha_inicio')
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      xlabel: lang.t('fields.fecha_fin')
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['NUEVO', 'CREADO', 'APROBADO', 'OBSERVADO', 'RECHAZADO', 'GENERADO', 'EN_CURSO', 'FINALIZADO'],
      defaultValue: 'NUEVO',
      allowNull: false,
      xlabel: lang.t('fields.estado')
    },
    tipo_cobertura: {
      type: DataTypes.ENUM,
      values: ['NACIONAL', 'DEPARTAMENTAL', 'PROVINCIAL', 'MUNICIPAL'],
      allowNull: true
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mensaje_estado: {
      type: DataTypes.STRING(250)
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_observacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_rechazo: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_generacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cite: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    inicio_correlativo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    visual_correlativo: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Campana = sequelize.define('campana', fields, {
    timestamps: false,
    tableName: 'campana'
  });

  Campana.buscarCampanaPorId = function (idCampana) {
    return new Promise((resolve, reject) => {
      sequelize.query(`SELECT * 
      FROM campana c, campana_medio cm, medio m, orden_publicidad op, tarifario_detalle td
      WHERE c.id = cm.id_campana AND
        m.id = cm.id_medio AND
        op.id_campana_medio = cm.id AND
        op.id_tarifario_det = td.id AND
        c.id = :idCampana`, {
        replacements: {
          idCampana: idCampana
        },
        type: sequelize.QueryTypes.SELECT
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return Campana;
};
