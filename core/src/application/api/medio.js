'use strict';

const debug = require('debug')('pauteo:core:api:modulo');
const { userData } = require('../lib/auth');
const { getResponse, isNullOrUndifined } = require('../lib/util');

module.exports = services => {
  // Obteniendo las matrículas de un NIT
  async function obtenerMatriculas (req, res, next) {
    debug('Obteniendo matrículas de un NIT');
    const { Medio } = services;

    try {
      if (isNullOrUndifined(req.params.nit)) {
        return next(`No se ha proporcionado el NIT de la Empresa. Por favor, verifique sus datos.`);
      }

      const matriculas = await Medio.obtenerMatriculas(req.params.nit);
      getResponse(matriculas, res, 'matriculas');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerMedioPorMatricula (req, res, next) {
    debug('Obteniendo medio por matrícula');
    const { Medio } = services;
    let user = await userData(req, services);
    let tieneMatricula = req.query.matricula || 'true';
    tieneMatricula = tieneMatricula === 'true';
    try {
      if (isNullOrUndifined(req.params.nit)) {
        return next(`No se ha proporcionado el NIT del Medio. Por favor, verifique sus datos.`);
      }

      if (isNullOrUndifined(req.params.matricula) && tieneMatricula) {
        return next(`No se ha proporcionado la Matrícula de Comercio del Medio. Por favor, verifique sus datos.`);
      }

      const medio = await Medio.obtenerMedioPorMatricula(req.params.nit, req.params.matricula, user, tieneMatricula);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerMedio (req, res, next) {
    debug('Obteniendo medio por identificador');
    const { Medio } = services;

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el dato del medio que se desea obtener.`));
    }

    let user = await userData(req, services);

    try {
      const medio = await Medio.obtenerMedio(req.params.id, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function adjuntarAutorizacionATT (req, res, next) {
    debug('Adjuntando autorización ATT');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el dato del medio que se desea obtener.`));
      }

      if (!req.files || !req.files.archivo) {
        return next(new Error(`No se ha proporcionado el archivo adjunto. Por favor, verifique sus datos.`));
      }

      const medio = await Medio.adjuntarAutorizacionATT(req.params.id, req.files.archivo, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function adjuntarContrato (req, res, next) {
    debug('Adjuntando Contrato');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el dato del medio que se desea obtener.`));
      }

      if (!req.files || !req.files.archivo) {
        return next(new Error(`No se ha proporcionado el archivo adjunto. Por favor, verifique sus datos.`));
      }

      const medio = await Medio.adjuntarContrato(req.params.id, req.files.archivo, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function adjuntarRupe (req, res, next) {
    debug('Adjuntando RUPE');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el dato del medio que se desea obtener.`));
      }

      if (!req.files || !req.files.archivo) {
        return next(new Error(`No se ha proporcionado el archivo adjunto. Por favor, verifique sus datos.`));
      }

      const medio = await Medio.adjuntarRupe(req.params.id, req.files.archivo, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function adjuntarNoComercial (req, res, next) {
    debug('Adjuntando Certificación de Empresa No Comercial');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el dato del medio que se desea obtener.`));
      }

      if (!req.files || !req.files.archivo) {
        return next(new Error(`No se ha proporcionado el archivo adjunto. Por favor, verifique sus datos.`));
      }

      const medio = await Medio.adjuntarNoComercial(req.params.id, req.files.archivo, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function actualizarMedio (req, res, next) {
    debug('Actualizando datos del medio');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id) || !req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se ha proporcionado los datos del medio que se pretende modificar. Por favor, verifique sus datos.`));
      }

      const medio = await Medio.actualizarMedio(req.params.id, req.body, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  async function crearReferencia (req, res, next) {
    debug('Creando referencia para el medio');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el dato del medio al que se desea agregar un contacto.`));
      }

      if (!req.body || Object.keys(req.body).length === 0 || !req.body.id_persona) {
        return next(new Error(`No se ha proporcionado los datos de la persona de referencia del medio. Por favor, verifique sus datos.`));
      }

      const referencia = await Medio.crearReferencia(req.params.id, req.body, user);
      getResponse(referencia, res, 'referencia');
    } catch (e) {
      return next(e);
    }
  }

  async function adjuntarPoderRL (req, res, next) {
    debug('Adjuntando Poder legal');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el dato del medio al que se desea adjuntar el poder de Representante Legal.`));
      }

      if (isNullOrUndifined(req.params.idRef)) {
        return next(new Error(`No se ha proporcionado el Representante Legal.`));
      }

      if (!req.files || !req.files.archivo) {
        return next(new Error(`No se ha proporcionado el archivo adjunto. Por favor, verifique sus datos.`));
      }

      const representante = await Medio.adjuntarPoderRL(req.params.id, req.params.idRef, req.files.archivo, user);
      getResponse(representante, res, 'representante');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerReferencias (req, res, next) {
    debug('Adjuntando Poder legal');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      const referencias = await Medio.obtenerReferencias(req.params.id, user);
      getResponse(referencias, res, 'referencias');
    } catch (e) {
      return next(e);
    }
  }

  async function obtenerAdjunto (req, res, next) {
    debug('Obteniendo adjuntos');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (!req.query || !req.query.tipo) {
        return next(new Error(`No se ha proporcionado el tipo de archivo que se desea obtener.`));
      }

      const adjunto = await Medio.obtenerAdjunto(req.params.id, req.query.tipo, user);
      getResponse(adjunto, res, 'adjunto');
    } catch (e) {
      return next(e);
    }
  }

  async function modificarReferencia (req, res, next) {
    debug('Modificando referencia');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idRef)) {
        return next(new Error(`No se ha proporcionado la persona de referencia del medio.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se han proporcionado los datos para modificar a la persona de referencia.`));
      }

      const referencia = await Medio.modificarReferencia(req.params.id, req.params.idRef, req.body, user);
      getResponse(referencia, res, 'referencia');
    } catch (e) {
      return next(e);
    }
  }

  async function eliminarReferencia (req, res, next) {
    debug('Eliminando referencia');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idRef)) {
        return next(new Error(`No se ha proporcionado la persona de referencia del medio.`));
      }

      const referencia = await Medio.eliminarReferencia(req.params.id, req.params.idRef, user);
      getResponse(referencia, res, 'referencia');
    } catch (e) {
      return next(e);
    }
  }

  // Certificación AFP

  // crear certificación con datos mínimos: mes, gestión
  async function crearCertificacionAFP (req, res, next) {
    debug('Creando certificación AFP');
    const { Afp } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new Error(`No se han proporcionado los datos de la certificación AFP.`));
      }

      const afp = await Afp.crearCertificacionAFP(req.params.id, req.body, user);
      getResponse(afp, res, 'afp');
    } catch (e) {
      return next(e);
    }
  }

  // Adjuntar certificación
  async function adjuntarCertificacionAFP (req, res, next) {
    debug('Adjuntando certificación AFP');
    const { Afp } = services;
    let user = await userData(req, services);

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el medio.`));
    }

    if (isNullOrUndifined(req.params.idAfp)) {
      return next(new Error(`No se ha proporcionado la certificación AFP.`));
    }

    if (!req.files || !req.files.archivo) {
      return next(new Error(`No se ha proporcionado el archivo adjunto. Por favor, verifique sus datos.`));
    }

    try {
      const afp = await Afp.adjuntarCertificacionAFP(req.params.id, req.params.idAfp, req.files.archivo, user);
      getResponse(afp, res, 'afp');
    } catch (e) {
      return next(e);
    }
  }

  // Rechazar certificado AFP
  async function rechazarCertificacionAFP (req, res, next) {
    debug('Rechazando certificación AFP');
    const { Afp } = services;
    let user = await userData(req, services);

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el medio.`));
    }

    if (isNullOrUndifined(req.params.idAfp)) {
      return next(new Error(`No se ha proporcionado la certificación AFP.`));
    }

    try {
      const afp = await Afp.rechazarCertificacionAFP(req.params.id, req.params.idAfp, user);
      getResponse(afp, res, 'afp');
    } catch (e) {
      return next(e);
    }
  }

  async function confirmarCertificacionAFP (req, res, next) {
    debug('Confirmando cambios en certificación AFP');
    const { Afp } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (!req.query.mes) {
        return next(new Error(`No se ha proporcionado el mes para la certificación AFP.`));
      }

      if (!req.query.gestion) {
        return next(new Error(`No se ha proporcionado la gestión para la certificación AFP.`));
      }

      const afp = await Afp.confirmarCertificacionAFP(req.params.id, req.query.mes, req.query.gestion, user);
      getResponse(afp, res, 'afp');
    } catch (e) {
      return next(e);
    }
  }

  // Obtener certificaciones de un medio
  async function obtenerCertificacionesAFP (req, res, next) {
    debug('Obteniendo certificaciones AFP');
    const { Afp } = services;
    let user = await userData(req, services);
    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      const afp = await Afp.obtenerCertificacionesAFP(req.params.id, user);
      getResponse(afp, res, 'afp');
    } catch (e) {
      return next(e);
    }
  }

  // Obtener adjunto de una certifricación AFP
  async function obtenerAdjuntoAFP (req, res, next) {
    debug('Obteniendo adjunto de una certificación AFP');
    const { Afp } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      if (isNullOrUndifined(req.params.idAfp)) {
        return next(new Error(`No se ha proporcionado la certificación AFP.`));
      }

      const adjunto = await Afp.obtenerAdjuntoAFP(req.params.id, req.params.idAfp, user);
      getResponse(adjunto, res, 'adjunto');
    } catch (e) {
      return next(e);
    }
  }

  // validar el registro del medio
  async function validarRegistroMedio (req, res, next) {
    debug('Validando la totalidad del registro del medio');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      const medio = await Medio.validarRegistroMedio(req.params.id, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  // Enviar el Medio al Ministerio
  async function enviarRegistroMedio (req, res, next) {
    debug('Enviando la totalidad del registro del medio');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      if (isNullOrUndifined(req.params.id)) {
        return next(new Error(`No se ha proporcionado el medio.`));
      }

      const medio = await Medio.enviarRegistroMedio(req.params.id, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }
  async function obtenerMediosClasificar (req, res, next) {
    debug('Enviando la totalidad del registro del medio');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      const medios = await Medio.obtenerMediosClasificar(user);
      getResponse(medios, res, 'medios');
    } catch (e) {
      return next(e);
    }
  }
  async function obtenerMediosDocumentacion (req, res, next) {
    debug('Enviando la totalidad del registro del medio');
    const { Medio } = services;
    let user = await userData(req, services);

    try {
      const medios = await Medio.obtenerMediosDocumentacion(user);
      getResponse(medios, res, 'medios');
    } catch (e) {
      return next(e);
    }
  }
  async function clasificarMedio (req, res, next) {
    debug('Clasificando medio');
    const { Medio } = services;
    let user = await userData(req, services);

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el medio.`));
    }

    if (!req.body || Object.keys(req.body).length === 0 || !req.body.clasificacion) {
      return next(new Error(`No se han proporcionado los datos de la clasificación.`));
    }

    try {
      const medio = await Medio.clasificarMedio(req.params.id, req.body, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }
  async function rechazarMedio (req, res, next) {
    debug('Clasificando medio');
    const { Medio } = services;
    let user = await userData(req, services);

    if (isNullOrUndifined(req.params.id)) {
      return next(new Error(`No se ha proporcionado el medio.`));
    }

    try {
      const medio = await Medio.rechazarMedio(req.params.id, req.body, user);
      getResponse(medio, res, 'medio');
    } catch (e) {
      return next(e);
    }
  }

  return {
    obtenerMatriculas,
    obtenerMedioPorMatricula,
    obtenerMedio,
    adjuntarAutorizacionATT,
    adjuntarPoderRL,
    adjuntarContrato,
    obtenerAdjunto,
    adjuntarRupe,
    adjuntarNoComercial,
    actualizarMedio,
    crearReferencia,
    modificarReferencia,
    obtenerReferencias,
    eliminarReferencia,
    crearCertificacionAFP,
    confirmarCertificacionAFP,
    adjuntarCertificacionAFP,
    rechazarCertificacionAFP,
    obtenerCertificacionesAFP,
    obtenerAdjuntoAFP,
    validarRegistroMedio,
    enviarRegistroMedio,
    obtenerMediosClasificar,
    obtenerMediosDocumentacion,
    clasificarMedio,
    rechazarMedio
  };
};
