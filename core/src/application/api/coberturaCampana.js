'use strict';

const debug = require('debug')('pauteo:core:api:cobertura-campaña');
const { userData } = require('../lib/auth');
const { getResponse, isNullOrUndifined } = require('../lib/util');

module.exports = services => {
  // Crear cobertura
  async function crearCobertura (req, res, next) {
    debug('Creando cobertura de campaña');

    const { CoberturaCampana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado los datos de la campaña que pretende modificar. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado los datos de la cobertura de la campaña.`));
      }

      const cobertura = await CoberturaCampana.crearCobertura(parseInt(req.params.id, 10), req.body, user);
      getResponse(cobertura, res, 'cobertura');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerCoberturas (req, res, next) {
    debug('Obteniendo coberturas por tipo de medio');
    const { CoberturaCampana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado los datos de la campaña que pretende modificar. Por favor, verifique sus datos.`));
      }

      const cobertura = await CoberturaCampana.obtenerCoberturas(parseInt(req.params.id, 10), req.body, user);
      getResponse(cobertura, res, 'cobertura');
    } catch (e) {
      return next(e);
    }
  }
  return {
    crearCobertura,
    obtenerCoberturas
  };
};
