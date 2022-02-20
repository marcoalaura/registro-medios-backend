'use strict';

const debug = require('debug')('pauteo:core:domain:órdenes');

module.exports = function entidadService (repositories, res) {
  const { ordenPublicidad, constantes } = repositories;

  async function crearOrdenPublicidad (idCampana, idCampanaMedio, data, user) {
    debug('Domain: Creando órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      let ordenReturn = null;
      if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_PRENSA) {
        const ordenes = await ordenPublicidad.findAll(idCampanaMedio);
        if (ordenes && ordenes.length > 0) {
          return res.error('Ya existe una orden de publicidad de Prensa Escrita para el medio seleccionado.');
        }

        const ordenCreate = Object.assign({}, data);
        ordenCreate._user_created = user.id;
        ordenCreate.id_campana_medio = idCampanaMedio;
        ordenReturn = await ordenPublicidad.createOrUpdate(ordenCreate);
      } else {
        const ordenes = data.ordenes;
        ordenes.forEach(item => {
          item._user_created = user.id;
          item.id_campana_medio = idCampanaMedio;
        });
        ordenReturn = await ordenPublicidad.bulkCreate(ordenes);
      }
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function modificarOrdenPublicidad (idCampana, idCampanaMedio, idOrden, data, user) {
    debug('Domain: Modificando órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      const ordenValidate = await ordenPublicidad.findById(idOrden);
      if (!ordenValidate) {
        return res.error(`No existe la orden de publicidad solicitada.`);
      }

      let ordenReturn = null;
      if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_PRENSA) {
        const ordenUpd = Object.assign({}, data);
        ordenUpd.id = ordenValidate.id;
        ordenUpd._user_updated = user.id;
        ordenReturn = await ordenPublicidad.createOrUpdate(ordenUpd);
      } else {
        return res.error('No se pueden modificar datos de órdenes de publicidad para medios de TV y radio con este servicio.');
      }
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function eliminarCrearOrdenPublicidad (idCampana, idCampanaMedio, nroOrden, data, user) {
    debug('Domain: Eliminando y volviendo a crear órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      let ordenReturn = null;
      if (campanaValidate.data.id_tipo_campana !== constantes.TIPO_MEDIO_PRENSA) {
        await ordenPublicidad.bulkDelete({id_campana_medio: idCampanaMedio, nro_orden: nroOrden});

        // guardamos nuevamente lo enviado
        const ordenes = data.ordenes;
        ordenes.forEach(item => {
          item._user_created = user.id;
          item.id_campana_medio = idCampanaMedio;
        });
        ordenReturn = await ordenPublicidad.bulkCreate(ordenes);
      } else {
        return res.error('No se pueden modificar datos de órdenes de publicidad para medios de Prensa con este servicio.');
      }
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }
  async function eliminarOrdenPublicidad (idCampana, idCampanaMedio, idOrden, user) {
    debug('Domain: Eliminando órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      const ordenValidate = await ordenPublicidad.findById(idOrden);
      if (!ordenValidate) {
        return res.error(`No existe la orden de publicidad solicitada.`);
      }

      let ordenReturn = null;
      ordenReturn = await ordenPublicidad.deleteItem(idOrden);
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }
  async function maximoNroOrden (idCampana, idCampanaMedio, user) {
    debug('Domain: Consultando el número máximo de órden de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      let ordenReturn = null;
      if (campanaValidate.data.id_tipo_campana !== constantes.TIPO_MEDIO_PRENSA) {
        ordenReturn = await ordenPublicidad.obtenerMaximoNroOrden(idCampanaMedio);
      } else {
        return res.error('No se puede encontrar un número de orden.');
      }
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  return {
    crearOrdenPublicidad,
    modificarOrdenPublicidad,
    eliminarOrdenPublicidad,
    eliminarCrearOrdenPublicidad,
    maximoNroOrden
  };
};
