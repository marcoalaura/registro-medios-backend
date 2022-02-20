'use strict';

const debug = require('debug')('pauteo:core:domain:medios');
const fs = require('fs');
const util = require('../lib/util');
const { text } = require('common');
const validatorEmail = require('email-validator');

module.exports = function medioService (repositories, res) {
  const { medio, Iop, parametrica, referencia, Parametro, cobertura, tarifario, constantes, ejecutarTransicion, plantilla } = repositories;
  const Persona = require('./Persona')(repositories, res);

  async function obtenerMatriculasIop (nit) {
    debug('Obtener matrículas por Servicio de Interoperabilidad');

    try {
      const matriculas = await Iop.fundempresa.matriculas(nit);
      if (!matriculas || !matriculas.length || !matriculas.length === 0) {
        return [];
      }

      return matriculas;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async function obtenerMatriculas (nit) {
    debug('Obtener matrículas');

    try {
      const matriculas = await obtenerMatriculasIop(nit);
      return res.success(matriculas);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerMedioPorMatricula (nit, matricula, user, tieneMatricula = true) {
    debug('Obtener medio por nit y matrícula');

    let razonSocial = null;

    // buscar en la tabla medio el nit y la matricula; si existe, entonces devovler los datos; caso contrario, crear y devolver.
    try {
      // Obtenemos matrículas del servicio de IOP por el nit
      const matriculas = await obtenerMatriculasIop(nit);

      // verificamos que la matrícula esté asociada al NIT sólo si se ha enviado la matrícula
      if (tieneMatricula) {
        const result = matriculas.find(item => item.matricula === matricula);

        if (!result) {
          return res.error(new Error(`La matrícula ${matricula} no está asociada al NIT ${nit}`));
        }

        razonSocial = result.razon_social;
      }

      let medioObj = {};
      let medioReturn = {};
      let params = {};
      params = matricula ? { nit, matricula } : { nit };
      const medioFound = await medio.findAll(params);
      if (medioFound.rows.length === 0 || medioFound.count === 0) {
        medioObj.nit = nit;
        medioObj.razon_social = razonSocial || null;
        medioObj.matricula = tieneMatricula ? matricula : null;
        const infoMatricula = tieneMatricula ? await Iop.fundempresa.matricula(matricula) : null;
        // Adicionar fecha de actualizacion de la matricula
        medioObj.tipo_societario = infoMatricula ? infoMatricula.tipo_societario : null;
        medioObj.ultima_actualizacion = infoMatricula ? (infoMatricula.CtrEstado === '1' ? 'ACTUALIZADO' : 'NO ACTUALIZADO') : (tieneMatricula ? null : 'NO CORRESPONDE');
        medioReturn = await crearMedio(medioObj, user);
      } else {
        medioReturn = medioFound.rows[0];
      }
      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function crearMedio (medioObj, user) {
    try {
      medioObj.id_usuario = user.id;
      medioObj._user_created = user.id;

      const operacion = async (t) => {
        return medio.createOrUpdate(medioObj, t);
      };

      return await ejecutarTransicion(operacion);
    } catch (e) {
      return res.error(e);
    }
  }

  function validarEdicion (medioObj, user) {
    if (medioObj.id_usuario !== user.id) {
      throw new Error('No tiene permisos para realizar esta acción.');
    }

    return true;
  }

  async function validarMedio (idMedio, user, accesoModificacion = false) {
    try {
      const medioFound = await medio.findById(idMedio);

      if (!medioFound) {
        throw new Error(`No se encuentra el medio solicitado.`);
      }

      if (accesoModificacion) {
        validarEdicion(medioFound, user);
      }

      return medioFound;
    } catch (e) {
      throw e.message;
    }
  }

  async function actualizarMedio (idMedio, medioObj, user) {
    try {
      const medioValidate = await validarMedio(idMedio, user, true);

      delete medioObj.nit;

      medioObj._user_updated = user.id;
      medioObj.id = idMedio;

      const tiposMedio = medioObj.tipos_medio;

      const operacion = async (t) => {
        const medioReturn = await medio.createOrUpdate(medioObj, t);

        if (tiposMedio) {
          const tiposMedioUpd = await actualizarTiposMedio(medioValidate.tipos_medio, idMedio, tiposMedio, user, t);

          if (tiposMedioUpd.code === -1) {
            return res.error(tiposMedioUpd.data);
          }

          medioReturn.tipos_medio = tiposMedioUpd;
        }

        return medioReturn;
      };
      const medioReturn = await ejecutarTransicion(operacion);

      if (medioReturn.code === -1) {
        return res.error(medioReturn.data);
      }

      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function actualizarTiposMedio (tiposMedioValidate, idMedio, tiposMedio, user, t) {
    try {
      // recorremos los tipos medio que queremos crear
      for (let i = 0; i < tiposMedio.length; i++) {
        const item = tiposMedio[i];

        // cada elemento de los valores que queremos crear se busca entre los elementos que ya existen en la bd.
        const resultFiltro = await tiposMedioValidate.filter(itemValidate => itemValidate.medioTiposMedio.id_tipo_medio === item);

        if (resultFiltro.length === 0) { // Si no existe, entonces hay que crearlo
          const validate = await validarTipoMedio(tiposMedio);

          if (validate.code === -1) {
            return res.error(validate.data);
          }

          const tipoMedioCreate = {
            id_tipo_medio: item,
            _user_created: user.id,
            id_medio: idMedio
          };

          await medio.createOrUpdateTipoMedio(idMedio, tipoMedioCreate, t);
        }
      }
      // recorremos los tipos de medio que hay en la bd
      for (var i = 0; i < tiposMedioValidate.length; i++) {
        const itemValidate = tiposMedioValidate[i].medioTiposMedio;

        // cada elemento de los valores que tenemos en la bd se busca entre los elementos que se quiere crear
        const resultFiltro = tiposMedio.filter(item => item === itemValidate.id_tipo_medio);

        if (resultFiltro.length === 0) { // Si no existe, entonces hay que eliminarlo
          await medio.deleteTipoMedio(itemValidate.id, t);
        }
      }

      return res.success(tiposMedio);
    } catch (e) {
      return res.error(e);
    }
  }
  async function validarTipoMedio (tiposMedio) {
    try {
      const productoresInd = tiposMedio.filter(item => item === constantes.TIPO_MEDIO_PROD_IND_TV || item === constantes.TIPO_MEDIO_PROD_IND_RADIO_FM || item === constantes.TIPO_MEDIO_PROD_IND_RADIO_AM);

      // if (productoresInd && productoresInd.length > 1) {
      //   return res.error(`No se puede ser Productor Independiente de TV y Radio al mismo tiempo`);
      // }

      const otros = tiposMedio.filter(item => item !== constantes.TIPO_MEDIO_PROD_IND_TV && item !== constantes.TIPO_MEDIO_PROD_IND_RADIO_FM && item !== constantes.TIPO_MEDIO_PROD_IND_RADIO_AM);

      if (productoresInd && otros && otros.length > 0 && productoresInd.length > 0) {
        return res.error(`No se puede ser Productor Independiente de TV o Radio y ser otro tipo de medio al mismo tiempo`);
      }

      for (let i = 0; i < tiposMedio.length; i++) {
        const result = await parametrica.verifyByGrupo(tiposMedio[i], 'TIPO_MEDIO');

        if (!result) {
          return res.error(`El valor ingresado no es un Tipo de Medio válido.`);
        }
      }
    } catch (e) {
      return res.error(e);
    }

    return res.success(true);
  }
  async function adjuntarAutorizacionATT (idMedio, file, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(new Error(`No se encuentra el medio solicitado.`));
    }

    if (!text.isImageOrPdf(file.mimetype)) {
      return res.error(new Error(`El archivo proporcionado no se encuentra en el formato correcto.`));
    }

    try {
      medioFound.ruta_att = await crearArchivo(idMedio, file, user);

      const medioReturn = await medio.createOrUpdate(medioFound);

      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function adjuntarRupe (idMedio, file, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(new Error(`No se encuentra el medio solicitado.`));
    }

    if (!text.isImageOrPdf(file.mimetype)) {
      return res.error(new Error(`El archivo proporcionado no se encuentra en el formato correcto.`));
    }

    try {
      medioFound.ruta_rupe = await crearArchivo(idMedio, file, user);

      const medioReturn = await medio.createOrUpdate(medioFound);

      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function adjuntarNoComercial (idMedio, file, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(new Error(`No se encuentra el medio solicitado.`));
    }

    if (medioFound.matricula) {
      return res.error('No se puede adjuntar el Certificado de Empresa no Comercial a un medio que es Comercial.');
    }

    if (!text.isImageOrPdf(file.mimetype)) {
      return res.error(new Error(`El archivo proporcionado no se encuentra en el formato correcto.`));
    }

    try {
      medioFound.ruta_no_comercial = await crearArchivo(idMedio, file, user);

      const medioReturn = await medio.createOrUpdate(medioFound);

      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function adjuntarContrato (idMedio, file, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(`No se encuentra el medio solicitado.`);
    }

    if (!medioFound.tipos_medio) {
      return res.error(`No se ha clasificado aún al Medio.`);
    }

    const tiposMedioValidate = medioFound.tipos_medio.filter(item => item.medioTiposMedio.id === constantes.TIPO_MEDIO_PROD_IND_RADIO_FM ||
      item.medioTiposMedio.id === constantes.TIPO_MEDIO_PROD_IND_RADIO_AM);

    if (!tiposMedioValidate) {
      return res.error(`No se puede adjuntar un contrato a un medio que no es Productor Independiente de TV o Radio.`);
    }

    if (!text.isImageOrPdf(file.mimetype)) {
      return res.error(new Error(`El archivo proporcionado no se encuentra en el formato correcto.`));
    }

    try {
      medioFound.ruta_contrato_medio = await crearArchivo(idMedio, file, user);

      const medioReturn = await medio.createOrUpdate(medioFound);

      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function adjuntarPoderRL (idMedio, idRepresentante, file, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(new Error(`No se encuentra el medio solicitado.`));
    }

    let representante = await referencia.findById(idRepresentante);

    if (!representante) {
      return res.error(new Error(`No se encuentra el Representante Legal solicitado.`));
    }

    if (representante.tipo !== 'REPRESENTANTE_LEGAL') {
      return res.error(new Error(`No se puede adjuntar un poder de representante legal a un contacto.`));
    }

    if (!text.isImageOrPdf(file.mimetype)) {
      return res.error(new Error(`El archivo proporcionado no se encuentra en el formato correcto.`));
    }

    try {
      representante.ruta_poder_representante = await crearArchivo(idMedio, file, user);

      const representanteReturn = await referencia.createOrUpdate(representante);

      return res.success(representanteReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function crearArchivo (idMedio, file, user) {
    let rutaAdjunto = null;

    try {
      const rutaFiles = await Parametro.getParam('RUTA_FILES');
      const rutaBase = await Parametro.getParam('RUTA_SYSTEM');

      // creamos el directorio para el medio
      rutaAdjunto = util.createMedioDirectory(rutaBase.valor, rutaFiles.valor, idMedio);

      let idFile = text.generateUnique();

      const extension = file.mimetype.split('/')[1];

      rutaAdjunto = `${rutaAdjunto}/${idFile}.${extension}`;

      fs.writeFileSync(rutaAdjunto, file.data);

      // return rutaAdjunto;
      return `${idFile}.${extension}`;
    } catch (e) {
      if (fs.existsSync(rutaAdjunto)) {
        fs.unlinkSync(rutaAdjunto);
      }
      throw e;
    }
  }

  async function crearReferencia (idMedio, referenciaObj, user) {
    try {
      await validarMedio(idMedio, user, true);

      const idPersona = referenciaObj.id_persona;

      const persona = await Persona.findById(idPersona);

      if (!persona || persona.code === -1) {
        throw new Error('No se encuentra a la persona de referencia que desea relacionar al medio.');
      }

      referenciaObj.id_medio = idMedio;
      referenciaObj._user_created = user.id;
      referenciaObj.tipo = referenciaObj.tipo || 'REPRESENTANTE_LEGAL';
      referenciaObj.propietario = referenciaObj.tipo === 'REPRESENTANTE_LEGAL' ? referenciaObj.propietario : false;

      // const referenciaReturn = await referencia.createOrUpdate(referenciaObj);

      const operacion = async (t) => {
        if (referenciaObj.tipo === 'REPRESENTANTE_LEGAL') {
          const referenciaActualizar = {
            _user_updated: user.id,
            estado: 'INACTIVO'
          };
          const cond = { where: {
            id_medio: idMedio,
            tipo: 'REPRESENTANTE_LEGAL',
            estado: 'ACTIVO'
          }};
          await referencia.update(referenciaActualizar, cond, t);
        }

        const referenciaReturn = await referencia.createOrUpdate(referenciaObj, t);

        return referenciaReturn;
      };
      const referenciaReturn = await ejecutarTransicion(operacion);

      if (referenciaReturn.code === -1) {
        return res.error(referenciaReturn.data);
      }

      return res.success(referenciaReturn);
    } catch (e) {
      return res.error(e.message);
    }
  }

  async function formarRespuesta (medioData) {
    let medioObj = Object.assign({}, medioData ? medioData.toJSON() : {});
    let representanteLegal = {};

    // medioObj.referencias = medioData.referencias.map((item) => {
    //   let objReturn = {};
    //   const obj = {
    //     id: item.referencia.id,
    //     email: item.referencia.email,
    //     telefonos: item.referencia.telefonos,
    //     tipo: item.referencia.tipo,
    //     estado: item.referencia.estado,
    //     id_persona: item.referencia.id_persona,
    //     propietario: item.referencia.propietario,
    //     fecha_envio: item.fecha_envio,
    //     persona: {
    //       id: item.id,
    //       nombres: item.nombres,
    //       primer_apellido: item.primer_apellido,
    //       segundo_apellido: item.segundo_apellido,
    //       nombre_completo: item.nombre_completo,
    //       tipo_documento: item.tipo_documento,
    //       nro_documento: item.nro_documento,
    //       fecha_nacimiento: item.fecha_nacimiento
    //     }
    //   };

    //   if (item.referencia.tipo === 'REPRESENTANTE_LEGAL' && item.referencia.estado === 'ACTIVO') {
    //     representanteLegal = Object.assign({}, obj);
    //     representanteLegal.ruta_poder_representante = item.referencia.ruta_poder_representante;
    //   } else {
    //     objReturn = Object.assign({}, obj);
    //     return objReturn;
    //   }
    // });

    medioObj.referencias = medioData.referencia.map((item) => {
      let objReturn = {};
      const obj = {
        id: item.id,
        email: item.email,
        telefonos: item.telefonos,
        tipo: item.tipo,
        estado: item.estado,
        id_persona: item.id_persona,
        propietario: item.propietario,
        fecha_envio: item.persona.fecha_envio,
        persona: {
          id: item.persona.id,
          nombres: item.persona.nombres,
          primer_apellido: item.persona.primer_apellido,
          segundo_apellido: item.persona.segundo_apellido,
          nombre_completo: item.persona.nombre_completo,
          tipo_documento: item.persona.tipo_documento,
          nro_documento: item.persona.nro_documento,
          fecha_nacimiento: item.persona.fecha_nacimiento
        }
      };
      if (item.tipo === 'REPRESENTANTE_LEGAL') {
        representanteLegal = Object.assign({}, obj);
        representanteLegal.ruta_poder_representante = item.ruta_poder_representante;
      } else {
        objReturn = Object.assign({}, obj);
        return objReturn;
      }
    });
    delete medioObj.referencia;

    medioObj.tipos_medio = medioData.tipos_medio.map((item) => {
      return {
        id: item.medioTiposMedio.id,
        nombre: item.nombre,
        id_medio: item.medioTiposMedio.id_medio,
        id_tipo_medio: item.medioTiposMedio.id_tipo_medio,
        tipo_cobertura: item.medioTiposMedio.tipo_cobertura,
        _created_at: item._created_at,
        _updated_at: item._updated_at
      };
    });

    medioObj.referencias = medioObj.referencias.filter(item => {
      if (item) return item;
    });

    medioObj.representante_legal = representanteLegal;

    for (let i = 0; i < medioObj.tipos_medio.length; i++) {
      // Obtenemos cobertura y tarifario
      const item = medioObj.tipos_medio[i];

      const coberturas = await cobertura.findAll({ id_tipo_medio: item.id });

      const tarifarios = await tarifario.findByTipoMedio(item.id, false);

      item.tarifario = tarifarios;

      item.coberturas = coberturas.rows.map(itemCobertura => {
        const obj = {
          id_medio_tipo_medio: itemCobertura.id_medio_tipo_medio,
          id_dpa: itemCobertura.id_dpa,
          dpa: {
            nivel: itemCobertura['dpa.nivel_dpa'],
            codigo_ine: itemCobertura['dpa.codigo_ine'],
            nombre: itemCobertura['dpa.nombre']
          }
        };

        if (item.tipo_cobertura === constantes.COBERTURA_PROVINCIAL) {
          obj.dpa.departamento = {
            id_dpa: itemCobertura['dpa.superior.id'],
            nombre: itemCobertura['dpa.superior.nombre'],
            codigo_ine: itemCobertura['dpa.superior.codigo_ine']
          };
        }

        if (item.tipo_cobertura === constantes.COBERTURA_MUNICIPAL) {
          obj.dpa.provincia = {
            id_dpa: itemCobertura['dpa.superior.id'],
            nombre: itemCobertura['dpa.superior.nombre'],
            codigo_ine: itemCobertura['dpa.superior.codigo_ine']
          };

          obj.dpa.departamento = {
            id_dpa: itemCobertura['dpa.superior.superior.id'],
            nombre: itemCobertura['dpa.superior.superior.nombre'],
            codigo_ine: itemCobertura['dpa.superior.superior.codigo_ine']
          };
        }

        return obj;
      });
    }
    return medioObj;
  }

  async function obtenerMedio (idMedio, user) {
    debug('Domain: obteniendo Medio');

    try {
      const medio2 = await medio.findByIdDetails(idMedio);
      const data2 = await formarRespuesta(medio2);
      return res.success(data2);
    } catch (e) {
      return res.error(e.message);
    }
  }

  async function obtenerReferencias (idMedio, user) {
    try {
      const medioFound = await medio.findById(idMedio);

      if (!medioFound) {
        throw new Error(`No se encuentra el medio solicitado.`);
      }

      return res.success(await referencia.findAll(idMedio));
    } catch (e) {
      return res.error(e.message);
    }
  }

  async function obtenerAdjunto (idMedio, tipo, user) {
    try {
      const medioFound = await medio.findById(idMedio);

      if (!medioFound) {
        throw new Error(`No se encuentra el medio solicitado.`);
      }

      // tipos: att: autorización ATT; rupe: certificado RUPE; poder: Poder de representante legal; contrato: Contrato con el medio; certificado no comercial
      if (tipo !== 'att' && tipo !== 'rupe' && tipo !== 'poder' && tipo !== 'contrato' && tipo !== 'no_comercial') {
        return res.error(`No existen archivos del tipo ${tipo}.`);
      }

      let rutaFile = null;

      if (tipo === 'poder') {
        rutaFile = await obtenerPoderRL(idMedio, user);
      } else {
        let ruta = tipo === 'att' ? 'ruta_att' : (tipo === 'contrato' ? 'ruta_contrato_medio' : 'ruta_no_comercial');
        rutaFile = medioFound[`${ruta}`];
      }
      const rutaFiles = await Parametro.getParam('RUTA_FILES');
      rutaFile = `${rutaFiles.valor}/${idMedio}/${rutaFile}`;

      if (!rutaFile) {
        return res.error(`No se ha adjuntado aún el archivo solicitado.`);
      }

      let base64 = util.base64Encode(rutaFile);

      const returnObj = {
        base64,
        tipo,
        formato: rutaFile.split('.')[1]
      };

      return res.success(returnObj);
    } catch (e) {
      return res.error(e.message);
    }
  }

  async function obtenerPoderRL (idMedio, user) {
    try {
      const repLegal = await obtenerRepresentanteLegal(idMedio, user);

      if (!repLegal.ruta_poder_representante) {
        throw new Error(`No se ha adjuntado aún un Poder Legal para el Representante Legal del medio solicitado`);
      }

      return repLegal.ruta_poder_representante;
    } catch (e) {
      throw e;
    }
  }

  async function obtenerRepresentanteLegal (idMedio, user) {
    const repLegal = await referencia.findByMedioTipo(idMedio, 'REPRESENTANTE_LEGAL');

    if (!repLegal) {
      throw new Error(`El medio solicitado no tiene ningún Representante Legal activo asociado.`);
    }

    return repLegal;
  }

  async function modificarReferencia (idMedio, idReferencia, referenciaObj, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(new Error(`No se encuentra el medio solicitado.`));
    }

    let referenciaFound = await referencia.findById(idReferencia);

    if (!referenciaFound) {
      return res.error(new Error(`No se encuentra la persona de referencia solicitada.`));
    }

    try {
      delete referenciaObj.id_persona;

      referenciaObj.id = referenciaFound.id;
      referenciaObj.id_medio = idMedio;
      referenciaObj._user_updated = user.id;

      const referenciaReturn = await referencia.createOrUpdate(referenciaObj);

      return res.success(referenciaReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function eliminarReferencia (idMedio, idReferencia, user) {
    const medioFound = await medio.findById(idMedio);

    if (!medioFound) {
      return res.error(new Error(`No se encuentra el medio solicitado.`));
    }

    let referenciaFound = await referencia.findById(idReferencia);

    if (!referenciaFound) {
      return res.error(new Error(`No se encuentra la persona de referencia solicitada.`));
    }

    try {
      let referenciaReturn = null;

      // if (referenciaFound.tipo === 'REPRESENTANTE_LEGAL') {
      const referenciaObj = {
        id: referenciaFound.id,
        _user_updated: user.id,
        estado: 'INACTIVO'
      };

      referenciaReturn = await referencia.createOrUpdate(referenciaObj);
      // } else {
      //   referenciaReturn = await referencia.deleteItem(idReferencia);
      // }

      return res.success(referenciaReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function enviarRegistroMedio (idMedio, user) {
    try {
      const medioObj = await validarMedio(idMedio, user, true);

      const medioValidate = await validarRegistroMedio(idMedio, user);

      if (medioValidate.code === -1) {
        return res.error(medioValidate.data);
      }

      const medioUpd = Object.assign({}, medioObj);

      medioUpd._user_updated = user.id;
      medioUpd.estado = 'POR_CLASIFICAR';
      medioUpd.fecha_envio = new Date();

      const medioReturn = await medio.createOrUpdate(medioUpd);

      if (medioObj.estado === 'PENDIENTE') {
        const plantillaReg = await plantilla.findById(constantes.PLANTILLA_REGISTRO_MEDIO);

        const data = {
          nombre: medioObj.razon_social,
          nit: medioObj.nit,
          urlLogoMinisterio: 'http://cambio.bo/sites/default/files/styles/largo2__600x600_/public/foto_noticia/mindeco-Abi.bo_.jpg?itok=S_VqOVTC'
        };

        const cuerpoMail = {
          para: medioObj.email,
          titulo: plantillaReg.asunto
        };
        util.sendMail(plantillaReg, cuerpoMail, data, res);
      }

      return res.success(medioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarRegistroMedio (idMedio, user) {
    try {
      let strMensajeError = '';

      let medioValidate = await obtenerMedio(idMedio, user);

      // Validaciones básicas del medio
      if (medioValidate.code === -1) {
        return res.error(medioValidate.data);
      }

      medioValidate = medioValidate.data;

      if (!medioValidate.nit) {
        strMensajeError = `-El Medio no cuenta con NIT <br>`;
      }

      if (!medioValidate.razon_social) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con Razón social <br>`;
      }

      if (!medioValidate.email) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con un email <br>`;
      }

      if (medioValidate.email && !validatorEmail.validate(medioValidate.email)) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con un email válido (${medioValidate.email} <br>`;
      }

      if (!medioValidate.telefonos) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con teléfonos de contacto <br>`;
      }

      if (!medioValidate.matricula && !medioValidate.ruta_no_comercial) {
        strMensajeError = `${strMensajeError} -El Medio es una empresa No Comercial y no cuenta con el adjunto que lo certifique <br>`;
      }

      if (!medioValidate.tipo_societario) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con un tipo societario seleccionado <br>`;
      }

      // Validaciones de referencias
      if (!medioValidate.representante_legal || Object.keys(medioValidate.representante_legal).length === 0) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con un Propietario o Representante Legal <br>`;
      } else if (medioValidate.representante_legal.tipo === 'REPRESENTANTE_LEGAL' && medioValidate.tipo_societario !== 'EMPRESA UNIPERSONAL' && !medioValidate.representante_legal.ruta_poder_representante) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con el archivo adjunto del Poder del Representante Legal <br>`;
      }

      // Validaciones a nivel de tipo medio
      if (!medioValidate.tipos_medio || !medioValidate.tipos_medio.length || medioValidate.tipos_medio.length === 0) {
        strMensajeError = `${strMensajeError} -El Medio no cuenta con una clasificación según tipos de medio (RADIO, TV, PRENSA, etc. <br>`;
      } else {
        //const esProductorIndependiente = medioValidate.tipos_medio.filter(item =>
        //  item.id_tipo_medio === constantes.TIPO_MEDIO_PROD_IND_TV || item.id_tipo_medio === constantes.TIPO_MEDIO_PROD_IND_RADIO_FM || item.id_tipo_medio === constantes.TIPO_MEDIO_PROD_IND_RADIO_AM);
        const tipoGrupo = medioValidate.tipo_grupo;

        if (tipoGrupo === 'RED' && !(medioValidate.medios)) {
          strMensajeError = `${strMensajeError} -La red de medios no cuenta con los medio relacionados <br>`;
        }

        if ((tipoGrupo === 'PRODUCTOR' || tipoGrupo === 'RED') && !(medioValidate.ruta_contrato_medio)) {
          strMensajeError = `${strMensajeError} -El Medio o Red de medios no cuenta con el archivo adjunto del contrato con el/los medio(s) <br>`;
        }

        let fTipo = [];
        fTipo = medioValidate.tipos_medio.map((item) => { return item.id_tipo_medio; });
        // if (tipoGrupo === 'MEDIO' && !medioValidate.ruta_att) {
        if ((tipoGrupo === 'MEDIO' || tipoGrupo === 'RED') && !medioValidate.ruta_att && !(fTipo.length === 1 && fTipo.indexOf(constantes.TIPO_MEDIO_PRENSA) >= 0)) {
          strMensajeError = `${strMensajeError} -El Medio no cuenta con el archivo adjunto de la Autorización de la ATT <br>`;
        }

        // Validaciones cobertura
        const coberturas = medioValidate.tipos_medio.filter(item => Boolean(item.coberturas) && item.coberturas.length > 0);
        const coberturasPorTipoMedio = medioValidate.tipos_medio.filter(item => !(item.coberturas) || item.coberturas.length === 0);

        if (!coberturas || coberturas.length === 0) {
          strMensajeError = `${strMensajeError} -El Medio no cuenta con coberturas <br>`;
        } else if (coberturasPorTipoMedio && coberturasPorTipoMedio.length > 0) {
          let msgError = coberturasPorTipoMedio.map(item => item.nombre);
          msgError = msgError.join(', ');
          strMensajeError = `${strMensajeError} -El o los tipos de medio: ${msgError} no cuenta(n) con coberturas <br>`;
        }
        
        // Validar tarifarios
        const tipoMedioValidate = medioValidate.tipos_medio;
        for (let i = 0; i < medioValidate.tipos_medio.length; i++) {  
          const item = medioValidate.tipos_medio[i];
          const tarifarios = await tarifario.findByTipoMedio(item.id, false);  

          if (!tarifarios) {
            strMensajeError = `${strMensajeError} -No se ha registrado tarifario para el tipo de medio ${item.nombre} <br>`;  
          } else {
            const tarifarioValidate = await tarifario.findById(tarifarios.id);
            if (!tarifarioValidate.detalles || tarifarioValidate.detalles.length === 0){
              strMensajeError = `${strMensajeError} -No se ha registrado tarifario para el tipo de medio ${item.nombre}<br>`;  
            }
          }
        };
      }

      if (strMensajeError && strMensajeError.length > 0) {
        return res.error(strMensajeError);
      }

      return res.success(true);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerMediosClasificar () {
    debug('Domain: Obteniendo medios para clasificarlos o para ver su clasificación');
    try {
      const medios = await medio.findAll({ estado: [ 'POR_CLASIFICAR', 'ACTIVO' ] });
      medios.rows.forEach(item => {
        const array = item.dataValues.tipos_medio.map(itemTipoMedio => `${itemTipoMedio.nombre}`);
        item.dataValues.tipos_medio = array.join();
      });
      return res.success(medios);
    } catch (error) {
      return res.error(error);
    }
  }

  async function obtenerMediosDocumentacion () {
    debug('Domain: Obteniendo medios para ver su documentacion');
    try {
      const medios = await medio.findAll({ estado: [ 'POR_CLASIFICAR', 'ACTIVO' ] });
      medios.rows.forEach(item => {
        const tmedios = item.dataValues.tipos_medio.map(itemTipoMedio => `${itemTipoMedio.nombre}`);
        const coberturas = item.dataValues.tipos_medio.map(itemCoberturas => {
          return itemCoberturas.medioTiposMedio.tipo_cobertura
        });
        // const contactos = item.dataValues.referencias.map(itemContacto => {
        //   return itemContacto.nombre_completo + ' (' + itemContacto.referencia.telefonos + ') '
        // });
        const contactos = item.dataValues.referencia.map(itemContacto => {
          return itemContacto.persona.nombre_completo + ' (' + itemContacto.telefonos + ') '
        });
        // console.log("COBERTURAS: " + coberturas);
        
        item.dataValues.tipos_medio = tmedios.join();
        item.dataValues.coberturas = coberturas.join();
        item.dataValues.referencias = contactos.join(' - ');
      });
      return res.success(medios);
    } catch (error) {
      return res.error(error);
    }
  }
  async function clasificarMedio (idMedio, data, user) {
    debug('Domain: Clasificando Medio');
    try {
      const medioValidate = await medio.findById(idMedio);

      if (!medioValidate) {
        return res.error(`No se ha encontrado el medio solicitado.`);
      }

      if (medioValidate.estado === 'PENDIENTE' || medioValidate.estado === 'INACTIVO') {
        return res.error(`No se puede clasificar el Medio porque su estado "${medioValidate.estado}" no lo permite.`);
      }

      const medioUpd = {
        id: medioValidate.id,
        clasificacion: data.clasificacion,
        fecha_clasificacion: new Date(),
        _user_updated: user.id,
        estado: 'ACTIVO'
      };

      const medioReturn = await medio.createOrUpdate(medioUpd);
      return res.success(medioReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function rechazarMedio (idMedio, data, user) {
    debug('Domain: Clasificando Medio');
    try {
      const medioValidate = await medio.findById(idMedio);

      if (!medioValidate) {
        return res.error(`No se ha encontrado el medio solicitado.`);
      }

      if (medioValidate.estado !== 'POR_CLASIFICAR' || medioValidate.estado === 'INACTIVO') {
        return res.error(`No se puede rechazar el Medio porque su estado "${medioValidate.estado}" no lo permite.`);
      }

      const medioUpd = {
        id: medioValidate.id,
        _user_updated: user.id,
        estado: 'PENDIENTE'
      };

      const medioReturn = await medio.createOrUpdate(medioUpd);

      // Correo para detallar la observación
      const plantillaReg = await plantilla.findById(constantes.PLANTILLA_RECHAZO_MEDIO);

      const datos = {
        nombre: medioValidate.razon_social,
        nit: medioValidate.nit,
        observacion: data.observacion,
        urlLogoMinisterio: 'http://cambio.bo/sites/default/files/styles/largo2__600x600_/public/foto_noticia/mindeco-Abi.bo_.jpg?itok=S_VqOVTC'
      };

      const cuerpoMail = {
        para: medioValidate.email,
        titulo: plantillaReg.asunto
      };
      util.sendMail(plantillaReg, cuerpoMail, datos, res);

      return res.success(medioReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function obtenerMediosNotificar () {
    return medio.findAll();
  }

  return {
    obtenerMatriculas,
    obtenerMedioPorMatricula,
    adjuntarAutorizacionATT,
    adjuntarPoderRL,
    adjuntarNoComercial,
    adjuntarContrato,
    obtenerAdjunto,
    adjuntarRupe,
    actualizarMedio,
    crearReferencia,
    obtenerReferencias,
    obtenerMedio,
    modificarReferencia,
    eliminarReferencia,
    validarMedio,
    validarRegistroMedio,
    crearArchivo,
    enviarRegistroMedio,
    obtenerMediosClasificar,
    obtenerMediosDocumentacion,
    clasificarMedio,
    rechazarMedio,
    obtenerMediosNotificar
  };
};
