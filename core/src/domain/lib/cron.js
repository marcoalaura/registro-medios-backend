const CronJob = require('cron').CronJob;
const util = require('./util');

module.exports = async function setupCron (repositories, services, logs) {
  const { plantilla, constantes, Parametro } = repositories;

  let diaConf = (await Parametro.getParam('DIA_MES_RECORDATORIO_AFPS')).valor || 1;
  let horaConf = (await Parametro.getParam('HORA_RECORDATORIO_AFPS')).valor || 0;
  let minutosConf = (await Parametro.getParam('MINUTOS_RECORDATORIO_AFPS')).valor || 0;

  // Obtener todos los medios con estado POR_CLASIFICAR, ACTIVOS
  async function obtenerMediosNotificar (res) {
    const { Medio } = services;
    const medios = await Medio.obtenerMediosNotificar();
    return medios;
  }

  // const job = new CronJob(`0 ${minutosConf} ${horaConf} ${diaConf} * *`, async function () {  // * Cada dia
  const job = new CronJob(`0 ${minutosConf} ${horaConf} ${diaConf} 4 *`, async function () {  // 4 - Cada mes
    const medios = await obtenerMediosNotificar();

    for (const item of medios.rows) {
      const razonSocial = item.razon_social;
      const plantillaNotificacion = await plantilla.findById(constantes.PLANTILLA_RECORDATORIO_AFPS);
      const hoy = new Date();

      const data = {
        nombre: razonSocial,
        urlLogoMinisterio: 'http://cambio.bo/sites/default/files/styles/largo2__600x600_/public/foto_noticia/mindeco-Abi.bo_.jpg?itok=S_VqOVTC',
        mes: util.obtenerMes(hoy.getMonth()),
        gestion: hoy.getFullYear()
      };

      const cuerpoMail = {
        para: item.email,
        titulo: plantillaNotificacion.asunto
      };

      util.sendMail(plantillaNotificacion, cuerpoMail, data);
    }
  }, null, false, 'America/La_Paz');

  return job;
};
