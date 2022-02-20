'use strict';

const debug = require('debug')('pauteo:core:api:system');
const util = require('../../domain/lib/util');
const moment = require('moment');
const { userData, generateToken } = require('../lib/auth');

module.exports = services => {
  // Obteniendo menú y permisos de un usuario - Permiso: ['modulos:read']
  async function obtenerMenu (req, res, next) {
    debug('Obteniendo menú y permisos');
    const { Modulo, Parametro } = services;
    let user = await userData(req, services);
    let menu;
    let token;
    let permisos = {};

    try {
      // Obteniendo menu
      menu = await Modulo.getMenu(user.id_rol);
      let permissions = menu.data.permissions;
      menu = menu.data.menu;

      // Generando token
      token = await generateToken(Parametro, user.usuario, permissions);

      // Formateando permisos
      permissions.map(item => (permisos[item] = true));
    } catch (e) {
      return next(e);
    }

    res.send({
      permisos,
      menu,
      token
    });
  }

  // cambiar contrasena - Permiso: ['usuarios:update']
  async function cambiarContrasena (req, res, next) {
    debug('Cambiar contraseña de usuario');
    const { Usuario } = services;
    const { password, newPassword } = req.body;

    try {
      let _user = await userData(req, services);
      let user = await Usuario.userExist(_user.usuario, password);
      if (user.code === 1) {
        await Usuario.update({
          id: _user.id,
          contrasena: newPassword
        });
        res.send({ message: 'Contraseña cambiada correctamente' });
      } else {
        res.send({ error: 'Su contraseña anterior es incorrecta' });
      }
    } catch (e) {
      return next(e);
    }
  }

  // desactivar cuenta - Permisos: ['usuarios:update']
  async function desactivarCuenta (req, res, next) {
    debug('Desactivar cuenta de usuario');
    const { Usuario } = services;
    const { password } = req.body;
    try {
      let _user = await userData(req, services);
      let user = await Usuario.userExist(_user.usuario, password);
      if (user.code === 1) {
        await Usuario.update({
          id: _user.id,
          estado: 'INACTIVO'
        });
        res.send({ message: '¡Cuenta desactivada!' });
      } else {
        res.send({ error: 'Su contraseña es incorrecta' });
      }
    } catch (e) {
      return next(e);
    }
  }

  async function buscarPersona (req, res, next) {
    debug('Buscando persona en SEGIP');
    const { Persona } = services;
    const { ci } = req.params;
    const { fechaNacimiento, complemento, nombres, primerApellido, segundoApellido, tipoDoc = 'CI' } = req.query;

    let persona;
    try {
      let _user = await userData(req, services);
      // persona = await Iop.segip.buscarPersona(ci, fechaNacimiento, complemento);
      let fechaNac = moment(fechaNacimiento, 'DD/MM/YYYY').utcOffset(0).format('YYYY-MM-DD');
      if (tipoDoc === 'CI') {
        let data = {
          numero_documento: ci + (complemento ? '-' + complemento : ''),
          fecha_nacimiento: fechaNac,
          nombres: nombres,
          primer_apellido: primerApellido,
          segundo_apellido: segundoApellido
        };
        let result = await Persona.contrastacion(data);
        if (result.estado === 'VERIFICADO_SEGIP') {
          persona = await Persona.createOrUpdate(result.persona, _user.id);
        } else {
          persona = { error: result.data };
        }
      } else {
        let data = {
          nro_documento: ci + (complemento ? '-' + complemento : ''),
          fecha_nacimiento: fechaNac,
          nombres: nombres,
          paterno: primerApellido,
          materno: segundoApellido,
          tipo_documento: tipoDoc
        };
        persona = await Persona.createOrUpdate(data, _user.id);
      }
    } catch (e) {
      return next(e);
    }

    res.send(persona);
  }

  async function registraPersona (req, res, next) {
    debug('Registra persona');
    const { Persona } = services;

    let persona;
    try {
      let _user = await userData(req, services);
      
      persona = await Persona.createOrUpdate(req.body, _user.id);
    } catch (e) {
      return next(e);
    }

    res.send(persona);
  }

  async function obtenerParametros (req, res, next) {
    debug('Buscando parametros');
    const { Parametrica } = services;
    const { grupo } = req.query;

    let datos;
    try {
      datos = await Parametrica.findAll({ grupo });
    } catch (e) {
      return next(e);
    }
    if (datos.codigo === -1) {
      return next(datos.data);
    }
    res.send(datos);
  }

  async function obtenerManuales (req, res, next) {
    const { Parametro } = services;
    const { idManual } = req.params;
    try {

      let rutaFile = null;

      if (idManual == 1) {
        rutaFile = 'Manual_medios_de_comunicacion.pdf';
      } else if (idManual == 2) {
        rutaFile = 'Manual_jefe_de_unidad.pdf.pdf';
      }
      else {
        rutaFile = 'Manual_tecnico.pdf';
      }
      const rutaFiles = await Parametro.getParam('RUTA_FILES');
      rutaFile = `${rutaFiles.valor}/${rutaFile}`;

      let base64 = util.base64Encode(rutaFile);

      const returnObj = {
        base64,
        formato: rutaFile.split('.')[1]
      };

      res.send(returnObj);
    } catch (e) {
      return next(e);
    }
  }

  return {
    obtenerMenu,
    cambiarContrasena,
    desactivarCuenta,
    buscarPersona,
    registraPersona,
    obtenerParametros,
    obtenerManuales
  };
};
