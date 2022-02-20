'use strict';

const debug = require('debug')('pauteo:core:domain:afps');
const { text } = require('common');
const util = require('../lib/util');

module.exports = function entidadService (repositories, res) {
  const { afpCertificacion, parametrica, constantes, Parametro } = repositories;

  async function validarCertificacionAFP (data, idTipo) {
    try {
      debug('Domain: Validando certificación AFP');
      // Validar que no exista la certificación activa para el mismo mes y gestión que se desea crear
      if (!data.mes) {
        return res.error(new Error(`Debe ingresar el mes del certificado AFP.`));
      }
      if (!data.gestion) {
        return res.error(Error(`Debe ingresar la gestión del certificado AFP.`));
      }
      const tipo = await parametrica.findById(idTipo);
      if (!tipo) {
        return res.error(new Error(`No existe el tip de Aseguradora AFP enviado.`));
      }
      if (tipo.grupo !== 'ASEGURADORA_AFP') {
        return res.error(new Error(`No existe el tip de Aseguradora AFP enviado.`));
      }
      const afpValidate = await afpCertificacion.findByIdMedio(data.id_medio, data.mes, data.gestion, idTipo);
      if (afpValidate && afpValidate.estado === 'ACTIVO') {
        return res.error(new Error(`Ya existe una certificación AFP ${tipo.nombre} para el mes y gestión seleccionados.`));
      }
      return res.success(afpValidate);
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarEdicionCertificacionAFP (idMedio, idAfp, user, edicion = true) {
    try {
      const Medio = require('./Medio')(repositories, res);
      await Medio.validarMedio(idMedio, user, true);
      const afpValidate = await afpCertificacion.findById(idAfp);
      if (!afpValidate) {
        return res.error(new Error(`No existe el certificado AFP solicitado.`));
      }
      if (afpValidate.id_medio !== parseInt(idMedio, 10)) {
        return res.error(new Error(`El certificado AFP no corresponde al medio solicitado.`));
      }
      if (edicion && afpValidate.estado === 'ACTIVO') {
        return res.error(new Error(`El certificado AFP ya ha sido enviado y no puede ser modificado.`));
      }
      return res.success(afpValidate);
    } catch (e) {
      return res.error(e);
    }
  }

  async function adjuntarCertificacionAFP (idMedio, idAfp, file, user) {
    const Medio = require('./Medio')(repositories, res);
    try {
      const afpValidate = await validarEdicionCertificacionAFP(idMedio, idAfp, user);
      if (afpValidate.code === -1) {
        return res.error(afpValidate.message);
      }
      if (!text.isImageOrPdf(file.mimetype)) {
        return res.error(new Error(`El archivo proporcionado no se encuentra en el formato correcto.`));
      }
      const afpUpd = Object.assign(afpValidate.data, { _user_updated: user.id });
      afpUpd.ruta_adjunto = await Medio.crearArchivo(idMedio, file, user);
      const afpReturn = await afpCertificacion.createOrUpdate(afpUpd);
      return res.success(afpReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarRechazoCertificacionAFP (idMedio, idAfp, user, edicion = true) {
      const afpValidate = await afpCertificacion.findById(idAfp);
      if (!afpValidate) {
        return res.error(new Error(`No existe el certificado AFP solicitado.`));
      }
      if (afpValidate.id_medio !== parseInt(idMedio, 10)) {
        return res.error(new Error(`El certificado AFP no corresponde al medio solicitado.`));
      }
      if (edicion && afpValidate.estado === 'RECHAZADO') {
        return res.error(new Error(`El certificado AFP ya ha sido rechazado y no puede ser modificado.`));
      }
      return res.success(afpValidate);
    
  }

  async function rechazarCertificacionAFP (idMedio, idAfp, user) {
    const Medio = require('./Medio')(repositories, res);
    try {
      const afpValidate = await validarRechazoCertificacionAFP(idMedio, idAfp, user);
      if (afpValidate.code === -1) {
        return res.error(afpValidate.message);
      }
      const afpUpd = Object.assign(afpValidate.data, { _user_updated: user.id });
      afpUpd.estado = 'RECHAZADO';
      const afpReturn = await afpCertificacion.createOrUpdate(afpUpd);
      return res.success(afpReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function crearCertificacionAFP (idMedio, data, user) {
    debug('Domain: Crear certificación AFP');
    const Medio = require('./Medio')(repositories, res);
    let arrayAfps = [constantes.AFP_PREVISION, constantes.AFP_FUTURO];
    let afpsCreated = [];
    try {
      await Medio.validarMedio(idMedio, user, true);
      for (let i = 0; i < 2; i++) {
        let afpCrear = Object.assign(data, { id_medio: idMedio });
        const validate = await validarCertificacionAFP(data, arrayAfps[i]);
        if (validate.code === -1) { // Ya existe una afp activa, retorna error
          return res.error(validate.message);
        } else { // No existe una afp activa
          if (validate.data && validate.data.id) { // Pero sí una pendiente, la retornamos
            afpsCreated.push(validate.data);
          } else { // La creamos
            afpCrear.id_tipo = arrayAfps[i];
            afpCrear._user_created = user.id;
            const obj = await afpCertificacion.createOrUpdate(afpCrear);
            afpsCreated.push(obj);
          }
        }
      }
      return res.success(afpsCreated);
    } catch (e) {
      return res.error(e);
    }
  }

  async function confirmarCertificacionAFP (idMedio, mes, gestion, user) {
    debug('Domain: Confirmando cambios en certificación AFP');
    try {
      const estado = 'PENDIENTE';
      // Obtenemos todas las certificaciones del mes y la gestión solicitados.
      // const certificaciones = await afpCertificacion.findAll({ mes, gestion, estado, id_medio: idMedio });
      const certificaciones = await afpCertificacion.findAllEstado({ mes, gestion, id_medio: idMedio });
      // Validamos que sean 2
      if (!certificaciones || !certificaciones.rows || certificaciones.rows.length < 2) {
        return res.error(`No ha terminado de subir las certificaciones AFP necesarias para la gestión y el mes seleccionados.`);
      }
      const afpUpds = [];
      for (let i = 0; i < certificaciones.rows.length; i++) {
        const idAfp = certificaciones.rows[i].id;
        const afpValidate = await validarEdicionCertificacionAFP(idMedio, idAfp, user);
        if (afpValidate.code === -1) {
          return res.error(afpValidate.data);
        }
        // Validamos individualmente que tenga adjunto
        const afpUpd = Object.assign(afpValidate.data, {
          estado: 'ACTIVO',
          _user_updated: user.id
        });
        if (!afpUpd.ruta_adjunto) {
          return res.error(`Debe adjuntar el certificado AFP (${afpUpd['tipo.nombre']}) para confirmar la operación.`);
        }
        const afpReturn = await afpCertificacion.createOrUpdate(afpUpd);
        afpUpds.push(afpReturn);
      }
      return res.success(afpUpds);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerCertificacionesAFP (idMedio, user) {
    try {
      const Medio = require('./Medio')(repositories, res);
      await Medio.validarMedio(idMedio, user, false);
      const certificaciones = await afpCertificacion.findDistinctAll({ id_medio: idMedio });

      for (var i = 0; i < certificaciones.rows.length; i++) {
        const item = certificaciones.rows[i];
        const certificacionDet = await afpCertificacion.findAll({
          mes: item.mes,
          gestion: item.gestion,
          id_medio: idMedio
        });
        item.afps = [];
        for (var j = 0; j < certificacionDet.rows.length; j++) {
          const itemDet = certificacionDet.rows[j];
          item.afps.push(itemDet);
        }
      }
      // Fix para resolver el issue de sequelize que retorna el count dentro de un arreglo de objetos
      certificaciones.count = certificaciones.count[0] ? certificaciones.count[0].count : 0;
      return res.success(certificaciones);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerAdjuntoAFP (idMedio, idAfp, user) {
    debug('Domain: Obteniendo adjunto de una certificación AFP');
    try {
      const Medio = require('./Medio')(repositories, res);
      await Medio.validarMedio(idMedio, user, false);
      const afpValidate = await afpCertificacion.findById(idAfp);
      if (!afpValidate) {
        return res.error(`No se encuentra la certificación AFP solicitada.`);
      }
      if (afpValidate.id_medio !== parseInt(idMedio, 10)) {
        return res.error(`La certificación AFP no pertenece al Medio solicitado.`);
      }
      if (!afpValidate.ruta_adjunto) {
        return res.error(`Aún no se ha adjuntado ningún archivo para la certificación AFP solicitada.`);
      }
      const rutaFiles = await Parametro.getParam('RUTA_FILES');
      // let base64 = util.base64Encode(afpValidate.ruta_adjunto);
      let base64 = util.base64Encode(`${rutaFiles.valor}/${idMedio}/${afpValidate.ruta_adjunto}`);
      const afpReturn = {
        base64,
        id: afpValidate.id,
        formato: afpValidate.ruta_adjunto.split('.')[1]
      };
      return res.success(afpReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function deleteItem (id) {
    debug('Eliminando entidad');

    let deleted;
    try {
      deleted = await afpCertificacion.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe la certificación AFP`));
    }

    if (deleted === 0) {
      return res.error(new Error(`La certificación AFP ya fue eliminada`));
    }

    return res.success(deleted > 0);
  }

  return {
    deleteItem,
    crearCertificacionAFP,
    adjuntarCertificacionAFP,
    rechazarCertificacionAFP,
    confirmarCertificacionAFP,
    obtenerCertificacionesAFP,
    obtenerAdjuntoAFP
  };
};
