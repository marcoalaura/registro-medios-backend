'use strict';

const lang = require('../lang');
const util = require('../lib/util');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    email: {
      type: DataTypes.STRING(100),
      xlabel: lang.t('fields.email')
    },
    telefonos: {
      type: DataTypes.STRING(100),
      xlabel: lang.t('fields.telefonos')
    },
    tipo: {
      type: DataTypes.ENUM,
      values: ['REPRESENTANTE_LEGAL', 'CONTACTO'],
      defaultValue: 'REPRESENTANTE_LEGAL',
      validate: {
        isIn: {
          args: [['REPRESENTANTE_LEGAL', 'CONTACTO']],
          msg: 'El tipo de referencia debe ser Representante Legal o Contacto'
        }
      },
      allowNull: false,
      xlabel: lang.t('fields.tipo')
    },
    propietario: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    estado: {
      type: DataTypes.ENUM,
      values: ['ACTIVO', 'INACTIVO'],
      defaultValue: 'ACTIVO',
      allowNull: false,
      xlabel: lang.t('fields.estado')
    },
    ruta_poder_representante: {
      type: DataTypes.STRING(350),
      allowNull: true,
      xlabel: lang.t('fields.ruta')
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let Referencia = sequelize.define('referencia', fields, {
    timestamps: false,
    tableName: 'referencia'
  });

  // Referencia.obtenerPersonaSegunIdReferencia = function(idReferencia) {
  //   return new Promise((resolve, reject) => {
  //     sequelize.query(`SELECT * 
  //     FROM referencia r, sys_personas sp
  //     WHERE r.id_persona = sp.id AND
  //       r.id = :idReferencia`, {
  //       replacements: {
  //         idReferencia: idReferencia
  //       },
  //       type: sequelize.QueryTypes.SELECT
  //     })
  //       .then((result) => {
  //         resolve(result);
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // }

  return Referencia;
};
