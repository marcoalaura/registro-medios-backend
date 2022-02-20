'use strict';

const debug = require('debug')('pauteo:core:domain:coberturas-campaña');

module.exports = function entidadService (repositories, res) {
  const { coberturaCampana, constantes, campana, ejecutarTransicion } = repositories;
  async function obtenerCoberturas (idCampana, data, user) {
    try {
      debug('Domain: obteniendo cobertura por campaña');

      const Campana = require('./Campana')(repositories, res);

      const campanaValidate = await Campana.validarCampana(idCampana, user);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const coberturas = await coberturaCampana.findAll({ id_campana: idCampana });

      const coberturasReturn = coberturas.rows.map(itemCobertura => {
        const obj = {
          id_campana: itemCobertura.id_campana,
          id_dpa: itemCobertura.id_dpa,
          dpa: {
            nivel: itemCobertura['dpa.nivel_dpa'],
            codigo_ine: itemCobertura['dpa.codigo_ine'],
            nombre: itemCobertura['dpa.nombre']
          }
        };

        if (campanaValidate.data.tipo_cobertura === constantes.COBERTURA_PROVINCIAL) {
          obj.dpa.departamento = {
            id_dpa: itemCobertura['dpa.superior.id'],
            nombre: itemCobertura['dpa.superior.nombre'],
            codigo_ine: itemCobertura['dpa.superior.codigo_ine']
          };
        }

        if (campanaValidate.data.tipo_cobertura === constantes.COBERTURA_MUNICIPAL) {
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
  // TODO: ya no se debe poder crear o modificar la cobertura si la campaña tiene medios seleccionados
  async function crearCobertura (idCampana, data, user) {
    try {
      debug('Domain: creando cobertura de campaña');

      let dpasCreate = [];

      const Campana = require('./Campana')(repositories, res);
      const Dpa = require('./Dpa')(repositories, res);

      const campanaValidate = await Campana.validarCampana(idCampana, user);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const tipoCobertura = data.tipo;

      if (tipoCobertura === constantes.COBERTURA_NACIONAL) {
        const dpas = await Dpa.obtenerDepartamentos();

        dpasCreate = dpas.data.rows.map(item => item.id);
      } else if (tipoCobertura === constantes.COBERTURA_DEPARTAMENTAL) {
        if (!data.dpas) {
          return res.error('Debe enviar los datos de los departamentos que forman la cobertura de la campaña.');
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
          id_campana: idCampana,
          id_dpa: item
        };
        return obj;
      });

      const operacion = async (t) => {
        const campanaUpd = Object.assign({}, campanaValidate.data);

        campanaUpd.tipo_cobertura = tipoCobertura;
        campanaUpd._user_updated = user.id;

        await campana.createOrUpdate(campanaUpd, t);

        await coberturaCampana.bulkDelete({ id_campana: idCampana }, t);

        return coberturaCampana.bulkCreate(coberturasCreate, t);
      };

      const coberturaReturn = await ejecutarTransicion(operacion);

      return res.success(coberturaReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  return {
    crearCobertura,
    obtenerCoberturas
  };
};
