'use strict';

const debug = require('debug')('pauteo:core:domain:campañas');
const moment = require('moment');

module.exports = function entidadService (repositories, res) {
  const { campana, coberturaCampana, medio, constantes, referencia } = repositories;

  // Metodo para calcular costo campaña Radio/TV
  async function costoCampanaTV (data, user) {
    debug('Domain: Listando costo camapaña');
    let params = {};
    try {
      if (user.id_rol === constantes.ROL_TECNICO) {
        params.id_tecnico = user.id;
      }
      const c = await campana.costoCampanaTV(data, params);
      return res.success(c);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerCampanas (user) {
    debug('Domain: Obteniendo campañas');
    let params = {};

    try {
      if (user.id_rol === constantes.ROL_TECNICO) {
        params.id_tecnico = user.id;
      }
      const campanas = await campana.findAll(params);

      return res.success(campanas);
    } catch (e) {
      return res.error(e);
    }
  }

  async function crearCampana (data, user) {
    debug('Domain: Creando campañas');
    // console.log('*** campaña: ', JSON.stringify(data, null, 2), '\n');
    try {
      let campanaCreate = {};
      // data.gestion = new Date(data.fecha_inicio).getFullYear();
      data.gestion = moment(data.fecha_inicio, 'YYYY-MM-DD').year();
      campanaCreate = Object.assign({}, data);

      // console.log('*** campanaCreate: ', JSON.stringify(campanaCreate, null, 2));

      const campanaValidate = await validarCampanaCreacion(campanaCreate);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      campanaCreate._user_created = user.id;
      campanaCreate.id_tecnico = user.id;
      campanaCreate.codigo = null;

      const campanaReturn = await campana.createOrUpdate(campanaCreate);
      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }
  async function modificarCampana (idCampana, data, user) {
    debug('Domain: Modificando campañas');

    try {
      let campanaUpd = {};
      campanaUpd = Object.assign({}, data);

      let campanaValidate = await validarCampana(idCampana, user);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      campanaUpd.id = campanaValidate.data.id;
      campanaUpd._user_updated = user.id;

      const campanaReturn = await campana.createOrUpdate(campanaUpd);
      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }
  async function eliminarCampana (idCampana, user) {
    debug('Domain: Eliminando campañas');

    try {
      let campanaValidate = await validarCampana(idCampana, user);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaReturn = await campana.deleteItem(idCampana);
      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }
  async function obtenerCampana (idCampana, user) {
    debug('Domain: Obteniendo campaña');

    try {
      let campanaValidate = await validarCampana(idCampana, user, false);

      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaReturn = Object.assign({}, campanaValidate.data);

      let coberturas = await coberturaCampana.findAll({ id_campana: idCampana });
      coberturas = coberturas.rows.map(itemCobertura => {
        const obj = {
          id_campana: idCampana,
          id_dpa: itemCobertura.id_dpa,
          dpa: {
            nivel: itemCobertura['dpa.nivel_dpa'],
            codigo_ine: itemCobertura['dpa.codigo_ine'],
            nombre: itemCobertura['dpa.nombre']
          }
        };

        if (campanaReturn.tipo_cobertura === constantes.COBERTURA_PROVINCIAL) {
          obj.dpa.departamento = {
            id_dpa: itemCobertura['dpa.superior.id'],
            nombre: itemCobertura['dpa.superior.nombre'],
            codigo_ine: itemCobertura['dpa.superior.codigo_ine']
          };
        }

        if (campanaReturn.tipo_cobertura === constantes.COBERTURA_MUNICIPAL) {
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

      campanaReturn.coberturas = coberturas;

      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function validarCampana (idCampana, user, edicion = true) {
    debug('Domain: Validando Edición de Campaña');
    const campanaValidate = await campana.findById(idCampana);
    if (!campanaValidate) {
      return res.error(`No existe la campaña solicitada.`);
    }

    // if (edicion && campanaValidate.estado !== 'NUEVO') {
    //   return res.error(`La campaña solicitada ya no puede ser editada.`);
    // }

    return res.success(campanaValidate);
  }

  async function validarCampanaCreacion (data) {
    debug('Domain: Validando campaña');
    const esCampanaRadioTV = (data.id_tipo_campana === constantes.TIPO_MEDIO_TV || data.id_tipo_campana === constantes.TIPO_MEDIO_RADIO || data.id_tipo_campana === constantes.TIPO_MEDIO_RADIO_FM || data.id_tipo_campana === constantes.TIPO_MEDIO_RADIO_AM);
    if (!data.id_tipo_campana || (data.id_tipo_campana !== constantes.TIPO_MEDIO_TV &&
      data.id_tipo_campana !== constantes.TIPO_MEDIO_RADIO_FM && data.id_tipo_campana !== constantes.TIPO_MEDIO_RADIO_AM &&
      data.id_tipo_campana !== constantes.TIPO_MEDIO_RADIO && data.id_tipo_campana !== constantes.TIPO_MEDIO_PRENSA)) {
      return res.error(`Tipo de campaña inválida. El tipo de campaña debe ser TV, RADIO O PRENSA.`);
    }

    data.duracion = esCampanaRadioTV ? data.duracion : null;

    if (esCampanaRadioTV && !data.duracion) {
      return res.error(`Si la campaña es de TV o Radio se debe especificar la duración del Spot de la campaña.`);
    }

    if (esCampanaRadioTV && data.duracion <= 0) {
      return res.error(`La duración debe ser mayor a cero segundos.`);
    }

    // Validar que el nombre de la campaña sea única para una gestión
    const campanasValidate = await campana.findAll({ nombre: data.nombre, gestion: data.gestion }, false);
    if (campanasValidate && campanasValidate.rows.length > 0) {
      return res.error(`Ya existe una campaña con el nombre ${data.nombre} para la gestión ${data.gestion}`);
    }

    return res.success(data);
  }

  async function obtenerMediosParaCampana (idCampana, user) {
    const campanaValidate = await obtenerCampana(idCampana, user);
    const mes = (new Date().getMonth()) + 1;

    if (campanaValidate.code === -1) {
      return res.error(campanaValidate.data);
    }

    const params = {};
    const tiposCampana = [];

    tiposCampana.push(campanaValidate.data.id_tipo_campana);

    if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_TV) {
      tiposCampana.push(constantes.TIPO_MEDIO_PROD_IND_TV);
    } else if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_RADIO ||
      campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_RADIO_FM ||
      campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_RADIO_AM) {
      tiposCampana.push(constantes.TIPO_MEDIO_PROD_IND_RADIO_FM);
      tiposCampana.push(constantes.TIPO_MEDIO_PROD_IND_RADIO_AM);
      tiposCampana.push(constantes.TIPO_MEDIO_RADIO_FM);
      tiposCampana.push(constantes.TIPO_MEDIO_RADIO_AM);      
    }

    params.id_tipo_campana = tiposCampana;

    const medios = await medio.findByCampana(params);

    const mediosReturns = medios.map(item => {
      const itemObj = item.toJSON();

      const mismaCobertura = item.tipos_medio.filter(itemTm => itemTm.medioTiposMedio.tipo_cobertura === campanaValidate.data.tipo_cobertura);
      itemObj.misma_cobertura = mismaCobertura && mismaCobertura.length > 0;

      const cumpleAfps = item.afp_certificacion.filter(itemAfp => itemAfp.mes === mes);
      itemObj.cumple_afps = cumpleAfps && cumpleAfps.length > 0;

      return itemObj;
    });

    return res.success(mediosReturns);
  }

  async function asignarMediosCampana (idCampana, data, user) {
    debug('Domain: Relacionando medios a una campaña');
    // Validar que la campaña esté en estado NUEVO
    const campanaValidate = await validarCampana(idCampana, user);
    if (campanaValidate.code === -1) {
      return res.error(campanaValidate.data);
    }

    const medios = [];

    // Recorrer los medios y validarlos
    /* por cada medio validar que
        a) esté ACTIVO
        b) su cobertura
        c) el tipo de medio
    */
    for (let index = 0; index < data.medios.length; index++) {
      const item = data.medios[index];
      const medioValidate = await medio.findById(item);
      if (!medioValidate) {
        return res.error('Alguno de los medios enviados no existe.');
      }

      if (medioValidate.estado !== 'ACTIVO') {
        return res.error(`El medio ${medioValidate.razon_social} no puede ser parte de la Campaña porque su estado (${medioValidate.estado}) no lo permite.`);
      }
      medios.push({
        id_campana: idCampana,
        id_medio: item,
        _user_created: user.id
      });
    }

    // guardar
    await campana.assignMedios(idCampana, medios);
    return res.success(medios);
  }

  async function obtenerMediosRelacionados (idCampana, user) {
    debug('Domain: obtener los medios relacionados a una campaña');
    try {
      const campanaValidate = await validarCampana(idCampana, user, false);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const medios = await campana.findAllMedios(idCampana);
      return res.success(medios);
    } catch (e) {
      return res.error(e);
    }
  }

  async function eliminarMediosRelacionados (idCampana, idCampanaMedio, user) {
    try {
      const campanaValidate = await validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      const medioReturn = await campana.deleteCampanaMedioItem(idCampanaMedio);
      return res.success(medioReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function obtenerMedioRelacionado (idCampana, idCampanaMedio, user) {
    try {
      const campanaValidate = await validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      const medioReturn = await campana.findCampanaMedioById(idCampanaMedio);
      return res.success(medioReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function actualizarCampanaMedio (idCampana, idCampanaMedio, data, user) {
    // Por ahora sólo actualiza referencia
    debug('Domain: Agregando referencia a la orden de publicidad');
    try {
      const campanaValidate = await validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      if (data.id_referencia) {
        const referenciaValidate = await referencia.findById(data.id_referencia);
        if (!referenciaValidate) {
          return res.error('No se encontró el Contacto Comercial del Medio solicitado. Por favor, verifique sus datos.');
        }

        if (referenciaValidate.id_medio !== campanaMedioValidate[0].id) {
          return res.error('El Contacto Comercial enviado no está relacionado con el Medio indicado. Por favor, verifique sus datos.');
        }
      }

      var campanaMedioUpd = {};

      if (data.id_referencia && data.observacion) {
        campanaMedioUpd = {
          id: idCampanaMedio,
          id_referencia: data.id_referencia,
          _user_updated: user.id,
          observacion: data.observacion
        };
      } else if (data.id_referencia) {
        campanaMedioUpd = {
          id: idCampanaMedio,
          id_referencia: data.id_referencia,
          _user_updated: user.id
        };
      } else {
        campanaMedioUpd = {
          id: idCampanaMedio,
          _user_updated: user.id,
          observacion: data.observacion
        };
      }

      const medioReturn = await campana.createOrUpdateCampanaMedio(campanaMedioUpd);
      return res.success(medioReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function cambiarEstado (idCampana, data, user) {
    debug('Domain: Cambiando el estado de la campaña');
    try {
      const campanaValidate = await validarCampana(idCampana, user, false);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      if (campanaValidate.data.estado !== constantes.ESTADO_CREADO) {
        return res.error(`No se puede cambiar de estado a la campañana ${campanaValidate.data.nombre} porque su estado (${campanaValidate.data.estado}) no lo permite.)`);
      }

      const estado = data.estado;
      if (estado !== constantes.ESTADO_APROBADO && estado !== constantes.ESTADO_RECHAZADO && estado !== constantes.ESTADO_OBSERVADO) {
        return res.error(`No se puede cambiar de estado de ${campanaValidate.data.estado} a ${estado}`);
      }

      const campanaUpd = {
        id: idCampana,
        _user_updated: user.id,
        estado,
        mensaje_estado: data.mensaje

      };
      if (estado === constantes.ESTADO_APROBADO) {
        campanaUpd.fecha_aprobacion = new Date();
        campanaUpd.codigo = data.codigo;
      } else if (estado === constantes.ESTADO_OBSERVADO) {
        campanaUpd.fecha_observacion = new Date();
      } else {
        campanaUpd.fecha_rechazo = new Date();
      }
      const campanaReturn = await campana.createOrUpdate(campanaUpd);
      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function validarCampanaEnviar (idCampana, user) {
    debug('Validando campaña antes de enviar a JEFE/A Pauteo');
    try {
      const campanaValidate = await validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }
      let strMensajeError = '';

      // validar que la campaña tenga cobertura
      const coberturas = await coberturaCampana.findAll({ id_campana: idCampana });
      if (!campanaValidate.data.tipo_cobertura || !coberturas.rows || coberturas.rows.length === 0) {
        strMensajeError = `-La campaña aún no tiene una cobertura seleccionada <br>`;
      }

      // validar que tenga medios asociados
      const medios = await campana.findAllMedios(idCampana);
      if (!campanaValidate.data.medios || campanaValidate.data.medios.length === 0 || !medios || medios.length === 0) {
        strMensajeError = `${strMensajeError} -La campaña aún no cuenta con medios seleccionados<br>`;
      }

      // validar que cada medio tenga por lo menos una órden de publicidad.
      const mediosOrdenes = medios.filter(item => (item.ordenes.length === 0 || !item.ordenes));
      let nombresMedios = mediosOrdenes.map(item => item.medio.razon_social);
      if (mediosOrdenes && mediosOrdenes.length > 0) {
        strMensajeError = `${strMensajeError} -Los siguientes medios de comunicación: ${nombresMedios.join(',')}, no cuentan con órdenes de publicidad asociadas <br>`;
      }

      // validar que cada medio tenga su contacto comercial
      const mediosReferencia = medios.filter(item => !item.id_referencia);
      nombresMedios = mediosReferencia.map(item => item.medio.razon_social);
      if (mediosReferencia && mediosReferencia.length > 0) {
        strMensajeError = `${strMensajeError} -Los siguientes medios de comunicación: ${nombresMedios.join(',')}, no cuentan con un Contacto Comercial seleccionado <br>`;
      }

      if (strMensajeError && strMensajeError.length > 0) {
        return res.error(strMensajeError);
      }

      return res.success(true);
    } catch (error) {
      return res.error(error);
    }
  }

  async function enviarCampana (idCampana, user) {
    debug('Domain: Enviando campaña a Jefe/a de Pauteo');
    try {
      const campanaValidate = await validarCampanaEnviar(idCampana, user);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaUpd = {
        id: idCampana,
        estado: constantes.ESTADO_CREADO,
        fecha_envio: new Date()
      };

      const campanaReturn = await campana.createOrUpdate(campanaUpd);
      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function actualizarCorrelativos (idCampana, data, user) {
    debug('Domain: Enviando campaña a Jefe/a de Pauteo');
    try {
      const campanaValidate = await validarCampana(idCampana, user, false);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      if (campanaValidate.data.estado !== constantes.ESTADO_APROBADO) {
        return res.error(`Sólo es posible actualizar los correlativos de la campaña cuando ésta se encuentra aprobada`);
      }

      // Recorrer los medios de la campaña y actualizar su valor de correlativo
      let itemCorrelativo = data.inicio_correlativo;
      const campanaMedios = campanaValidate.data.medios;

      for (let index = 0; index < campanaMedios.length; index++) {
        const item = campanaMedios[index];
        item.correlativo = itemCorrelativo;
        await campana.createOrUpdateCampanaMedio(item.campanaMedio);
        itemCorrelativo = parseInt(itemCorrelativo, 10) + 1;
      }

      const campanaUpd = {
        id: idCampana,
        cite: data.cite,
        inicio_correlativo: data.inicio_correlativo,
        visual_correlativo: data.visual_correlativo,
        _user_updated: user.id,
        estado: constantes.ESTADO_GENERADO,
        fecha_generacion: new Date()
      };

      const campanaReturn = await campana.createOrUpdate(campanaUpd);
      return res.success(campanaReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  return {
    costoCampanaTV,
    obtenerCampanas,
    crearCampana,
    modificarCampana,
    eliminarCampana,
    obtenerCampana,
    validarCampana,
    obtenerMediosParaCampana,
    asignarMediosCampana,
    obtenerMediosRelacionados,
    eliminarMediosRelacionados,
    obtenerMedioRelacionado,
    cambiarEstado,
    validarCampanaEnviar,
    enviarCampana,
    actualizarCampanaMedio,
    actualizarCorrelativos
  };
};
