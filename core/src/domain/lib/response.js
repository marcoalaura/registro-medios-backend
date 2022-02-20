'use strict';

module.exports = function setupResponse (logs) {
  function success (data, message) {
    return {
      code: 1,
      data,
      message: message || 'OK'
    };
  }

  async function error (error) {
    let data = {
      code: -1,
      // data: process.env.NODE_ENV !== 'production' ? error : '',
      data: error,
      message: error.message || 'ERROR DESCONOCIDO'
    };

    await logs.error(error.message, 'ERROR DOMINIO', error);
    return data;
  }

  function warning (error) {
    return {
      code: 0,
      data: error,
      message: error.message || 'ADVERTENCIA'
    };
  }

  return {
    success,
    error,
    warning
  };
};
