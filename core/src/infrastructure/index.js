'use strict';

const debug = require('debug')('base:db');
const defaults = require('defaults');
const Sequelize = require('sequelize');
const util = require('./lib/util');
const constantes = require('./lib/constantes');
const hooks = require('./hooks');
const associations = require('./associations');
const path = require('path');

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'postgres',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      // raw: true
    },
    logging: s => debug(s),
    timezone: 'America/La_Paz'
  });

  const sequelize = new Sequelize(config);

  // Cargando todos los modelos que se encuentran en la carpeta models y en sus subcarpetas
  let models = util.loadModels(path.join(__dirname, 'models'), sequelize, { exclude: ['index.js'] });
  // debug('Models', models);

  // Cargando asociaciones entre las tablas
  models = associations(models);

  // Iniciando Hooks de Sequelize
  hooks.init(sequelize);

  // Cargando todos los repositorios que se encuentran en la carpeta repositories y en sus subcarpetas
  let repositories = util.loadRepositories(path.join(__dirname, 'repositories'), models, Sequelize, { exclude: ['index.js'] });
  debug('Capa infraestructura - Usuarios - Repositorios cargados correctamente');

  await sequelize.authenticate();

  if (config.setup) {
    await sequelize.sync({ force: true });
  }

  const ejecutarTransicion = async (operacion) => {
    const t = await sequelize.transaction();
    try {
      const resultado = await operacion(t);
      debug('Confirmando transaction');
      await t.commit();
      return resultado;
    } catch (e) {
      await t.rollback();
      throw new Error(e.message);
    }
  };

  // Agregando modelos a los repositorios para su uso externo
  repositories._models = models;

  repositories.constantes = constantes.constantes;

  repositories.ejecutarTransicion = ejecutarTransicion;

  return repositories;
};
