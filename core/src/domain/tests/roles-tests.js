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

test.serial('Rol#findAll', async t => {
  const { Rol } = services;
  let res = await Rol.findAll();

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count > 1, 'Se tiene 8 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Rol#findById', async t => {
  const { Rol } = services;
  const id = 1;

  let res = await Rol.findById(id);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.id, id, 'Se recuperó el registro mediante un id');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Rol#createOrUpdate - new', async t => {
  const { Rol } = services;
  const nuevoRol = {
    nombre: 'Nombre de rol',
    descripcion: 'Descripcion de rol',
    _user_created: 1,
    _created_at: new Date()
  };

  let res = await Rol.createOrUpdate(nuevoRol);
  let rol = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(typeof rol.id === 'number', 'Comprobando que el nuevo rol tenga un id');
  t.is(rol.nombre, nuevoRol.nombre, 'Creando registro - nombre');
  t.is(rol.descripcion, nuevoRol.descripcion, 'Creando registro - descripcion');
  t.is(rol.tipo, nuevoRol.tipo, 'Creando registro - tipo');
  t.is(res.message, 'OK', 'Mensaje correcto');

  test.idRol = rol.id;
});

test.serial('Rol#createOrUpdate - update', async t => {
  const { Rol } = services;
  const newData = {
    id: test.idRol,
    nombre: 'Nuevo nombre de rol'
  };

  let res = await Rol.createOrUpdate(newData);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.nombre, newData.nombre, 'Actualizando registro nombre');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Rol#delete', async t => {
  const { Rol } = services;
  let res = await Rol.deleteItem(test.idRol);

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data, 'Rol eliminado');
  t.is(res.message, 'OK', 'Mensaje correcto');
});
