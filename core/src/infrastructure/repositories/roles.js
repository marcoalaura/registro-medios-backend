'use strict';

const { getQuery } = require('../lib/util');
const { deleteItemModel } = require('../lib/queries');

module.exports = function rolesRepository (models, Sequelize) {
  const { roles } = models;
  const Op = Sequelize.Op;

  function findAll (params = {}) {
    let query = getQuery(params);
    query.where = {};

    if (params.id_roles) {
      query.where.id = {
        [Op.or]: params.id_roles
      };
    }

    return roles.findAndCountAll(query);
  }

  function findById (id) {
    return roles.findOne({
      where: {
        id
      }
    });
  }

  async function createOrUpdate (rol) {
    const cond = {
      where: {
        id: rol.id
      }
    };

    const item = await roles.findOne(cond);

    if (item) {
      const updated = await roles.update(rol, cond);
      return updated ? roles.findOne(cond) : item;
    }

    const result = await roles.create(rol);
    return result.toJSON();
  }

  async function deleteItem (id) {
    return deleteItemModel(id, roles);
  }

  return {
    findAll,
    findById,
    deleteItem,
    createOrUpdate
  };
};
