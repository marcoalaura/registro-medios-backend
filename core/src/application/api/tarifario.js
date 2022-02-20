'use strict';

const debug = require('debug')('pauteo:core:api:tarifario');
const { userData } = require('../lib/auth');
const { getResponse, isNullOrUndifined } = require('../lib/util');

module.exports = services => {
  async function crearTarifario (req, res, next) {
    const { Tarifario } = services;

    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      const tarifario = await Tarifario.crearTarifario(parseInt(req.params.id, 10), parseInt(req.params.idTipoMedio, 10), req.body, user);
      getResponse(tarifario, res, 'tarifario');
    } catch (e) {
      return next(e);
    }
  }

  async function crearTarifarioDetalle (req, res, next) {
    debug('Creando Tarifario Detalle');
    const { Tarifario } = services;
    let user = await userData(req, services);
    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      if (isNullOrUndifined(req.params.idTarifario)) {
        return next(new Error(`No se ha proporcionado el tarifario.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se han proporcionado los datos del tarifario que desea crear.`));
      }

      const detalle = await Tarifario.crearTarifarioDetalle(parseInt(req.params.id, 10),
        parseInt(req.params.idTipoMedio, 10), parseInt(req.params.idTarifario, 10),
        req.body, user);
      getResponse(detalle, res, 'detalle');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerTarifario (req, res, next) {
    debug('Eliminando referencia');
    const { Tarifario } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      if (isNullOrUndifined(req.params.idTarifario)) {
        return next(new Error(`No se ha proporcionado el tarifario.`));
      }

      const tarifario = await Tarifario.obtenerTarifario(parseInt(req.params.id, 10),
        parseInt(req.params.idTipoMedio, 10), parseInt(req.params.idTarifario, 10), user);
      getResponse(tarifario, res, 'tarifario');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerTarifarioDetalle (req, res, next) {
    debug('Obteniendo Tarifario Detalle');
    const { Tarifario } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      if (isNullOrUndifined(req.params.idTarifario)) {
        return next(new Error(`No se ha proporcionado el tarifario.`));
      }

      if (isNullOrUndifined(req.params.idDet)) {
        return next(new Error(`No se ha proporcionado el detalle del tarifario.`));
      }

      const detalle = await Tarifario.obtenerTarifarioDetalle(parseInt(req.params.id, 10),
        parseInt(req.params.idTipoMedio, 10), parseInt(req.params.idTarifario, 10),
        parseInt(req.params.idDet), user);
      getResponse(detalle, res, 'detalle');
    } catch (e) {
      return next(e);
    }
  }

  async function modificarTarifarioDetalle (req, res, next) {
    debug('Modificando Tarifario Detalle');
    const { Tarifario } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      if (isNullOrUndifined(req.params.idTarifario)) {
        return next(new Error(`No se ha proporcionado el tarifario.`));
      }

      if (isNullOrUndifined(req.params.idDet)) {
        return next(new Error(`No se ha proporcionado el detalle del tarifario.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se han proporcionado los datos del tarifario que desea modificar.`));
      }

      const detalle = await Tarifario.modificarTarifarioDetalle(parseInt(req.params.id, 10),
        parseInt(req.params.idTipoMedio, 10), parseInt(req.params.idTarifario, 10),
        parseInt(req.params.idDet), req.body, user);
      getResponse(detalle, res, 'detalle');
    } catch (e) {
      return next(e);
    }
  }

  async function eliminarTarifarioDetalle (req, res, next) {
    debug('Eliminando Tarifario Detalle');
    const { Tarifario } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      if (isNullOrUndifined(req.params.idTarifario)) {
        return next(new Error(`No se ha proporcionado el tarifario.`));
      }

      if (isNullOrUndifined(req.params.idDet)) {
        return next(new Error(`No se ha proporcionado el detalle del tarifario.`));
      }

      const detalle = await Tarifario.eliminarTarifarioDetalle(parseInt(req.params.id, 10),
        parseInt(req.params.idTipoMedio, 10), parseInt(req.params.idTarifario, 10),
        parseInt(req.params.idDet), user);
      getResponse(detalle, res, 'detalle');
    } catch (e) {
      return next(e);
    }
  }

  async function registrarTarifarioPorDefecto (req, res, next) {
    debug('Registrar Tarifario detalles por defecto');

    const { Tarifario } = services;
    let user = await userData(req, services);
    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idTipoMedio)) {
        return next(new Error(`No se ha proporcionado el tipo de medio.`));
      }

      if (isNullOrUndifined(req.params.idTarifario)) {
        return next(new Error(`No se ha proporcionado el tarifario.`));
      }

      //if (!req.body || Object.keys(req.body).length === 0) {
      // Arma el body con información que se cargara por defecto      
      if (isNullOrUndifined(req.body.costo)) {
        req.body.costo = '100';
      }

      if (isNullOrUndifined(req.body.descripcion)) {
        req.body.descripcion = 'SEGÚN PROGRAMACIÓN';
      }

      if (isNullOrUndifined(req.body.dias) || req.body.dias.length === 0) {
        req.body.dias = new Array (1, 2, 3, 4, 5, 6, 7);
      }

      if (isNullOrUndifined(req.body.tipo_costo)) {
        req.body.tipo_costo = 'PASE';
      }

      const detalle = await Tarifario.registrarTarifarioPorDefecto(parseInt(req.params.id, 10),
        parseInt(req.params.idTipoMedio, 10), parseInt(req.params.idTarifario, 10), req.body, user);
      getResponse(detalle, res, 'detalle');
    } catch (e) {
      return next(e);
    }
  }

  return {
    crearTarifario,
    obtenerTarifario,
    crearTarifarioDetalle,
    obtenerTarifarioDetalle,
    modificarTarifarioDetalle,
    eliminarTarifarioDetalle,
    registrarTarifarioPorDefecto
  };
};
