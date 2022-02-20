'use strict';

// Hook genérico para modificar la fecha de actualización
function hook (sequelize) {
  sequelize.addHook('beforeBulkUpdate', (instance, options, error, fn) => {
    if (instance.model.prototype.rawAttributes._updated_at) {
      instance.fields.push('_updated_at');
      instance.attributes._updated_at = new Date();
    }
  });
}

module.exports = hook;
