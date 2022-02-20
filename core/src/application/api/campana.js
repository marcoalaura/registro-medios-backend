'use strict';

const debug = require('debug')('pauteo:core:api:campaña');
const { userData } = require('../lib/auth');
const { getResponse, isNullOrUndifined } = require('../lib/util');

module.exports = services => {

  // Metodo para calcular costo campaña TV
  async function costoCampanaTV (req, res, next) {
    debug('Obteniendo costo campaña');
    const { Campana } = services;
    let user = await userData(req, services);
    try {
      const campana = await Campana.costoCampanaTV(parseInt(req.params.id, 10), user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerCampanas (req, res, next) {
    debug('Obteniendo campañas');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      const campanas = await Campana.obtenerCampanas(user);
      getResponse(campanas, res, 'campanas');
    } catch (e) {
      return next(e);
    }
  }

  async function crearCampana (req, res, next) {
    debug('Creando campañas');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado los datos de la campaña. Por favor, verifique sus datos.`));
      }
      const campana = await Campana.crearCampana(req.body, user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }
  async function modificarCampana (req, res, next) {
    debug('Modificando campañas');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado los datos de la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.modificarCampana(parseInt(req.params.id, 10), req.body, user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }
  async function eliminarCampana (req, res, next) {
    debug('Eliminando campañas');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.eliminarCampana(parseInt(req.params.id, 10), user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }
  async function obtenerCampana (req, res, next) {
    debug('Obteniendo campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.obtenerCampana(parseInt(req.params.id, 10), user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerMediosParaCampana (req, res, next) {
    debug('Obteniendo medios compatibles con la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const medios = await Campana.obtenerMediosParaCampana(parseInt(req.params.id, 10), user);
      getResponse(medios, res, 'medios');
    } catch (e) {
      return next(e);
    }
  }
  async function asignarMediosCampana (req, res, next) {
    debug('Obteniendo medios compatibles con la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0 || !req.body.medios) {
        return next(new Error(`No se ha proporcionado los medios para la campaña. Por favor, verifique sus datos.`));
      }

      const medios = await Campana.asignarMediosCampana(parseInt(req.params.id, 10), req.body, user);
      getResponse(medios, res, 'medios');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerMediosRelacionados (req, res, next) {
    debug('Obteniendo medios relacionados con la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const medios = await Campana.obtenerMediosRelacionados(parseInt(req.params.id, 10), req.body, user);
      getResponse(medios, res, 'medios');
    } catch (e) {
      return next(e);
    }
  }

  async function eliminarMediosRelacionados (req, res, next) {
    debug('Eliminando medios relacionados con la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idCampanaMedio)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const medios = await Campana.eliminarMediosRelacionados(parseInt(req.params.id, 10), parseInt(req.params.idCampanaMedio, 10), user);
      getResponse(medios, res, 'medios');
    } catch (e) {
      return next(e);
    }
  }
  async function obtenerMedioRelacionado (req, res, next) {
    debug('Obteniendo medio relacionado con la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idCampanaMedio)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const campanaMedio = await Campana.obtenerMedioRelacionado(parseInt(req.params.id, 10), parseInt(req.params.idCampanaMedio, 10), user);
      getResponse(campanaMedio, res, 'campanaMedio');
    } catch (e) {
      return next(e);
    }
  }

  async function cambiarEstado (req, res, next) {
    debug('Cambiando de estado a la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0 || !req.body.estado) {
        return next(new Error(`No se ha proporcionado el nuevo estado de la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.cambiarEstado(parseInt(req.params.id, 10), req.body, user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }

  async function validarCampana (req, res, next) {
    debug('Validando campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.validarCampanaEnviar(parseInt(req.params.id, 10), user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }

  async function enviarCampana (req, res, next) {
    debug('Enviando a jefe/a de pauteo la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.enviarCampana(parseInt(req.params.id, 10), user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }

  async function actualizarCampanaMedio (req, res, next) {
    debug('Modificando relación de medio con campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (isNullOrUndifined(req.params.idCampanaMedio)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado el Contacto Comercial del Medio. Por favor, verifique sus datos.`));
      }

      const campanaMedio = await Campana.actualizarCampanaMedio(parseInt(req.params.id, 10), parseInt(req.params.idCampanaMedio, 10), req.body, user);
      getResponse(campanaMedio, res, 'campanaMedio');
    } catch (e) {
      return next(e);
    }
  }

  async function actualizarCorrelativos (req, res, next) {
    debug('Modificando correlativos de la campaña');
    const { Campana } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado la campaña. Por favor, verifique sus datos.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado los datos de los correlativos de la campaña. Por favor, verifique sus datos.`));
      }

      const campana = await Campana.actualizarCorrelativos(parseInt(req.params.id, 10), req.body, user);
      getResponse(campana, res, 'campana');
    } catch (e) {
      return next(e);
    }
  }

  return {
    costoCampanaTV,
    obtenerCampanas,
    crearCampana,
    modificarCampana,
    eliminarCampana,
    obtenerCampana,
    obtenerMediosParaCampana,
    asignarMediosCampana,
    obtenerMediosRelacionados,
    eliminarMediosRelacionados,
    obtenerMedioRelacionado,
    cambiarEstado,
    validarCampana,
    enviarCampana,
    actualizarCampanaMedio,
    actualizarCorrelativos
  };
};
