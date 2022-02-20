'use strict';

const debug = require('debug')('pauteo:core:domain:usuarios');
const { text } = require('common');
module.exports = function userService (repositories, res) {
  const { usuarios, personas, Iop, constantes } = repositories;
  async function findAll (params = {}, idRol, idEntidad) {
    debug('Lista de usuarios|filtros');
    let lista;
    try {
      switch (idRol) {
        case constantes.ROL_ADMINISTRADOR: // ROL: ADMININSTRADOR
          params['id_roles'] = [2, 3];
          params['id_entidad'] = idEntidad;
          break;
      }

      lista = await usuarios.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de usuarios`));
    }

    return res.success(lista);
  }

  async function findById (id) {
    debug('Buscando usuario por ID');

    let user;
    try {
      user = await usuarios.findById(id);
    } catch (e) {
      return res.error(e);
    }

    if (!user) {
      return res.error(new Error(`Usuario ${id} not found`));
    }

    return res.success(user);
  }

  async function createOrUpdate (data, crearPersona = true) {
    debug('Crear o actualizar usuario');

    let user;
    try {
      let persona = {
        nombres: data.nombres,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
        nombre_completo: data.nombre_completo,
        tipo_documento: data.tipo_documento,
        tipo_documento_otro: data.tipo_documento_otro,
        nro_documento: data.nro_documento,
        fecha_nacimiento: data.fecha_nacimiento,
        movil: data.movil,
        nacionalidad: data.nacionalidad,
        pais_nacimiento: data.pais_nacimiento,
        genero: data.genero,
        telefono: data.telefono
      };

      if (data.id_persona) { // Actualizando persona
        persona.id = data.id_persona;
        persona.estado = data.estado_persona;
        persona._user_updated = data._user_updated;
        persona._updated_at = data._updated_at;
      } else {
        persona._user_created = data._user_created;
      }
      if (crearPersona) {
        persona = await personas.createOrUpdate(persona);
      }

      let usuario = {
        usuario: data.usuario,
        nit: data.nit,
        contrasena: data.contrasena,
        email: data.email,
        cargo: data.cargo,
        id_entidad: data.id_entidad,
        id_rol: data.id_rol,
        id_persona: persona.id || null
      };

      if (data.id) {
        usuario.id = data.id;
        usuario.estado = data.estado;
        usuario._user_updated = data._user_updated;
        usuario._updated_at = data._updated_at;
      } else {
        usuario._user_created = data._user_created;
      }
      user = await usuarios.createOrUpdate(usuario);
    } catch (e) {
      return res.error(e);
    }

    if (!user) {
      return res.error(new Error(`El usuario no pudo ser creado`));
    }
    return res.success(user);
  }

  async function update (data) {
    debug('Actualizar usuario');

    if (!data.id) {
      return res.error(new Error(`Se necesita el ID del usuario para actualizar el registro`));
    }

    let user;
    try {
      user = await usuarios.createOrUpdate(data);
    } catch (e) {
      return res.error(e);
    }

    if (!user) {
      return res.error(new Error(`El usuario no pudo ser actualizado`));
    }

    return res.success(user);
  }

  async function deleteItem (id) {
    debug('Eliminando usuario');

    let deleted;
    try {
      deleted = await usuarios.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe el usuario`));
    }

    if (deleted === 0) {
      return res.error(new Error(`El usuario ya fue eliminado`));
    }

    return res.success(deleted > 0);
  }

  async function verifySIN (usuario, contrasena, nit) {
    try {
      const loginSIN = await Iop.sin.login(nit, usuario, contrasena);
      if (loginSIN.data.Estado === 'ACTIVO HABILITADO') {
        return loginSIN;
      }
      throw new Error('El NIT  se encuentra INACTIVO en la Plataforma del Sistema de Impuestos Nacionales.');
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async function verifySINAndCreate (usuario, contrasena, nit) {
    try {
      await verifySIN(usuario, contrasena, nit);
      const data = {
        usuario,
        nit,
        id_rol: 5,
        _user_created: 1
      };
      const usuarioNuevo = await createOrUpdate(data, false);
      return usuarioNuevo;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async function userExist (usuario, contrasena, nit) {
    debug('Lista de usuario existente');

    let user;
    try {
      user = nit ? await usuarios.findByNit(nit) : await usuarios.findByUsername(usuario);
      if (!user && !nit) {
        return res.error(new Error(`No existe el usuario ${usuario}`));
      }
      if (user && nit) {
        await verifySIN(usuario, contrasena, nit);
      }
      if (!user && nit) {
        user = await verifySINAndCreate(usuario, contrasena, nit);
      }
      if (!nit && user.contrasena !== text.encrypt(contrasena)) {
        return res.error(new Error(`La contraseña del usuario ${usuario} es incorrecta`));
      }
      if (user.estado === 'INACTIVO') {
        return res.error(new Error(`El usuario ${usuario} se encuentra deshabilitado. Consulte con el administrador del sistema.`));
      }
      return user.data ? user : res.success(user);
    } catch (e) {
      return res.error(e);
    }
  }

  async function getUser (usuario, include = true) {
    debug('Buscando usuario por nombre de usuario');

    let user;
    try {
      user = await usuarios.findByUsername(usuario, include);
    } catch (e) {
      return res.error(e);
    }

    if (!user) {
      return res.error(new Error(`Usuario ${usuario} no encontrado`));
    }

    return res.success(user);
  }

  return {
    findAll,
    findById,
    createOrUpdate,
    deleteItem,
    userExist,
    getUser,
    update
  };
}
;
