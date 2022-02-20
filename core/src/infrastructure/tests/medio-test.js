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

test.serial('Medio#findAll', async t => {
  const { medio } = repositories;
  let lista = await medio.findAll();

  t.is(lista.count, 0, 'Se tienen 0 registros en la bd');
});

test.serial('Medio#findById', async t => {
  const { medio } = repositories;
  const id = 1;

  let usuario = await medio.findById(id);

  t.is(usuario, null, 'Se recuperó el registro mediante un id');
});

test.serial('Medio#createOrUpdate - new', async t => {
  const { medio } = repositories;
  const nuevoMedio = {
    nit: '1022579028',
    razon_social: 'Medio-test',
    matricula: 'Mat-1',
    id_usuario: 1,
    _user_created: 1
  };

  const medioCreated = await medio.createOrUpdate(nuevoMedio);
  t.true(typeof medioCreated.id === 'number', 'Comprobando que el nuevo usuario tenga un id');
  t.is(medioCreated.nit, nuevoMedio.nit, 'Creando registro - NIT');
  t.is(medioCreated.razon_social, nuevoMedio.razon_social, 'Creando registro - Razón social');
  t.is(medioCreated.matricula, nuevoMedio.matricula, 'Creando registro - matricula');
  t.is(medioCreated.estado, 'PENDIENTE', 'Creando registro - estado por defecto');
  test.idMedio = medioCreated.id;
});

test.serial('Medio#createOrUpdate - update', async t => {
  const { medio } = repositories;
  const newData = {
    id: test.idMedio,
    nit: '000001',
    email: 'rvallejos@agetic.gob.bo'
  };
  const medioUpd = await medio.createOrUpdate(newData);
  t.is(medioUpd.id, newData.id, 'Verificando id');
  t.is(medioUpd.nit, newData.nit, 'Actualizando registro nit');
  t.is(medioUpd.email, newData.email, 'Actualizando registro email');
  t.truthy(medioUpd._updated_at, 'Actualizando fecha de modificación');
});

test.serial('Medio#findAll#filter#nit', async t => {
  const { medio } = repositories;
  let lista = await medio.findAll({ nit: 'admin' });
  t.is(lista.count, 0, 'Se tiene 0 registros en la bd');
});

test.serial('Medio#findAll#filter#email', async t => {
  const { medio } = repositories;
  let lista = await medio.findAll({ email: 'admin' });
  t.is(lista.count, 0, 'Se tiene 0 registros en la bd');
});

test.serial('Medio#findAll#filter#estado', async t => {
  const { medio } = repositories;
  let lista = await medio.findAll({ estado: 'PENDIENTE' });
  t.is(lista.count, 1, 'Se tiene 1 registros en la bd');
});

test.serial('Medio#delete', async t => {
  const { medio } = repositories;
  let deleted = await medio.deleteItem(test.idMedio);

  t.is(deleted, 1, 'Medio eliminado');
});
