'use strict';

const i18n = require('./src/lib/i18n');
const mail = require('./src/lib/mail');
const text = require('./src/lib/text');
const array = require('./src/lib/array');
const config = require('./src/config');
const errors = require('./src/lib/errors');
const object = require('./src/lib/object');
const sequelizeCrud = require('./src/lib/sequelize-crud');

module.exports = {
  i18n,
  errors,
  config,
  sequelizeCrud,
  mail,
  text,
  array,
  object
};
