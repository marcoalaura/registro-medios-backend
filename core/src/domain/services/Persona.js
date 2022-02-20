'use strict';

const debug = require('debug')('pauteo:core:domain:personas');
module.exports = function userService (repositories, res) {
  const { personas, Iop } = repositories;

  async function findAll (params = {}, idRol, idEntidad) {
    debug('Lista de personas|filtros');
    let lista;
    try {
      params['id_entidad'] = idEntidad;

      switch (idRol) {
        case 1: // ROL: SUPERADMIN
          params['id_roles'] = [1, 2, 3];
          params['id_entidad'] = null; // Lista de todas las entidades
          break;
        case 2: // ROL: ADMININSTRADOR
          params['id_roles'] = [2, 3];
          break;
      }

      lista = await personas.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de personas`));
    }

    return res.success(lista);
  }

  async function contrastacion (persona, tipo = 1) {
    let data = {
      numero_documento: persona.numero_documento,
      fecha_nacimiento: persona.fecha_nacimiento,
      primer_apellido: persona.primer_apellido || '--',
      segundo_apellido: persona.segundo_apellido || '--',
      nombres: persona.nombres
    };
    if (typeof data.numero_documento === 'string' && data.numero_documento.split('-').length > 1) {
      let doc = data.numero_documento.split('-');
      data.numero_documento = doc[0];
      data.complemento = doc[1];
    }
    if (typeof data.fecha_nacimiento === 'string' && data.fecha_nacimiento.split('-').length > 1) {
      let fechaArray = data.fecha_nacimiento.split('-');
      data.fecha_nacimiento = fechaArray[2] + '/' + fechaArray[1] + '/' + fechaArray[0];
    }

    let result = await Iop.segip.contrastacion(data, tipo);

    console.log('RESULTADO CONTRASTACION: ', result);
    if (result.warning) {
      data = {
        data: result.warning,
        estado: 'OBSERVADO_SEGIP'
      };
    } else if (result.error) {
      data = {
        data: result.error,
        estado: 'NO_EXISTE_SEGIP'
      };
    } else {
      let message = [];
      let keys = [
        { value: 'NumeroDocumento', text: 'Número de documento' },
        { value: 'Nombres', text: 'Nombres' },
        { value: 'PrimerApellido', text: 'Primer apellido' },
        { value: 'SegundoApellido', text: 'Segundo apellido' },
        { value: 'FechaNacimiento', text: 'Fecha de nacimiento' }
      ];
      if (data.complemento) {
        keys.push({ value: 'Complemento', text: 'Complemento' });
      }
      for (let i in keys) {
        if (result[keys[i].value] !== '') {
          if (result[keys[i].value] === 0) {
            message.push(`${keys[i].text} es incorrecto`);
          } else if (result[keys[i].value] === 2) {
            message.push(`${keys[i].text} no se pudo verificar esta información`);
          }
        }
      }
      if (message.length > 0) {
        data = {
          data: message.join(', '),
          estado: 'OBSERVADO_SEGIP'
        };
      } else {
        data = {
          data: '',
          estado: 'VERIFICADO_SEGIP',
          persona: {
            nombres: persona.nombres,
            paterno: persona.primer_apellido,
            materno: persona.segundo_apellido,
            tipo_documento: 'CI',
            nro_documento: persona.numero_documento,
            fecha_nacimiento: persona.fecha_nacimiento
          }
        };
      }
    }
    return data;
  }
  async function findById (id) {
    debug('Buscando persona por ID');

    let user;
    try {
      user = await personas.findById(id);
    } catch (e) {
      return res.error(e);
    }

    if (!user) {
      return res.error(new Error(`Usuario ${id} not found`));
    }

    return res.success(user);
  }

  async function createOrUpdate (data, userId) {
    debug('Crear o actualizar persona');
    const personaFound = await personas.findByCI(data.nro_documento, data.fecha_nacimiento);
    // Validar mayoría de edad
    const fechaNacimiento = new Date(data.fecha_nacimiento);
    const anoNacimiento = fechaNacimiento.getFullYear();
    const hoy = new Date();
    const anoHoy = hoy.getFullYear();
    if (anoHoy - anoNacimiento < 18) {
      return res.error(`No se puede agregar a la persona solicitada porque es menor de edad.`);
    }
    let dataCreate = {};
    if (!personaFound) {
      dataCreate = {
        nombres: data.nombres,
        primer_apellido: data.paterno,
        segundo_apellido: data.materno,
        nombre_completo: `${data.nombres} ${data.paterno || ''} ${data.materno || ''}`,
        tipo_documento: data.tipo_documento,
        nro_documento: data.nro_documento + (data.complemento ? '-' + data.complemento : ''),
        fecha_nacimiento: data.fecha_nacimiento,
        nacionalidad: data.nacionalidad
      };
    } else {
      dataCreate = personaFound;
    }
    let user;
    try {
      if (dataCreate.id) {
        dataCreate._user_updated = dataCreate._usuario_modificacion || userId;
      } else {
        dataCreate._user_created = dataCreate._usuario_creacion || userId;
      }
      user = await personas.createOrUpdate(dataCreate);
    } catch (e) {
      return res.error(e);
    }

    if (!user) {
      return res.error(new Error(`La persona no pudo ser creada`));
    }

    return res.success(user);
  }

  async function deleteItem (id) {
    debug('Eliminando persona');

    let deleted;
    try {
      deleted = await personas.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe el persona`));
    }

    if (deleted === 0) {
      return res.error(new Error(`La persona ya fue eliminado`));
    }

    return res.success(deleted > 0);
  }

  return {
    findAll,
    findById,
    createOrUpdate,
    deleteItem,
    contrastacion
  };
};
