'use strict';
const { removeDots } = require('../../lib/util');
const { permissions } = require('../../lib/auth');

module.exports = function setupResolver (services) {
  const { Permiso } = services;

  return {
    Query: {
      permisos: async (_, args, context) => {
        permissions(context, 'permisos:read');

        let lista = await Permiso.findAll(args);
        return removeDots(lista.data);
      },
      permiso: async (_, args, context) => {
        permissions(context, 'permisos:read');

        let item = await Permiso.findById(args.id);
        return removeDots(item.data);
      }
    },
    Mutation: {
      permisoAdd: async (_, args, context) => {
        permissions(context, 'permisos:create');

        args.permiso._user_created = context.id_usuario;
        let item = await Permiso.createOrUpdate(args.permiso);
        return removeDots(item.data);
      },
      permisoEdit: async (_, args, context) => {
        permissions(context, 'permisos:update');

        args.permiso._user_updated = context.id_usuario;
        args.permiso._updated_at = new Date();
        args.permiso.id = args.id;
        let item = await Permiso.createOrUpdate(args.permiso);
        return removeDots(item.data);
      },
      permisoDelete: async (_, args, context) => {
        permissions(context, 'permisos:delete');

        let deleted = await Permiso.deleteItem(args.id);
        return { deleted: deleted.data };
      }
    }
  };
};
