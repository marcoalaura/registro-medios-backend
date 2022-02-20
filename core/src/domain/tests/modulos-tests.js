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

test.serial('Modulo#getMenu', async t => {
  const { Modulo } = services;
  let res = await Modulo.getMenu();
  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.menu[0].url !== undefined, true, 'Se tiene armado el menú');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#findAll', async t => {
  const { Modulo } = services;
  let res = await Modulo.findAll();

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count > 5, 'Se tiene 19 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#findById', async t => {
  const { Modulo } = services;
  const id = 1;

  let res = await Modulo.findById(id);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.id, id, 'Se recuperó el registro mediante un id');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#createOrUpdate - new', async t => {
  const { Modulo } = services;
  const number = parseInt(Math.random() * 1000000) + 10000000;
  const nuevoModulo = {
    ruta: `/ruta_${number}`,
    label: `Nuevo label ${number}`,
    orden: number,
    estado: 'INACTIVO',
    visible: false,
    _user_created: 1,
    _created_at: new Date()
  };

  let res = await Modulo.createOrUpdate(nuevoModulo);
  let modulo = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(typeof modulo.id === 'number', 'Comprobando que el nuevo modulo tenga un id');
  t.is(modulo.ruta, nuevoModulo.ruta, 'Creando registro - ruta');
  t.is(modulo.label, nuevoModulo.label, 'Creando registro - label');
  t.is(modulo.orden, nuevoModulo.orden, 'Creando registro - orden');
  t.is(modulo.estado, nuevoModulo.estado, 'Creando registro - estado');
  t.is(modulo.visible, nuevoModulo.visible, 'Creando registro - visible');

  t.is(res.message, 'OK', 'Mensaje correcto');

  test.idModulo = modulo.id;
});

test.serial('Modulo#createOrUpdate - update', async t => {
  const { Modulo } = services;
  const newData = {
    id: test.idModulo,
    label: 'Este es el nuevo label'
  };

  let res = await Modulo.createOrUpdate(newData);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.label, newData.label, 'Actualizando registro Modulo');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#findAll#filter - id_modulo', async t => {
  const { Modulo } = services;
  let res = await Modulo.findAll({ id_modulo: 1 });
  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count > 5, 'Filtrando datos - id_modulo');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#findAll#filter - id_modulo - null', async t => {
  const { Modulo } = services;
  let res = await Modulo.findAll({ id_modulo: 0 });
  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count > 1, 'Filtrando datos - id_modulo - null');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#findAll#filter - id_rol', async t => {
  const { Modulo } = services;
  let res = await Modulo.findAll({ id_rol: 1 });
  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count >= 5, 'Filtrando datos - id_rol');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Modulo#delete', async t => {
  const { Modulo } = services;
  let res = await Modulo.deleteItem(test.idModulo);

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data, 'Modulo eliminado');
  t.is(res.message, 'OK', 'Mensaje correcto');
});
