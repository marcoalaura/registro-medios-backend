'use strict';

const debug = require('debug')('pauteo:core:domain:coberturas-medio');

module.exports = function entidadService (repositories, res) {
  const { cobertura, constantes, medio, ejecutarTransicion } = repositories;
  async function obtenerCoberturas (idMedio, idTipoMedio, data, user) {
    try {
      debug('Domain: obteniendo cobertura por tipo de medio');

      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, false);

      const validateTipoMedio = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);

      if (!validateTipoMedio || validateTipoMedio.length || validateTipoMedio.length === 0) {
        return res.error('El medio no es el tipo de medio indicado.');
      }

      const tipoMedioObj = validateTipoMedio[0].medioTiposMedio.toJSON();

      const coberturas = await cobertura.findAll({ id_tipo_medio: idTipoMedio });

      const coberturasReturn = coberturas.rows.map(itemCobertura => {
        const obj = {
          id_medio_tipo_medio: itemCobertura.id_medio_tipo_medio,
          id_dpa: itemCobertura.id_dpa,
          dpa: {
            nivel: itemCobertura['dpa.nivel_dpa'],
            codigo_ine: itemCobertura['dpa.codigo_ine'],
            nombre: itemCobertura['dpa.nombre']
          }
        };

        if (tipoMedioObj.tipo_cobertura === constantes.COBERTURA_PROVINCIAL) {
          obj.dpa.departamento = {
            id_dpa: itemCobertura['dpa.superior.id'],
            nombre: itemCobertura['dpa.superior.nombre'],
            codigo_ine: itemCobertura['dpa.superior.codigo_ine']
          };
        }

        if (tipoMedioObj.tipo_cobertura === constantes.COBERTURA_MUNICIPAL) {
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
      return res.success(coberturasReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function crearCobertura (idMedio, idTipoMedio, data, user) {
    try {
      debug('Domain: creando cobertura');

      let dpasCreate = [];

      const Medio = require('./Medio')(repositories, res);
      const Dpa = require('./Dpa')(repositories, res);

      const medioValidate = await Medio.validarMedio(idMedio, user, true);

      const validateTipoMedio = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);

      if (!validateTipoMedio || !validateTipoMedio.length || validateTipoMedio.length === 0) {
        return res.error('El medio no es el tipo de medio indicado.');
      }

      const tipoCobertura = data.tipo;

      if (tipoCobertura === constantes.COBERTURA_NACIONAL) {
        const dpas = await Dpa.obtenerDepartamentos();

        dpasCreate = dpas.data.rows.map(item => item.id);
      } else if (tipoCobertura === constantes.COBERTURA_DEPARTAMENTAL) {
        if (!data.dpas) {
          return res.error('Debe enviar los datos de los departamentos que forman la cobertura del medio.');
        }

        dpasCreate = data.dpas;

        const nivelDpaValidate = await Dpa.validarNivelDpa(dpasCreate, constantes.NIVEL_DPA_DEPARTAMENTO, 'departamento');

        if (nivelDpaValidate.code === -1) {
          return res.error(nivelDpaValidate.data);
        }
      } else if (tipoCobertura === constantes.COBERTURA_PROVINCIAL) {
        dpasCreate = data.dpas;

        const nivelDpaValidate = await Dpa.validarNivelDpa(dpasCreate, constantes.NIVEL_DPA_PROVINCIA, 'provincia');

        if (nivelDpaValidate.code === -1) {
          return res.error(nivelDpaValidate.data);
        }
      } else if (tipoCobertura === constantes.COBERTURA_MUNICIPAL) {
        dpasCreate = data.dpas;

        const nivelDpaValidate = await Dpa.validarNivelDpa(dpasCreate, constantes.NIVEL_DPA_MUNICIPIO, 'municipio');

        if (nivelDpaValidate.code === -1) {
          return res.error(nivelDpaValidate.data);
        }
      } else {
        return res.error(`No existe cobertura a nivel ${tipoCobertura}`);
      }
      const coberturasCreate = dpasCreate.map(item => {
        let obj = {
          _user_created: user.id,
          id_medio_tipo_medio: idTipoMedio,
          id_dpa: item
        };
        return obj;
      });

      const operacion = async (t) => {
        const tiposMedioUpd = validateTipoMedio[0].medioTiposMedio;

        tiposMedioUpd.tipo_cobertura = tipoCobertura;
        tiposMedioUpd._user_updated = user.id;

        await medio.createOrUpdateTipoMedio(idMedio, tiposMedioUpd, t);

        await cobertura.bulkDelete({ id_medio_tipo_medio: idTipoMedio }, t);

        return cobertura.bulkCreate(coberturasCreate, t);
      };

      const coberturaReturn = await ejecutarTransicion(operacion);

      return res.success(coberturaReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function deleteItem (id) {
    debug('Eliminando cobertura');

    let deleted;

    try {
      deleted = await cobertura.deleteItem(id);
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
    crearCobertura,
    obtenerCoberturas
  };
};
