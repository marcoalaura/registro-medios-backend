'use strict';

const debug = require('debug')('pauteo:core:api:public');
const { generateToken } = require('../lib/auth');

module.exports = services => {
  // Función para la autenticación
  async function auth (req, res, next) {
    debug('Autenticación de usuario');
    const { Usuario, Modulo, Parametro, Log } = services;
    // const { usuario, nit, contrasena } = req.body;
    const usuario = req.body.usuario.trim();
    let nit = req.body.nit;
    const contrasena = req.body.contrasena;
    if (nit) {
      nit = nit.trim();
      nit = parseInt(nit).toString();
    }

    const routesRol = {
      1: 'entidades',
      2: 'usuarios',
      3: ''
    };
    let respuesta;
    
    try {
      if (!usuario || !contrasena) {
        return res.status(403).send({ error: 'El usuario y la contraseña son obligatorios' });
      }
      // Verificando que exista el usuario/contraseña
      let user = await Usuario.userExist(usuario, contrasena, nit);
      if (user.code === -1) {
        return res.status(412).send({ error: user.message });
      }
      user = user.data;

      // Actualizando el último login
      const now = new Date();
      await Usuario.update({
        id: user.id,
        ultimo_login: now
      });
      Log.info(`El usuario: ${usuario} ingresó al sistema a las ${now}`, 'LOGIN', null, usuario);

      // Obteniendo menu
      let menu = await Modulo.getMenu(user.id_rol);
      let permissions = menu.data.permissions;
      menu = menu.data.menu;

      // Generando token
      let token = await generateToken(Parametro, usuario, permissions);

      // Formateando permisos
      let permisos = {};
      permissions.map(item => (permisos[item] = true));

      respuesta = {
        menu,
        token,
        permisos,
        usuario: {
          'id': user.id,
          'usuario': user.usuario,
          'nombres': user['persona.nombres'],
          'primer_apellido': user['persona.primer_apellido'],
          'segundo_apellido': user['persona.segundo_apellido'],
          'email': user.email,
          'id_entidad': user.id_entidad,
          'id_rol': user.id_rol,
          'entidad': user['entidad.nombre'],
          'rol': user['rol.nombre'],
          'nit': user.nit,
          'lang': 'es',
          'id_medio': user['medios.id'],
          'matricula': user['medios.matricula'],
          'medio_estado': user['medios.estado']
        },
        redirect: routesRol[user.id_rol]
      };
    } catch (e) {
      return next(e);
    }
    res.send(respuesta);
  }

  return {
    auth
  };
};
