'use strict';

const crypto = require('crypto');

function encrypt (password) {
  let shasum = crypto.createHash('sha256');
  shasum.update(password);
  return shasum.digest('hex');
}

function generateUnique (seed) {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function isImageOrPdf (mimetype) {
  return (mimetype === 'image/png' || mimetype === 'image/jpeg' || mimetype === 'image/jpg' || mimetype === 'application/pdf');
}

function nano (template, data) {
  // return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
  return template.replace(/\{([\w.]*)\}/g, function (str, key) {
    let keys = key.split('.');
    let v = data[keys.shift()];
    for (let i = 0, l = keys.length; i < l; i++) { v = v[keys[i]]; }
    return (typeof v !== 'undefined' && v !== null) ? v : '';
  });
}

module.exports = {
  nano,
  encrypt,
  generateUnique,
  isImageOrPdf
};
