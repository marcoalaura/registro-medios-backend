'use strict';

const { setTimestampsSeeder } = require('../lib/util');

let items = [];

// Este bloque se debe reemplazar cuando se tengan los permisos definidos para cada módulo por rol

const nroModules = 16;

// Todos los módulos al SUPER_ADMIN
for (let rol = 1; rol <= 1; rol++) {
  for (let modulo = 1; modulo <= nroModules; modulo++) {
    items.push({
      create: true,
      read: true,
      update: true,
      delete: true,
      firma: false,
      csv: false,
      activo: true,
      id_modulo: modulo,
      id_rol: rol
    });
  }
}
// ROL ADMIN
items.push({
  id_modulo: 1, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // config
}, {
  id_modulo: 2, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // entidades
}, {
  id_modulo: 3, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // personas
}, {
  id_modulo: 4, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // usuarios
}, {
  id_modulo: 5, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // modulos
}, {
  id_modulo: 6, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // preferencias
}, {
  id_modulo: 7, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // permisos
}, {
  id_modulo: 8, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // roles
}, {
  id_modulo: 10, id_rol: 2, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // serviciosIOP,
});

// ROL_TECNCIO
items.push({
  id_modulo: 10, id_rol: 3, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // serviciosIOP,
}, {
  id_modulo: 15, id_rol: 3, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Pauteo,
}, {
  id_modulo: 16, id_rol: 3, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Campañas,
}, {
  id_modulo: 17, id_rol: 3, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Medios-clasificación,
}, {
  id_modulo: 19, id_rol: 3, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Mostrar documentación Medio,
});

// TODO: ROL Jefe por ahora lo mismo que el técnico
items.push({
  id_modulo: 10, id_rol: 4, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // serviciosIOP,
}, {
  id_modulo: 15, id_rol: 4, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Pauteo,
}, {
  id_modulo: 16, id_rol: 4, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Campañas,
}, {
  id_modulo: 17, id_rol: 4, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Medios-clasificación,
}, {
  id_modulo: 18, id_rol: 4, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Cambiar de estado a una campaña,
});

// ROL MEDIO
items.push({
  id_modulo: 11, id_rol: 5, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Medio
}, {
  id_modulo: 12, id_rol: 5, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // Registro
}, {
  id_modulo: 13, id_rol: 5, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // No adeudo
}, {
  id_modulo: 14, id_rol: 5, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // notificaciones,
}, {
  id_modulo: 10, id_rol: 5, create: true, read: true, update: true, delete: true, firma: false, csv: false, activo: true // serviciosIOP,
});

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sys_permisos', items, {});
  },

  down (queryInterface, Sequelize) { }
};
