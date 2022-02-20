'use strict';

const { Date, JSON } = require('./scalars');
const { loadResolvers, loadSchemas, loadQueries } = require('../lib/util');
const path = require('path');

let Query = {};
let Mutation = {};

module.exports = (services) => {
  // Cargando Resolvers
  loadResolvers(path.join(__dirname, 'resolvers'), { exclude: ['index.js'] }, services, Query, Mutation);
  const resolvers = { Query, Mutation, Date, JSON };

  // Cargando Schemes
  const schemes = loadSchemas(path.join(__dirname, 'schemes'));

  // Cargando Queries & Mutation
  const queries = loadQueries(path.join(__dirname, 'queries'));

  return {
    schemes,
    queries,
    resolvers
  };
};
