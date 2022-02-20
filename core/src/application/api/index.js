'use strict';

const publicApi = require('./public');
const system = require('./system');
const medio = require('./medio');
const dpa = require('./dpa');
const cobertura = require('./cobertura');
const tarifario = require('./tarifario');
const campana = require('./campana');
const coberturaCampana = require('./coberturaCampana');
const ordenPublicidad = require('./ordenPublicidad');
const reporte = require('./reporte');

module.exports = function setupApi (services) {
  return {
    public: publicApi(services),
    system: system(services),
    medio: medio(services),
    dpa: dpa(services),
    cobertura: cobertura(services),
    tarifario: tarifario(services),
    campana: campana(services),
    coberturaCampana: coberturaCampana(services),
    ordenPublicidad: ordenPublicidad(services),
    reporte: reporte(services)
  };
};
