'use strict';

const { loadResolvers, loadSchemas, loadQueries } = require('../lib/util');
const path = require('path');

let Query = {};
let Mutation = {};

module.exports = (graphql = { schemes: [], queries: { Query: '', Mutation: '' }, resolvers: { Query: {}, Mutation: {} } }, services) => {
  // Cargando Schemes
  let schemes = loadSchemas(path.join(__dirname, 'schemes'));

  // Cargando Queries & Mutation
  let queries = loadQueries(path.join(__dirname, 'queries'));

  schemes = schemes.concat(graphql.schemes);
  queries.Query += graphql.queries.Query;
  queries.Mutation += graphql.queries.Mutation;

  // Cargando Resolvers
  loadResolvers(path.join(__dirname, 'resolvers'), { exclude: ['index.js'] }, services, Query, Mutation);
  Query = Object.assign(Query, graphql.resolvers.Query);
  Mutation = Object.assign(Mutation, graphql.resolvers.Mutation);
  let resolvers = { Query, Mutation };

  return {
    schemes,
    queries,
    resolvers
  };
};
