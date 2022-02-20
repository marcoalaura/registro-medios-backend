'use strict';
const { removeDots } = require('../../lib/util');
const { permissions } = require('../../lib/auth');

module.exports = function setupResolver (services) {
  const { Usuario } = services;

  return {
    Query: {
      usuarios: async (_, args, context) => {
        permissions(context, 'usuarios:read');

        let lista = await Usuario.findAll(args, context.id_rol, context.id_entidad);
        return removeDots(lista.data);
      },
      usuario: async (_, args, context) => {
        permissions(context, 'usuarios:read');

        let item = await Usuario.findById(args.id);
        return removeDots(item.data);
      }
    },
    Mutation: {
      usuarioAdd: async (_, args, context) => {
        permissions(context, 'usuarios:create');

        args.usuario._user_created = context.id_usuario;
        let item = await Usuario.createOrUpdate(args.usuario);
        return removeDots(item.data);
      },
      usuarioEdit: async (_, args, context) => {
        permissions(context, 'usuarios:update');

        args.usuario._user_updated = context.id_usuario;
        args.usuario._updated_at = new Date();
        args.usuario.id = args.id;
        let item = await Usuario.createOrUpdate(args.usuario);
        return removeDots(item.data);
      },

      usuarioUpdate: async (_, args, context) => {
        permissions(context, 'usuarios:update');

        args.usuario._user_updated = context.id_usuario;
        args.usuario._updated_at = new Date();
        args.usuario.id = args.id;
        let item = await Usuario.update(args.usuario);
        return removeDots(item.data);
      },

      usuarioDelete: async (_, args, context) => {
        permissions(context, 'usuarios:delete');

        let deleted = await Usuario.deleteItem(args.id);
        return { deleted: deleted.data };
      }
    }
  };
};
