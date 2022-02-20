'use strict';

const debug = require('debug')('pauteo:core:domain:dpas');

module.exports = function entidadService (repositories, res) {
  const { dpa, constantes } = repositories;

  async function obtenerDepartamentos () {
    debug('Domain: Obteniendo departamentos');

    try {
      const departamentos = await dpa.findAll({ nivel_dpa: constantes.NIVEL_DPA_DEPARTAMENTO });

      return res.success(departamentos);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerProvinciasPorDepartamento (idDepartamento) {
    debug('Domain: Obteniendo provincias por departamento');
    try {
      // validar que ese idDepartamento exista y sea del nivel_dpa = departamento
      const dpaValidate = await dpa.findById(idDepartamento);

      if (!dpaValidate) {
        return res.error(new Error(`No existe el departamento solicitado.`));
      }

      if (dpaValidate.nivel_dpa !== constantes.NIVEL_DPA_DEPARTAMENTO) {
        return res.error(`El territrio ${dpaValidate.nombre} no es un departamento.`);
      }

      const provincias = await dpa.findAll({ nivel_dpa: constantes.NIVEL_DPA_PROVINCIA, id_dpa_superior: idDepartamento });

      return res.success(provincias);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerMunicipiosPorProvincia (idProvincia) {
    debug('Domain: Obteniendo municipios por provincia');

    try {
      // validar que ese idProvincia exista y sea del nivel_dpa = provincia
      const dpaValidate = await dpa.findById(idProvincia);

      if (!dpaValidate) {
        return res.error(new Error(`No existe el departamento solicitado.`));
      }

      if (dpaValidate.nivel_dpa !== constantes.NIVEL_DPA_PROVINCIA) {
        return res.error(`El territrio ${dpaValidate.nombre} no es una provincia.`);
      }

      const provincias = await dpa.findAll({ nivel_dpa: constantes.NIVEL_DPA_MUNICIPIO, id_dpa_superior: idProvincia });

      return res.success(provincias);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerMunicipiosPorDepartamento (idDepartamento) {
    debug('Domain: Obteniendo municipios por provincia');

    try {
      // validar que ese idDepartamento exista y sea del nivel_dpa = departamento
      const dpaValidate = await dpa.findById(idDepartamento);

      if (!dpaValidate) {
        return res.error(new Error(`No existe el departamento solicitado.`));
      }

      if (dpaValidate.nivel_dpa !== constantes.NIVEL_DPA_DEPARTAMENTO) {
        return res.error(`El territrio ${dpaValidate.nombre} no es una departamento.`);
      }

      const provincias = await dpa.findAll({ nivel_dpa: constantes.NIVEL_DPA_MUNICIPIO }, true, 2, idDepartamento);

      return res.success(provincias);
    } catch (e) {
      return res.error(e);
    }
  }
  async function validarNivelDpa (dpas, nivelDpa, nivelDpaTexto) {
    try {
      for (var i = 0; i < dpas.length; i++) {
        const item = dpas[i];

        const dpaValidate = await dpa.findById(item);

        if (dpaValidate.nivel_dpa !== nivelDpa) {
          return res.error(`El territorio ${dpaValidate.nombre} no es un ${nivelDpaTexto}`);
        }
      }
      return res.success(dpas);
    } catch (e) {
      return res.error(e);
    }
  }

  return {
    obtenerDepartamentos,
    obtenerProvinciasPorDepartamento,
    obtenerMunicipiosPorProvincia,
    obtenerMunicipiosPorDepartamento,
    validarNivelDpa
  };
};
