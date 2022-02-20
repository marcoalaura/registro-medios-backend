'use strict';

const debug = require('debug')('pauteo:core:api:dpa');
const { getResponse, isNullOrUndifined } = require('../lib/util');

module.exports = services => {
  // Obteniendo departamentos
  async function obtenerDepartamentos (req, res, next) {
    debug('Obteniendo todos los departamentos');
    const { Dpa } = services;

    try {
      const departamentos = await Dpa.obtenerDepartamentos();
      getResponse(departamentos, res, 'departamentos');
    } catch (e) {
      return next(e);
    }
  }

  // Obteniendo departamentos
  async function obtenerProvinciasPorDepartamento (req, res, next) {
    debug('Obteniendo todos las provincias de un departamento');
    const { Dpa } = services;

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el departamento.`));
    }
    try {
      const provincias = await Dpa.obtenerProvinciasPorDepartamento(parseInt(req.params.id, 10));

      getResponse(provincias, res, 'provincias');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerMunicipiosPorProvincia (req, res, next) {
    debug('Obteniendo todos los municipios de una provincia');
    const { Dpa } = services;

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado la provincia.`));
    }

    try {
      const municipios = await Dpa.obtenerMunicipiosPorProvincia(parseInt(req.params.id, 10));

      getResponse(municipios, res, 'municipios');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerMunicipiosPorDepartamento (req, res, next) {
    debug('Obteniendo todos los municipios de un departamento');
    const { Dpa } = services;

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el departamento.`));
    }
    try {
      const municipios = await Dpa.obtenerMunicipiosPorDepartamento(parseInt(req.params.id, 10));

      getResponse(municipios, res, 'municipios');
    } catch (e) {
      return next(e);
    }
  }

  return {
    obtenerDepartamentos,
    obtenerProvinciasPorDepartamento,
    obtenerMunicipiosPorProvincia,
    obtenerMunicipiosPorDepartamento
  };
};
