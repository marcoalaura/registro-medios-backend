'use strict';

const debug = require('debug')('pauteo:core:domain:modulos');

module.exports = function moduloService (repositories, res) {
  const { modulos, permisos, roles } = repositories;
  const Permiso = require('./Permiso')(repositories, res);

  async function getMenu (idRol = 5, subsection = false) {
    if (idRol == null) {    // Si no identifica su rol, se le asignara el del medio de comunicación
      idRol = 5;
    }
    debug(`Obteniendo menú y permisos del rol ${idRol}`);
    let lista;
    let oPermisos = {};
    let permissions = [];
    let obj = {};
    let menu = [];

    try {
      let items = await permisos.findAll({ id_rol: idRol });
      items.rows.map(item => {
        oPermisos['item-' + item.id_modulo] = item;

        let path = item['modulo.ruta'];
        if (item.read) {
          permissions.push(`${path}:read`);
        }
        if (item.create) {
          permissions.push(`${path}:create`);
        }
        if (item.update) {
          permissions.push(`${path}:update`);
        }
        if (item.delete) {
          permissions.push(`${path}:delete`);
        }
        if (item.csv) {
          permissions.push(`${path}:csv`);
        }
        if (item.firma) {
          permissions.push(`${path}:firma`);
        }
      });

      lista = await modulos.findAll({ order: 'orden' });
      lista = lista.rows;
      // Reordenando módulos en forma de árbol
      for (let i in lista) {
        let item = lista[i];
        if (!item['id_modulo'] && !item['id_seccion']) {
          item['type'] = 'module';
          obj['item-' + item['id']] = item;
        } else {
          if (!item['id_seccion']) {
            item['type'] = 'section';
            item['parent'] = obj['item-' + item['id_modulo']].id;
            if (!obj['item-' + item['id_modulo']]['children']) {
              obj['item-' + item['id_modulo']]['children'] = {};
            }
            obj['item-' + item['id_modulo']]['children'][item['id']] = item;
          } else if (subsection) {
            item['type'] = 'subsection';
            if (!obj['item-' + item['id_modulo']]['children'][item['id_seccion']]['children']) {
              obj['item-' + item['id_modulo']]['children'][item['id_seccion']]['children'] = {};
            }
            obj['item-' + item['id_modulo']]['children'][item['id_seccion']]['children'][item['id']] = item;
          }
        }
      }
      // Generando menú de acuerdo a los permisos del rol
      for (let i in obj) {
        let item = {
          url: obj[i].ruta,
          icon: obj[i].icono,
          label: obj[i].label
        };
        if (obj[i].children) {
          let items = obj[i].children;
          item.submenu = [];
          for (let j in items) {
            let permiso = oPermisos['item-' + items[j].id];
            if (permiso && permiso.read && items[j].estado === 'ACTIVO' && items[j].visible) {
              item.submenu.push({
                url: items[j].ruta,
                label: items[j].label
              });
            }
          }
        }
        if (oPermisos['item-' + obj[i].id] && oPermisos['item-' + obj[i].id].read && obj[i].estado === 'ACTIVO' && obj[i].visible) {
          menu.push(item);
        }
      }
    } catch (e) {
      return res.error(e);
    }
    return res.success({
      permissions,
      menu
    });
  }

  async function findAll (params = {}) {
    debug('Lista de modulos|filtros');

    let lista;
    try {
      lista = await modulos.findAll(params);
    } catch (e) {
      return res.error(e);
    }

    if (!lista) {
      return res.error(new Error(`Error al obtener la lista de modulos`));
    }

    return res.success(lista);
  }

  async function findById (id) {
    debug('Buscando modulo por ID');

    let modulo;
    try {
      modulo = await modulos.findById(id);
    } catch (e) {
      return res.error(e);
    }

    if (!modulo) {
      return res.error(new Error(`Modulo ${id} not found`));
    }

    return res.success(modulo);
  }

  async function createOrUpdate (data) {
    debug('Crear o actualizar modulo');

    let modulo;
    try {
      modulo = await modulos.createOrUpdate(data);
    } catch (e) {
      return res.error(e);
    }

    if (!modulo) {
      return res.error(new Error(`El modulo no pudo ser creado`));
    }

    if (data.id === undefined) {
      try {
        let items = await roles.findAll();
        if (items.count) {
          for (let rol of items.rows) {
            let permiso = await permisos.createOrUpdate({
              id_rol: rol.id,
              id_modulo: modulo.id,
              _user_created: modulo._user_created
            });
            debug(`Nuevo permiso para: ${modulo.label} - ID: ${permiso.id}`);
          }
        } else {
          return res.warning('No se tiene registrado ningún Rol para crear sus permisos');
        }
      } catch (e) {
        return res.error(e);
      }
    }

    return res.success(modulo);
  }

  async function deleteItem (id) {
    debug('Eliminando módulo y sus permisos');

    let deleted;
    try {
      let items = await permisos.findAll({ id_modulo: id });

      // Eliminando permisos del módulo
      for (var i in items.rows) {
        await Permiso.deleteItem(items.rows[i].id);
      }

      // Eliminando módulo
      deleted = await modulos.deleteItem(id);
    } catch (e) {
      return res.error(e);
    }

    if (deleted === -1) {
      return res.error(new Error(`No existe el módulo`));
    }

    if (deleted === 0) {
      return res.error(new Error(`El módulo ya fue eliminado`));
    }

    return res.success(deleted > 0);
  }

  return {
    getMenu,
    findAll,
    findById,
    createOrUpdate,
    deleteItem
  };
};
