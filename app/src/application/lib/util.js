'use strict';

const fs = require('fs');
const path = require('path');

function removeDotsItem (item) {
  for (let key in item) {
    item[key.replace(/\./gi, '_')] = item[key];
  }
  return item;
}

function removeDots (response) {
  if (response) {
    if (response.rows) {
      let items = response.rows;
      items.map((item, index) => {
        items[index] = removeDotsItem(item);
      });
      response.rows = items;
    } else {
      if (response) {
        response = removeDotsItem(response);
      }
    }
  }

  return response;
}

function loadResolvers (PATH, opts = {}, services, Query, Mutation) {
  let files = fs.readdirSync(PATH);

  if (opts.exclude) {
    removeAll(opts.exclude, files);
  }

  files.forEach(function (file) {
    let pathFile = path.join(PATH, file);
    if (fs.statSync(pathFile).isDirectory()) {
      loadResolvers(pathFile, opts, services, Query, Mutation);
    } else {
      const Resolver = require(pathFile)(services);
      Query = Object.assign(Query, Resolver.Query);
      Mutation = Object.assign(Mutation, Resolver.Mutation);
    }
  });
}

function loadSchemas (PATH, opts = {}) {
  let files = fs.readdirSync(PATH);
  let schemas = [];

  if (opts.exclude) {
    removeAll(opts.exclude, files);
  }

  files.forEach(file => {
    let pathFile = path.join(PATH, file);
    if (fs.statSync(pathFile).isDirectory()) {
      schemas = schemas.concat(loadSchemas(pathFile, opts));
    } else {
      schemas.push(require(pathFile));
    }
  });

  return schemas;
}

function loadQueries (PATH, opts = {}) {
  let files = fs.readdirSync(PATH);
  let queries = {
    Query: '',
    Mutation: ''
  };

  if (opts.exclude) {
    removeAll(opts.exclude, files);
  }

  files.forEach(file => {
    let pathFile = path.join(PATH, file);
    if (fs.statSync(pathFile).isDirectory()) {
      let file = loadSchemas(pathFile, opts);
      queries.Query += file.Query;
      queries.Mutation += file.Mutation;
    } else {
      let file = require(pathFile);
      queries.Query += file.Query;
      queries.Mutation += file.Mutation;
    }
  });

  return queries;
}

/**
 *
 * @param {array} elements: Array de elementos a eliminar de 'list'
 * @param {array} list: Array de elementos
 */
function removeAll (elements, list) {
  var ind;

  for (var i = 0, l = elements.length; i < l; i++) {
    while ((ind = list.indexOf(elements[i])) > -1) {
      list.splice(ind, 1);
    }
  }
}

module.exports = {
  removeDots,
  removeDotsItem,
  loadSchemas,
  loadQueries,
  loadResolvers
};
