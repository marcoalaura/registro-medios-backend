'use strict';

const { setTimestampsSeeder } = require('../lib/util');

let items = [
  {
    id: 1,
    grupo: 'TIPO_MEDIO',
    sigla: 'TV',
    nombre: 'Televisión',
    descripcion: 'Tipo de Medio: Televisión',
    orden: 1,
    estado: 'ACTIVO'
  },
  {
    id: 2,
    grupo: 'TIPO_MEDIO',
    sigla: 'Radio',
    nombre: 'Radio',
    descripcion: 'Tipo de Medio: Radio',
    orden: 2,
    estado: 'ACTIVO'
  },
  {
    id: 3,
    grupo: 'TIPO_MEDIO',
    sigla: 'Prensa',
    nombre: 'Prensa Escrita',
    descripcion: 'Prensa Escrita: periódicos, revistas, publicaciones escritas',
    orden: 3,
    estado: 'ACTIVO'
  },
  {
    id: 4,
    grupo: 'TIPO_MEDIO',
    sigla: 'Radio FM',
    nombre: 'Radio FM',
    descripcion: 'Tipo de Medio: Radio FM',
    orden: 4,
    estado: 'ACTIVO'
  },
  {
    id: 5,
    grupo: 'TIPO_MEDIO',
    sigla: 'Radio AM',
    nombre: 'Radio AM',
    descripcion: 'Tipo de Medio: Radio AM',
    orden: 5,
    estado: 'ACTIVO'
  },
  {
    id: 6,
    grupo: 'TIPO_MEDIO',
    sigla: 'Productor Independiente TV',
    nombre: 'Productor Independiente TV',
    descripcion: 'Productor Independiente TV',
    orden: 6,
    estado: 'ACTIVO'
  },
  {
    id: 7,
    grupo: 'TIPO_MEDIO',
    sigla: 'Productor Independiente Radio FM',
    nombre: 'Productor Independiente Radio FM',
    descripcion: 'Productor Independiente Radio FM',
    orden: 7,
    estado: 'ACTIVO'
  },
  {
    id: 8,
    grupo: 'TIPO_MEDIO',
    sigla: 'Productor Independiente Radio AM',
    nombre: 'Productor Independiente Radio AM',
    descripcion: 'Productor Independiente Radio AM',
    orden: 8,
    estado: 'ACTIVO'
  },
  {
    id: 9,
    grupo: 'ASEGURADORA_AFP',
    sigla: 'FUTURO',
    nombre: 'Futuro de Bolivia AFP',
    descripcion: 'Futuro de Bolivia AFP',
    orden: 9,
    estado: 'ACTIVO'
  },
  {
    id: 10,
    grupo: 'ASEGURADORA_AFP',
    sigla: 'PREVISION',
    nombre: 'BBVA Previsión AFP',
    descripcion: 'BBVA Previsión AFP',
    orden: 10,
    estado: 'ACTIVO'
  }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sys_parametrica', items, {});
  },

  down (queryInterface, Sequelize) { }
};
