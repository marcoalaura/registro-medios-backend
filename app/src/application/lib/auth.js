'use strict';

const jwt = require('jsonwebtoken');
const { config } = require('common');

function sign (payload, secret, callback) {
  return jwt.sign(payload, secret, callback);
}

function verify (token, secret, callback) {
  return jwt.verify(token, secret, callback);
}

function permissions (context, permission) {
  if (context.permissions) {
    let type;
    permission = permission.split('|');

    for (let i in permission) {
      if (context.permissions.indexOf(permission[i]) !== -1) {
        return true;
      } else {
        type = permission[i].split(':')[1].toUpperCase();
      }
    }
    throw new Error(`NOT_AUTHORIZED:${type || 'READ'}`);
  } else {
    throw new Error('NOT_AUTHORIZED:READ');
  }
}

async function generateToken (Parametro, usuario, permissions) {
  // Generando token
  let token;
  let exp = await Parametro.getParameter('JWT_TOKEN_EXPIRATION');
  console.log('Tiempo del token en minutos:', exp.data.valor);
  exp = Math.floor(Date.now() / 1000) + (parseInt(exp.data.valor) * 60);
  token = await sign({
    usuario,
    permissions,
    exp
  }, config.auth.secret);

  return token;
}

function generateTokenSolicitante (usuario, permissions) {
  return sign({
    usuario,
    permissions
  }, config.auth.secret);
}

async function userData (req, services) {
  const { headers } = req;
  let user;

  if (headers.authorization) {
    try {
      let data = await verify(req.headers.authorization.replace('Bearer ', ''), config.auth.secret);
      const { Usuario } = services;
      user = await Usuario.getUser(data.usuario, false);
      return user.data;
    } catch (e) {
      throw new Error(`Error al crear el token: ${e.message}`);
    }
  }
}

module.exports = {
  sign,
  verify,
  permissions,
  generateToken,
  generateTokenSolicitante,
  userData
};
