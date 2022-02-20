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

test.serial('Permiso#getPermisos', async t => {
  const { Permiso } = services;
  let res = await Permiso.getPermisos();

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.length >= 1, 'Se tiene más de 10 permisos en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Permiso#findAll', async t => {
  const { Permiso } = services;
  let res = await Permiso.findAll();

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count >= 5, 'Se tiene más de 10 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Permiso#findById', async t => {
  const { Permiso } = services;
  const id = 1;

  let res = await Permiso.findById(id);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.id, id, 'Se recuperó el registro mediante un id');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Permiso#createOrUpdate - new', async t => {
  const { Permiso } = services;
  const nuevoPermiso = {
    id_modulo: 4,
    id_rol: 1,
    create: true,
    read: true,
    update: true,
    delete: true,
    firma: true,
    csv: true,
    activo: true,
    _user_created: 1,
    _created_at: new Date()
  };

  let res = await Permiso.createOrUpdate(nuevoPermiso);
  let permiso = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(typeof permiso.id === 'number', 'Comprobando que el nuevo permiso tenga un id');
  t.is(permiso.id_modulo, nuevoPermiso.id_modulo, 'Creando registro - id_modulo');
  t.is(permiso.id_rol, nuevoPermiso.id_rol, 'Creando registro - id_rol');
  t.is(permiso.create, nuevoPermiso.create, 'Creando registro - create');
  t.is(permiso.read, nuevoPermiso.read, 'Creando registro - read');
  t.is(permiso.update, nuevoPermiso.update, 'Creando registro - update');
  t.is(permiso.delete, nuevoPermiso.delete, 'Creando registro - delete');
  t.is(permiso.firma, nuevoPermiso.firma, 'Creando registro - firma');
  t.is(permiso.csv, nuevoPermiso.csv, 'Creando registro - csv');
  t.is(permiso.activo, nuevoPermiso.activo, 'Creando registro - activo');

  t.is(res.message, 'OK', 'Mensaje correcto');

  test.idPermiso = permiso.id;
});

test.serial('Permiso#createOrUpdate - update', async t => {
  const { Permiso } = services;
  const newData = {
    id: test.idPermiso,
    id_rol: 2
  };

  let res = await Permiso.createOrUpdate(newData);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.id_rol, newData.id_rol, 'Actualizando registro permiso');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Permiso#delete', async t => {
  const { Permiso } = services;
  let res = await Permiso.deleteItem(test.idPermiso);

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data, 'Permiso eliminado');
  t.is(res.message, 'OK', 'Mensaje correcto');
});
