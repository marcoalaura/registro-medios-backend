'use strict';

const { setTimestampsSeeder } = require('../lib/util');

let items = [
  { nombre: 'SUPERADMIN', descripcion: 'Super Administrador' },
  { nombre: 'ADMIN', descripcion: 'Administrador' },
  { nombre: 'Técnico de la unidad de difusión', descripcion: 'Es quien inicia la solicitud de contratación, crea todos los documentos necesarios.' },
  { nombre: 'Jefe de Difusión y Pauteo', descripcion: 'Aprueba la documentación elaborada por el técnico de la unidad de difusión' },
  { nombre: 'MEDIO', descripcion: 'Medio de Comunicación que solicita publicidad al Ministerio' }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sys_roles', items, {});
  },

  down (queryInterface, Sequelize) { }
};
