'use strict';

const util = require('../lib/util');
const lang = require('../lang');

module.exports = (sequelize, DataTypes) => {
  let fields = {
    id: util.pk,
    nro_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(250),
      allowNull: false,
      xlabel: lang.t('fields.nombre')
    },
    edicion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha_publicacion: {
      type: DataTypes.DATEONLY
    },
    formato: {
      type: DataTypes.STRING(50)
    },
    ubicacion: {
      type: DataTypes.STRING(50)
    },
    costo: {
      type: DataTypes.DECIMAL,
      allowNull: false
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
    },
    nro_pases: {
      type: DataTypes.INTEGER
    },
    hora_inicio: {
      type: DataTypes.TIME
    }
  };

  // Agregando campos para el log
  fields = util.setTimestamps(fields);

  let OrdenPublicidad = sequelize.define('ordenPublicidad', fields, {
    timestamps: false,
    tableName: 'orden_publicidad'
  });

  return OrdenPublicidad;
};
