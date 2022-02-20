'use strict';

const debug = require('debug')('pauteo:core:api:ordenPublicidad');
const { userData } = require('../lib/auth');
const { getResponse, isNullOrUndifined } = require('../lib/util');

module.exports = services => {
  async function generarOrdenPublicitaria (req, res, next) {
    debug('Generando reporte de orden publicitaria');
    const { Reporte } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }
      /*
      if (isNullOrUndifined(req.params.idCampanaMedio)) {
        return next(new Error(`No se ha proporcionado la relación entre el medio y la campaña. Por favor, verifique sus datos.`));
      } */

      // const reporte = await Reporte.generarOrdenPublicitaria(parseInt(req.params.id, 10), parseInt(req.params.idCampanaMedio, 10), user);
      const reporte = await Reporte.generarOrdenPublicitaria(parseInt(req.params.id, 10), user);
      getResponse(reporte, res, 'reporte');
    } catch (e) {
      return next(e);
    }
  }

  async function generarResumenVisual (req, res, next) {
    debug('Generando reporte de la visual');
    const { Reporte } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }
      
      const reporte = await Reporte.generarResumenVisual(parseInt(req.params.id, 10), user);
      getResponse(reporte, res, 'reporte');
    } catch (e) {
      return next(e);
    }
  }

  async function generarFormularioSC (req, res, next) {
    debug('Generando formulario de solicitud de contratación');
    const { Reporte } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }
      
      const reporte = await Reporte.generarFormularioSC(parseInt(req.params.id, 10), user);
      getResponse(reporte, res, 'reporte');
    } catch (e) {
      return next(e);
    }
  }

  async function modificarOrdenPublicidad (req, res, next) {
    debug('Modificando Órdenes');
    const { OrdenPublicidad } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idCampanaMedio)) {
        return next(new Error(`No se ha proporcionado la relación entre el medio y la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idOrden)) {
        return next(new Error(`No se ha proporcionado la orden de publicidad. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado los datos de la orden de publicidad que desea modificar. Por favor, verifique sus datos.`));
      }

      const orden = await OrdenPublicidad.modificarOrdenPublicidad(parseInt(req.params.id, 10), parseInt(req.params.idCampanaMedio, 10),
        parseInt(req.params.idOrden, 10), req.body, user);
      getResponse(orden, res, 'orden');
    } catch (e) {
      return next(e);
    }
  }

  async function eliminarOrdenPublicidad (req, res, next) {
    debug('Eliminando Órdenes');
    const { OrdenPublicidad } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idCampanaMedio)) {
        return next(new Error(`No se ha proporcionado la relación entre el medio y la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idOrden)) {
        return next(new Error(`No se ha proporcionado la orden de publicidad. Por favor, verifique sus datos.`));
      }

      const orden = await OrdenPublicidad.eliminarOrdenPublicidad(parseInt(req.params.id, 10), parseInt(req.params.idCampanaMedio, 10),
        parseInt(req.params.idOrden, 10), user);
      getResponse(orden, res, 'orden');
    } catch (e) {
      return next(e);
    }
  }

  return {
    generarOrdenPublicitaria,
    generarResumenVisual,
    generarFormularioSC,
    modificarOrdenPublicidad,
    eliminarOrdenPublicidad
  };
};
