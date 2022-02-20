'use strict';

const { setTimestampsSeeder } = require('../lib/util');
const templateCorreo = require('./templates/correo-tmpl');
let items = [
  { nombre: 'JWT_TOKEN_EXPIRATION', valor: 240, label: 'Tiempo de expiración del Token', descripcion: 'Tiempo de expiración del Token JWT en minutos' },
  { nombre: 'EMAIL_ORIGEN', valor: 'correo@agetic.gob.bo', label: 'Remitente', descripcion: 'Email del remitente del sistema para envío de correos' },
  { nombre: 'EMAIL_HOST', valor: 'smtp.agetic.gob.bo', label: 'Host', descripcion: 'Host del servicio de correos para envío de correos' },
  { nombre: 'EMAIL_PORT', valor: 587, label: 'Puerto', descripcion: 'Puerto para envío de correos' },
  { nombre: 'TEMPLATE_CORREO_BASE', valor: templateCorreo, label: 'Template base para el correo', descripcion: 'Template base para el correo electrónico' },
  { nombre: 'URL_ADMIN', valor: `http://localhost:8888/#/`, label: 'URL del administrador', descripcion: 'URL para acceder al administrador' },
  { nombre: 'URL_PORTAL', valor: `http://localhost:8080/#/`, label: 'URL del portal', descripcion: 'URL para acceder al portal' },
  { nombre: 'RUTA_SYSTEM', valor: `${process.cwd()}`, label: 'Ruta', descripcion: 'Ruta del directorio' },
  { nombre: 'RUTA_FILES', valor: `${process.cwd()}/files`, label: 'Ruta', descripcion: 'Ruta para almacenar archivos' },
  { nombre: 'DIA_MES_RECORDATORIO_AFPS', valor: '1', label: 'Día de envío notificaciones AFPs', descripcion: 'Día del mes en el que se envían las notificaciones automáticas para el recordatorio de AFPs (0 - 31)' },
  { nombre: 'HORA_RECORDATORIO_AFPS', valor: '0', label: 'Hora de envío notifiaciones AFPs(0-23)', descripcion: 'Hora en la que se envían las notificaciones automáticas para el recordatorio de AFPs (0 - 23)' },
  { nombre: 'MINUTOS_RECORDATORIO_AFPS', valor: '0', label: 'Minutos de envío notifiaciones AFPs(0-59)', descripcion: 'Minutos en los que se envían las notificaciones automáticas para el recordatorio de AFPs (0 - 59)' }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('parametros', items, {});
  },

  down (queryInterface, Sequelize) { }
};
