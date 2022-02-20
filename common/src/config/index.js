'use strict';

const db = require('./db');
const mail = require('./mail');
const auth = require('./auth');

module.exports = {
  db,
  mail,
  auth
};
