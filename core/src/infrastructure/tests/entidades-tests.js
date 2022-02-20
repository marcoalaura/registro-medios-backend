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

test.serial('Entidad#findAll', async t => {
  const { entidades } = repositories;
  let lista = await entidades.findAll();

  t.true(lista.count >= 2, 'Se tiene más 10 registros en la bd');
});

test.serial('Entidad#findById', async t => {
  const { entidades } = repositories;
  const id = 1;

  let entidad = await entidades.findById(id);

  t.is(entidad.id, id, 'Se recuperó el registro mediante un id');
});

test.serial('Entidad#createOrUpdate - new', async t => {
  const { entidades } = repositories;
  const nuevaEntidad = {
    nombre: 'Nuevo ministerio',
    descripcion: 'Nuevo ministerio descripción',
    email: 'empresa@mail.com',
    telefonos: '123456',
    direccion: 'Av. Principal',
    web: 'www.miempresa.com',
    codigo_portal: 'CP0001',
    estado: 'ACTIVO',
    _user_created: 1,
    _created_at: new Date()
  };

  let entidad = await entidades.createOrUpdate(nuevaEntidad);

  t.true(typeof entidad.id === 'number', 'Comprobando que el nuevo entidad tenga un id');
  t.is(entidad.nombre, nuevaEntidad.nombre, 'Creando registro - entidad');
  t.is(entidad.descripcion, nuevaEntidad.descripcion, 'Creando registro - email');
  t.is(entidad.email, nuevaEntidad.email, 'Creando registro - contraseña');
  t.is(entidad.telefonos, nuevaEntidad.telefonos, 'Creando registro - nombres');

  test.idEntidad = entidad.id;
});

test.serial('Entidad#createOrUpdate - update', async t => {
  const { entidades } = repositories;
  const newData = {
    id: test.idEntidad,
    nombre: 'Ministerio actualizado Inc.'
  };

  let entidad = await entidades.createOrUpdate(newData);

  t.is(entidad.nombre, newData.nombre, 'Comprobando actualización del nombre');

  test.idEntidad = entidad.id;
});

test.serial('Entidad#findAll#filter', async t => {
  const { entidades } = repositories;
  let lista = await entidades.findAll({ nombre: 'Ministerio', estado: 'ACTIVO' });
  t.is(lista.rows.length, 2, 'Filtrando datos');
});

test.serial('Entidad#delete', async t => {
  const { entidades } = repositories;
  let deleted = await entidades.deleteItem(test.idEntidad);

  t.is(deleted, 1, 'Entidad eliminado');
});
