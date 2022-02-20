'use strict';

const debug = require('debug')('pauteo:core:domain');
const db = require('../infrastructure');
const { config, errors } = require('common');
const util = require('./lib/util');
const cron = require('./lib/cron');
const path = require('path');
const Logs = require('app-logs');
const Params = require('app-params');
const Iop = require('app-iop');

module.exports = async function () {
  // Obteniendo repositorios de la capa de infrastructura
  let repositories = await db(config.db).catch(errors.handleFatalError);

  // Cargando Parámetros
  repositories.Parametro = await Params(config.db);

  // Cargando Iop
  repositories.Iop = await Iop(config.db);

  // Iniciando el módulo de logs
  const logs = await Logs(config.db).catch(errors.handleFatalError);

  // Cargando todos los servicios que se encuentran en la carpeta services y en sus subcarpetas
  let services = util.loadServices(path.join(__dirname, 'services'), repositories, { exclude: ['index.js'] }, logs);
  debug('Capa del dominio usuarios - Servicios cargados');

  // cron(repositories, services, logs);
  (await cron(repositories, services, logs)).start(); // Descomentar para iniciar el CRON

  // Cargando modelos de la capa de infrastructura
  services._models = repositories._models;
  services._repositories = repositories;

  return services;
};
