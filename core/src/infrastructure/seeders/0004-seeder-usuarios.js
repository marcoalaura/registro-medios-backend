'use strict';

const casual = require('casual');
const { setTimestampsSeeder } = require('../lib/util');
const { text } = require('common');
const contrasena = text.encrypt('_M1nC0mun1c4c10n_9');
const usernameTecnico = 'tecnico1';
const usernameJefe = 'jefe1';

// Datos de producción
let items = [
  {
    usuario: 'superadmin',
    contrasena,
    email: 'admin@agetic.gob.bo',
    estado: 'ACTIVO',
    cargo: 'Profesional',
    id_persona: 1,
    id_rol: 1,
    id_entidad: 1
  }, {
    usuario: 'admin',
    contrasena,
    email: 'admin@comunicacion.gob.bo',
    estado: 'ACTIVO',
    cargo: 'Profesional',
    id_persona: 1,
    id_rol: 2,
    id_entidad: 2
  }, {
    usuario: usernameTecnico,
    contrasena,
    email: casual.email,
    estado: 'ACTIVO',
    id_persona: 1,
    id_rol: 3,
    id_entidad: 2
  }, {
    usuario: usernameJefe,
    contrasena,
    email: casual.email,
    estado: 'ACTIVO',
    id_persona: 1,
    id_rol: 4,
    id_entidad: 2
  }
];

// Agregando datos aleatorios para desarrollo
if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV !== 'production') {
  const arrayNits = [{
    nit: 283672023,
    usuario: 'labocast',
    password: 'labocast'
  }, {
    nit: 494937017,
    usuario: 'biotec',
    password: 'biotec'
  }];
  let usuarios = Array(2).fill().map((_, i) => {
    let item = {
      usuario: arrayNits[i].usuario,
      contrasena: text.encrypt(arrayNits[i].password),
      email: casual.email,
      nit: arrayNits[i].nit,
      estado: 'ACTIVO',
      id_rol: 5
    };
    return item;
  });
  items = items.concat(usuarios);

  // Agregando técnico pauteo
  // items = items.concat({
  //   usuario: usernameTecnico,
  //   contrasena,
  //   email: casual.email,
  //   estado: 'ACTIVO',
  //   id_persona: 3,
  //   id_rol: 3,
  //   id_entidad: 2
  // });

  // Agregando jefe de difusión y pauteo
  // items = items.concat({
  //   usuario: usernameJefe,
  //   contrasena,
  //   email: casual.email,
  //   estado: 'ACTIVO',
  //   id_persona: 4,
  //   id_rol: 4,
  //   id_entidad: 2
  // });

  usuarios = Array(16).fill().map((_, i) => {
    let item = {
      usuario: casual.username,
      contrasena,
      email: casual.email,
      estado: casual.random_element(['ACTIVO', 'INACTIVO']),
      id_persona: casual.integer(4, 10),
      id_rol: casual.integer(2, 3),
      id_entidad: 2
    };
    return item;
  });

  items = items.concat(usuarios);
}

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sys_usuarios', items, {});
  },

  down (queryInterface, Sequelize) { }
};
