'use strict';

const debug = require('debug')('pauteo:app:graphql');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const auth = require('express-jwt');
const autoload = require('./autoload');
const { config } = require('common');
const { verify } = require('../lib/auth');

module.exports = async function setupGraphql (app, services, graphql = {}) {
  debug('Iniciando servidor GraphQL');

  // Agregando verificación con JWT
  app.use('/graphql', auth(config.auth));

  // Obteniendo token y datos del usuario
  app.use('/graphql', async (req, res, next) => {
    let data;
    try {
      data = await verify(req.headers.authorization.replace('Bearer ', ''), config.auth.secret);

      // Obteniendo usuario
      const { Usuario } = services;
      let usuario = await Usuario.getUser(data.usuario, false);
      usuario = usuario.data;

      req.context = {
        id_usuario: usuario.id,
        id_entidad: usuario.id_entidad,
        id_rol: usuario.id_rol,
        permissions: data.permissions
      };
    } catch (e) {
      return next(e);
    }
    next();
  });

  // Cargando schemes, queries, mutations y resolvers
  graphql = autoload(graphql, services);

  const rootQuery = `
    # Consultas Base
    type Query {
      ${graphql.queries.Query}
    }
    
    # Mutaciones Base
    type Mutation {
      ${graphql.queries.Mutation}
    }
  `;

  const schema = makeExecutableSchema({
    typeDefs: [rootQuery].concat(graphql.schemes),
    resolvers: graphql.resolvers
  });

  // Creando endpoint de entrada de GraphQL
  app.use('/graphql',
    graphqlExpress(req => ({
      schema,
      formatError: (error) => {
        return {
          code: -1,
          data: error.name,
          message: error.message
        };
      },
      context: req.context
    }))
  );

  // Habilitando GraphiQL solo para desarrollo
  if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV !== 'production') {
    app.use('/graphiql',
      graphiqlExpress({
        endpointURL: '/graphql'
      })
    );
  }

  return app;
};
