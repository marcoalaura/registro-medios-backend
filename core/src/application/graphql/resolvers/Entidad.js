'use strict';
const { permissions } = require('../../lib/auth');

module.exports = function setupResolver (services) {
  const { Entidad } = services;

  return {
    Query: {
      entidades: async (_, args, context) => {
        permissions(context, 'entidades:read');

        let items = await Entidad.findAll(args, context.id_rol, context.id_entidad);
        return items.data;
      },
      entidad: async (_, args, context) => {
        permissions(context, 'entidades:read');

        let item = await Entidad.findById(args.id);
        return item.data;
      }
    },
    Mutation: {
      entidadAdd: async (_, args, context) => {
        permissions(context, 'entidades:create');

        args.entidad._user_created = context.id_usuario;
        let item = await Entidad.createOrUpdate(args.entidad);
        return item.data;
      },
      entidadEdit: async (_, args, context) => {
        permissions(context, 'entidades:update');

        args.entidad._user_updated = context.id_usuario;
        args.entidad._updated_at = new Date();
        args.entidad.id = args.id;
        let item = await Entidad.createOrUpdate(args.entidad);
        return item.data;
      },
      entidadDelete: async (_, args, context) => {
        permissions(context, 'entidades:delete');

        let deleted = await Entidad.deleteItem(args.id);
        return { deleted: deleted.data };
      }
    }
  };
};
