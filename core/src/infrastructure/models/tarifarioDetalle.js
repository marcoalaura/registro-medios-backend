'use strict';

const util = require('../lib/util');
const lang = require('../lang');

module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize;
  let fields = {
    id: util.pk,
    hora_inicio: {
      type: DataTypes.TIME,
      xlabel: lang.t('fields.hora_inicio')
    },
    hora_fin: {
      type: DataTypes.TIME,
      xlabel: lang.t('fields.hora_fin')
    },
    costo: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    especificacion: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    periodicidad: {
      type: DataTypes.ENUM,
      values: ['DIARIO', 'SEMANARIO', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL'],
      validate: {
        isIn: {
          args: [['DIARIO', 'SEMANARIO', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL']],
          msg: 'El tipo de periodicidad debe ser Diario, Semanario, Quincenal, Mensual o Trimestral'
        }
      },
      allowNull: true
    },
    dias: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: null
    },
    tipo_costo: {
      type: DataTypes.ENUM,
      values: ['ARTE', 'SEPARATA', 'PAQUETE', 'SEGUNDO', 'PASE', 'PLANA'],
      validate: {
        isIn: {
          args: [['ARTE', 'SEPARATA', 'PAQUETE', 'SEGUNDO', 'PASE', 'PLANA']],
          msg: 'El tipo de costo debe ser Arte, Separata, Paquete, Segundo, Pase o Plana'
        }
      },
      allowNull: true
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let tarifario = sequelize.define('tarifario_detalle', fields, {
    timestamps: false,
    tableName: 'tarifario_detalle'
  });

  return tarifario;
};
