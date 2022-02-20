'use strict';

const test = require('ava');
const { errors, config } = require('common');
const domain = require('../');
const { text } = require('common');

let services;

test.beforeEach(async () => {
  if (!services) {
    services = await domain(config.db).catch(errors.handleFatalError);
  }
});

test.serial('Usuario#findAll', async t => {
  const { Usuario } = services;
  let res = await Usuario.findAll();

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data.count > 10, 'Se tiene 10 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#findById', async t => {
  const { Usuario } = services;
  const id = 1;

  let res = await Usuario.findById(id);

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.id, id, 'Se recuperó el registro mediante un id');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#userExist - exist', async t => {
  const { Usuario } = services;
  const usuario = 'admin';
  const password = '123456';

  let res = await Usuario.userExist(usuario, password);
  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.usuario, usuario, 'Se verificó la existencia del usuario y contraseña');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#userExist - not exist', async t => {
  const { Usuario } = services;
  const usuario = 'admin1234';
  const password = '123456';

  let res = await Usuario.userExist(usuario, password);

  t.is(res.code, -1, 'Respuesta incorrecta');
  t.is(res.message, `No existe el usuario ${usuario}`, 'Mensaje correcto');
});

test.serial('Usuario#userExist - password error', async t => {
  const { Usuario } = services;
  const usuario = 'admin';
  const password = '1234567';

  let res = await Usuario.userExist(usuario, password);

  t.is(res.code, -1, 'Respuesta incorrecta');
  t.is(res.message, `La contraseña del usuario ${usuario} es incorrecta`, 'Mensaje correcto');
});

test.serial('Usuario#createOrUpdate - new', async t => {
  const { Usuario } = services;
  let usuario = `admin-${parseInt(Math.random() * 10000)}`;
  const nuevoUsuario = {
    usuario,
    contrasena: '123456',
    email: `${usuario}@mail.com`,
    estado: 'ACTIVO',
    id_rol: 1,
    id_entidad: 1,
    _user_created: 1,
    _created_at: new Date(),
    nombres: 'Juan',
    primer_apellido: 'Flores',
    segundo_apellido: 'Ramirez',
    nombre_completo: '',
    tipo_documento: 'CI',
    tipo_documento_otro: '',
    nro_documento: '123456',
    fecha_nacimiento: new Date(1990, 0, 1),
    movil: '123',
    nacionalidad: 'BOLIVIA',
    pais_nacimiento: 'BOLIVIA',
    genero: 'M',
    telefono: '456'
  };

  let res = await Usuario.createOrUpdate(nuevoUsuario);
  usuario = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.true(typeof usuario.id === 'number', 'Comprobando que el nuevo usuario tenga un id');
  t.is(usuario.usuario, nuevoUsuario.usuario, 'Creando registro - usuario');
  t.is(usuario.email, nuevoUsuario.email, 'Creando registro - email');
  t.is(usuario.contrasena, text.encrypt(nuevoUsuario.contrasena), 'Creando registro - contraseña');
  t.is(res.message, 'OK', 'Mensaje correcto');

  test.idUser = usuario.id;
});

test.serial('Usuario#createOrUpdate - update', async t => {
  const { Usuario } = services;
  let usuario = `admin-${parseInt(Math.random() * 10000)}`;
  const newData = {
    id: test.idUser,
    usuario,
    id_persona: 1,
    nombres: 'Juan',
    id_rol: 1,
    id_entidad: 1
  };

  let res = await Usuario.createOrUpdate(newData);
  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.usuario, newData.usuario, 'Actualizando registro usuario');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#findAll#filter#usuario', async t => {
  const { Usuario } = services;
  let res = await Usuario.findAll({ usuario: 'admin' });
  let lista = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(lista.count, 3, 'Se tiene 3 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#findAll#filter#id_persona', async t => {
  const { Usuario } = services;
  let res = await Usuario.findAll({ id_persona: 1 });
  let lista = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(lista.count, 2, 'Se tiene 2 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#findAll#filter#email', async t => {
  const { Usuario } = services;
  let res = await Usuario.findAll({ email: 'admin' });
  let lista = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(lista.count, 3, 'Se tiene 3 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#findAll#filter#id_rol', async t => {
  const { Usuario } = services;
  let res = await Usuario.findAll({ id_rol: 1 });
  let lista = res.data;

  t.is(res.code, 1, 'Respuesta correcta');
  t.is(lista.count, 2, 'Se tiene 2 registros en la bd');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

// Delete logically user
test.serial('Usuario#delete', async t => {
  const { Usuario } = services;
  let res = await Usuario.deleteItem(test.idUser);
  t.is(res.code, 1, 'Respuesta correcta');
  t.true(res.data, 'Usuario eliminado');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('Usuario#nit', async t => {
  const { Usuario } = services;
  const usuario = 'AMIGOL'; const contrasena = 'abc.123'; const nit = '1022579028';
  let res = await Usuario.userExist(usuario, contrasena, nit);
  t.is(res.code, 1, 'Respuesta correcta');
  t.is(res.data.usuario, usuario, 'Usuario correcto');
  t.is(res.data.nit, nit, 'NIT correcto');
  t.is(res.message, 'OK', 'Mensaje correcto');
});

test.serial('matriz', async t => {
  const nroFilas = 288;
  const semanaArray = [{
    index: 1, label: 'Lunes'
  }, {
    index: 1, label: 'Martes'
  }, {
    index: 1, label: 'Miércoles'
  }, {
    index: 1, label: 'Jueves'
  }, {
    index: 1, label: 'Viernes'
  }, {
    index: 1, label: 'Sábado'
  }, {
    index: 1, label: 'Domingo'
  }];
  const matrizBluePrint = [];
  let inicio = 500;
  for (var fila = 1; fila <= nroFilas; fila++) {
    matrizBluePrint.push({
      index: fila,
      horaInicio: inicio,
      horaFinal: inicio + 5,
      descripcion: 'Según Programación',
      costo: 0,
      dias: semanaArray
    });
    inicio = inicio + 5 + 1;
  }
  console.log('---------------------------matrizBluePrint', matrizBluePrint);
  t.is(matrizBluePrint.length, 288, 'matriz correcta');
});
