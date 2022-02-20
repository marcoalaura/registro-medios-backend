'use strict';

const { setTimestampsSeeder } = require('../lib/util');

let items = [
  { // 1
    label: 'Configuraciones',
    ruta: 'config',
    icono: 'settings',
    orden: 1,
    estado: 'ACTIVO',
    visible: true
  },
  { // 2
    label: 'Entidades',
    ruta: 'entidades',
    orden: 2,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 1
  },
  { // 3
    label: 'Personas',
    ruta: 'personas',
    orden: 3,
    estado: 'ACTIVO',
    visible: false,
    id_modulo: 1
  },
  { // 4
    label: 'Usuarios',
    ruta: 'usuarios',
    orden: 4,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 1
  },
  { // 5
    label: 'Módulos y permisos',
    ruta: 'modulos',
    orden: 5,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 1
  },
  { // 6
    label: 'Preferencias',
    ruta: 'parametros',
    orden: 6,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 1
  },
  { // 7
    label: 'Permisos',
    ruta: 'permisos',
    orden: 7,
    estado: 'ACTIVO',
    visible: false,
    id_modulo: 1
  },
  { // 8
    label: 'Roles',
    ruta: 'roles',
    orden: 8,
    estado: 'ACTIVO',
    visible: false,
    id_modulo: 1
  },
  { // 9
    label: 'Logs del sistema',
    ruta: 'logs',
    orden: 9,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 1
  },
  { // 10
    label: 'Servicios Iop',
    ruta: 'serviciosIop',
    orden: 10,
    estado: 'ACTIVO',
    visible: false,
    id_modulo: 1
  },
  { // 11
    label: 'Medio de Comunicación',
    ruta: 'dashboard',
    orden: 11,
    estado: 'ACTIVO',
    visible: true
  },
  { // 12
    label: 'Registro',
    ruta: 'registro',
    orden: 12,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 11
  },
  { // 13
    label: 'No Adeudo',
    ruta: 'no_adeudo',
    orden: 13,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 11
  },
  { // 14
    label: 'Notificaciones',
    ruta: 'notificaciones',
    orden: 14,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 11
  },
  { // 15
    label: 'Pauteo',
    ruta: '',
    orden: 15,
    estado: 'ACTIVO',
    visible: true
  },
  { // 16
    label: 'Campañas',
    ruta: 'bandejaPauteo',
    orden: 16,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 15
  },
  { // 17
    label: 'Medios',
    ruta: 'medios',
    orden: 17,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 15
  },
  { // 18
    label: 'Estados',
    ruta: 'campanas_estado',
    orden: 18,
    estado: 'ACTIVO',
    visible: false,
    id_modulo: 15
  },
  { // 19
    label: 'Documentacion',
    ruta: 'documentacion',
    orden: 19,
    estado: 'ACTIVO',
    visible: true,
    id_modulo: 15
  }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sys_modulos', items, {});
  },

  down (queryInterface, Sequelize) { }
};
