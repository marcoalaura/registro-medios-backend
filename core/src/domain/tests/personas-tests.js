'use strict';

const test = require('ava');
const { errors, config } = require('common');
const domain = require('../');

let services;

test.beforeEach(async () => {
  if (!services) {
    services = await domain(config.db).catch(errors.handleFatalError);
  }
});

test.serial('Persona#findAll', async t => {
  const { Persona } = services;
  let res = await Persona.findAll();

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count >= 10, 'Se tiene más de 10 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Persona#findById', async t => {
  const { Persona } = services;
  const id = 1;

  let res = await Persona.findById(id);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.id, id, 'Se recuperó el registro mediante un id');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Persona#createOrUpdate - new', async t => {
  const { Persona } = services;
  let persona = `admin-${parseInt(Math.random() * 10000)}`;
  const nuevoPersona = {
    nombres: 'Administrador',
    primer_apellido: 'Administrador',
    estado: 'ACTIVO',
    _user_created: 1,
    _created_at: new Date()
  };

  let res = await Persona.createOrUpdate(nuevoPersona);
  persona = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(typeof persona.id === 'number', 'Comprobando que el nuevo persona tenga un id');
  t.is(persona.persona, nuevoPersona.persona, 'Creando registro - persona');
  t.is(persona.contrasena, nuevoPersona.contrasena, 'Creando registro - contraseña');
  t.is(persona.nombres, nuevoPersona.nombres, 'Creando registro - nombres');
  t.is(res.message, 'OK', 'Mensaje correcto');

  test.idUser = persona.id;
});

test.serial('Persona#createOrUpdate - update', async t => {
  const { Persona } = services;
  const newData = {
    id: test.idUser,
    segundo_apellido: 'Administrador'
  };

  let res = await Persona.createOrUpdate(newData);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.segundo_apellido, newData.segundo_apellido, 'Actualizando registro persona');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Persona#findAll#filter#nombre_completo', async t => {
  const { Persona } = services;
  let res = await Persona.findAll({ nombre_completo: 'admin' });
  let lista = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(lista.count, 2, 'Se tiene 2 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

// Delete logically user
test.serial('Persona#delete', async t => {
  const { Persona } = services;
  let res = await Persona.deleteItem(test.idUser);
  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data, 'Persona eliminado');
  t.is(res.message, 'OK', 'Mensaje correcto');
});
