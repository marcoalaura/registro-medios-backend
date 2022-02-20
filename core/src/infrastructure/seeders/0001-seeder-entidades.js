'use strict';

const { setTimestampsSeeder } = require('../lib/util');

// Datos de producción
let items = [
  {
    nombre: 'Agencia de gobierno electrónico y tecnologías de la información y comunicación',
    descripcion: 'La AGETIC está acá para desarrollar tecnología, que permita modernizar el Estado, transformar la gestión pública y reducir la burocracia. Estas tareas son desarrolladas por bolivianas y bolivianos que trabajan investigando, innovando e implementando nuevas técnicas y tecnologías que permitan el desarrollo soberano de nuestra patria. Para esto, la AGETIC busca a los mejores profesionales, gente joven comprometida con su gente y el destino de su país.',
    sigla: 'AGETIC',
    email: 'contacto@agetic.gob.bo',
    telefonos: '(+591 -2) 2128706 - (+591 -2) 2128707',
    direccion: 'Sopocachi, Calle Pedro Salazar Nº 631, esq. Andrés Muñoz. Edificio del Fondo Nacional de Desarrollo Regional(FNDR).Pisos 4 y 5',
    web: 'agetic.gob.bo',
    estado: 'ACTIVO'
  }, {
    nombre: 'Ministerio de Comunicación',
    descripcion: 'Ministerio de Comunicación',
    sigla: 'MINCOM',
    email: 'comunicacion@comunicacion.gob.bo',
    telefonos: '(+591 -2)2200402 - (+591 -2) 2200509',
    direccion: 'Calle Potosi #1220, esq Ayacucho',
    web: 'https://comunicacion.gob.bo',
    estado: 'ACTIVO'
  }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sys_entidades', items, {});
  },

  down (queryInterface, Sequelize) { }
};
