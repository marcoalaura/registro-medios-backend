'use strict';

const { setTimestampsSeeder } = require('../lib/util');

let items = [
  {
    codigo: 'SEGIP-01',
    metodo: 'Buscar persona por cédula de identidad',
    descripcion: 'Servicio que busca una persona mediante su número de documento',
    entidad: 'SEGIP',
    url: 'https://interoperabilidad.agetic.gob.bo/fake/segip/v2/personas/',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxWGswY1pheWJxMXd6M2RjUjlQaER4Rmd1eHJpbVBVRiIsInVzZXIiOiJvZ3V0aWVycmV6IiwiZXhwIjoxNTI2NTg1NTM4LCJpYXQiOjE1MTg4MDk1Mzh9.E8kqSP-gdI0EJu7D30FUCUOcLZNADTIABEj4Et7pGrU',
    tipo: 'CONVENIO',
    estado: 'ACTIVO'
  },
  {
    codigo: 'SEGIP-02',
    metodo: 'Contrastación de persona',
    descripcion: 'Servicio que contrasta una persona mediante los datos que se le envíe',
    entidad: 'SEGIP',
    url: 'https://interoperabilidad.agetic.gob.bo/fake/segip/v2/personas/contrastacion',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxWGswY1pheWJxMXd6M2RjUjlQaER4Rmd1eHJpbVBVRiIsInVzZXIiOiJvZ3V0aWVycmV6IiwiZXhwIjoxNTI2NTg1NTM4LCJpYXQiOjE1MTg4MDk1Mzh9.E8kqSP-gdI0EJu7D30FUCUOcLZNADTIABEj4Et7pGrU',
    tipo: 'CONVENIO',
    estado: 'ACTIVO'
  },
  {
    codigo: 'FUNDEMPRESA-01',
    metodo: 'Buscar matrículas en base a un NIT',
    descripcion: 'Servicio que busca una persona mediante su número de documento',
    entidad: 'FUNDEMPRESA',
    url: 'https://interoperabilidad.agetic.gob.bo/fake/fundempresa/v1/nit/',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxWGswY1pheWJxMXd6M2RjUjlQaER4Rmd1eHJpbVBVRiIsInVzZXIiOiJvZ3V0aWVycmV6IiwiZXhwIjoxNTI2NTg1NTM4LCJpYXQiOjE1MTg4MDk1Mzh9.E8kqSP-gdI0EJu7D30FUCUOcLZNADTIABEj4Et7pGrU',
    tipo: 'CONVENIO',
    estado: 'ACTIVO'
  },
  {
    codigo: 'FUNDEMPRESA-02',
    metodo: 'Buscar matrículas en base a un NIT',
    descripcion: 'Servicio que busca una persona mediante su número de documento',
    entidad: 'FUNDEMPRESA',
    url: 'https://interoperabilidad.agetic.gob.bo/fake/fundempresa/v2/',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqMlkzSnhjWnI3MzlONFdRVjR0YkJzYjlFUUZYUjhGWSIsInVzZXIiOiJydmFsbGVqb3MiLCJleHAiOjE1MjU4OTY2NzcsImlhdCI6MTUxODEyMDY3N30.BMJxXA6kPyQjnzFipo19kwV9bhZuFIafdImVlBBw0r8',
    tipo: 'CONVENIO',
    estado: 'ACTIVO'
  },
  {
    codigo: 'SIN-01',
    metodo: 'Autentica en el servicio de SIN',
    descripcion: 'Servicio que autentica al Servicio del SIN con: nit, usuario y clve',
    entidad: 'SIN',
    url: 'https://interoperabilidad.agetic.gob.bo/fake/impuestos/v1/',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqMlkzSnhjWnI3MzlONFdRVjR0YkJzYjlFUUZYUjhGWSIsInVzZXIiOiJydmFsbGVqb3MiLCJleHAiOjE1MjU4OTY2NzcsImlhdCI6MTUxODEyMDY3N30.BMJxXA6kPyQjnzFipo19kwV9bhZuFIafdImVlBBw0r8',
    tipo: 'CONVENIO',
    estado: 'ACTIVO'
  }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('servicios_iop', items, {});
  },

  down (queryInterface, Sequelize) { }
};
