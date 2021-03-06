'use strict';

const test = require('ava');
const { config, errors } = require('common');
const db = require('../');

let repositories;

test.beforeEach(async () => {
  if (!repositories) {
    repositories = await db(config.db).catch(errors.handleFatalError);
  }
});

test.serial('Permiso#findAll', async t => {
  const { permisos } = repositories;
  let lista = await permisos.findAll();

  t.true(lista.count >= 22, 'Se tiene más de 22 registros en la bd');
});

test.serial('Permiso#findById', async t => {
  const { permisos } = repositories;
  const id = 1;

  let permiso = await permisos.findById(id);
  t.is(permiso.id, id, 'Se recuperó el registro mediante un id');
});

test.serial('Permiso#createOrUpdate - new', async t => {
  const { permisos } = repositories;
  const nuevoPermiso = {
    create: true,
    read: true,
    update: true,
    delete: true,
    firma: true,
    csv: true,
    activo: true,
    id_modulo: 1,
    id_rol: 1,
    _user_created: 1,
    _created_at: new Date()
  };

  let permiso = await permisos.createOrUpdate(nuevoPermiso);

  t.true(typeof permiso.id === 'number', 'Comprobando que el nuevo permiso tenga un id');
  t.is(permiso.create, nuevoPermiso.create, 'Creando registro - create');
  t.is(permiso.read, nuevoPermiso.read, 'Creando registro - read');
  t.is(permiso.update, nuevoPermiso.update, 'Creando registro - update');
  t.is(permiso.delete, nuevoPermiso.delete, 'Creando registro - delete');
  t.is(permiso.firma, nuevoPermiso.firma, 'Creando registro - firma');
  t.is(permiso.csv, nuevoPermiso.csv, 'Creando registro - csv');
  t.is(permiso.activo, nuevoPermiso.activo, 'Creando registro - activo');

  test.idPermiso = permiso.id;
});

test.serial('Permiso#createOrUpdate - exists', async t => {
  const { permisos } = repositories;
  const newData = { id: test.idPermiso, firma: true };

  let permiso = await permisos.createOrUpdate(newData);

  t.is(permiso.firma, newData.firma, 'Actualizando registro permiso');
});

test.serial('Permiso#findAll#filter - id_modulo', async t => {
  const { permisos } = repositories;
  let lista = await permisos.findAll({ id_modulo: 1 });
  t.true(lista.count >= 2, 'Filtrando datos');
});

test.serial('Permiso#findAll#filter - id_rol', async t => {
  const { permisos } = repositories;
  let lista = await permisos.findAll({ id_rol: 1 });
  t.true(lista.count >= 2, 'Filtrando datos');
});

test.serial('Permiso#delete', async t => {
  const { permisos } = repositories;
  let deleted = await permisos.deleteItem(test.idPermiso);

  t.is(deleted, 1, 'permiso eliminado');
});
