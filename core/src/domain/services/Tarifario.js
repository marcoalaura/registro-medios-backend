'use strict';

const debug = require('debug')('pauteo:core:domain:tarifarios');
const util = require('../lib/util');
const moment = require('moment');

module.exports = function tarifarioService (repositories, res) {
  const { tarifario, constantes } = repositories;

  async function obtenerTarifarioDetalle (idMedio, idTipoMedio, idTarifario, idDetalle, user) {
    try {
      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, false);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);
      const tarifarioValidate = await validarTarifarioPorId(idTarifario, tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) {
        return res.error(tarifarioValidate.data);
      }

      const detalleValidate = tarifarioValidate.data.detalles.find(item => item.id === idDetalle);

      if (!detalleValidate) {
        return res.error(`No se encuentra el detalle del tarifario solicitado.`);
      }

      return res.success(detalleValidate);
    } catch (e) {
      return res.error(e);
    }
  }

  async function modificarTarifarioDetalle (idMedio, idTipoMedio, idTarifario, idDetalle, data, user) {
    try {
      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, true);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);
      const tarifarioValidate = await validarTarifarioPorId(idTarifario, tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) {
        return res.error(tarifarioValidate.data);
      }

      if (tarifarioValidate.data.estado === 'ACTIVO') {
        return res.error(`El tarifario ya ha sido enviado y no puede ser modificado.`);
      }

      const detalleValidate = tarifarioValidate.data.detalles.find(item => item.id === idDetalle);

      if (!detalleValidate) {
        return res.error(`No se encuentra el detalle del tarifario solicitado.`);
      }

      // Validamos el cruce de horario
      if (tipoMedioValidate[0].id !== constantes.TIPO_MEDIO_PRENSA) {

        const validateHorarios = await validarHorarioDetalle(data, idTarifario, idDetalle);

        if (validateHorarios.code === -1) {
          return res.error(validateHorarios.data);
        }

      }

      const detalleUpd = Object.assign({}, data);

      detalleUpd.id = idDetalle;
      detalleUpd._user_updated = user.id;

      const detalleReturn = await tarifario.createOrUpdateDetalle(detalleUpd);

      return res.success(detalleReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function eliminarTarifarioDetalle (idMedio, idTipoMedio, idTarifario, idDetalle, user) {
    try {
      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, true);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);
      const tarifarioValidate = await validarTarifarioPorId(idTarifario, tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) {
        return res.error(tarifarioValidate.data);
      }

      if (tarifarioValidate.data.estado === 'ACTIVO') {
        return res.error(`El tarifario ya ha sido enviado y no puede ser modificado.`);
      }

      const detalleValidate = tarifarioValidate.data.detalles.find(item => item.id === idDetalle);

      if (!detalleValidate) {
        return res.error(`No se encuentra el detalle del tarifario solicitado.`);
      }

      const detalleReturn = await tarifario.deleteItemDetalle(idDetalle);

      return res.success(detalleReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function crearTarifarioDetalle (idMedio, idTipoMedio, idTarifario, data, user) {
    try {
      debug('Domain: Crear tarifario detalle');
      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, true);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);
      const tarifarioValidate = await validarTarifarioPorId(idTarifario, tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) {
        return res.error(tarifarioValidate.data);
      }

      if (tarifarioValidate.data.estado === 'ACTIVO') {
        return res.error('El tarifario solicitado ya no puede ser editado.');
      }

      if (tipoMedioValidate[0].id === constantes.TIPO_MEDIO_PRENSA) {
        if (!data.periodicidad) {
          return res.error(`El tarifario de PRENSA necesita una periodicidad que no ha sido especificada`);
        }

        if (!data.tipo_costo) {
          return res.error(`El tarifario de PRENSA necesita un tipo de coste que no ha sido especificado`);
        }

        if (!data.dias) {
          return res.error(`El tarifario de PRENSA necesita un intérvalo de días de circulación que no ha sido especificado`);
        }

        let tarifarioDetCreate = {};

        tarifarioDetCreate = Object.assign({}, data);

        tarifarioDetCreate._user_created = user.id;
        tarifarioDetCreate.id_tarifario = idTarifario;

        const tarifarioReturn = await tarifario.createOrUpdateDetalle(tarifarioDetCreate);

        return res.success(tarifarioReturn);
      } else {
        const validateHorarios = await validarHorarioDetalle(data, idTarifario);

        if (validateHorarios.code === -1) {
          return res.error(validateHorarios.data);
        }

        const detalleCreate = Object.assign({}, data);

        detalleCreate.id_tarifario = idTarifario;
        detalleCreate._user_created = user.id;

        // Si el tipo de medio es productor independiente, entonces el tipo de costo siempre será PAQUETE
        if (tipoMedioValidate[0].id === constantes.TIPO_MEDIO_PROD_IND_TV || tipoMedioValidate[0].id === constantes.TIPO_MEDIO_PROD_IND_RADIO_FM || tipoMedioValidate[0].id === constantes.TIPO_MEDIO_PROD_IND_RADIO_AM) {
          detalleCreate.tipo_costo = 'PAQUETE';
        }

        const detalleReturn = await tarifario.createOrUpdateDetalle(detalleCreate);

        return res.success(detalleReturn);
      }
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarHorarioDetalle (data, idTarifario, idDetalle) {
    try {
      // Validamos que las horas de inicio y fin hayan sido enviadas
      if (!data.hora_inicio) {
        return res.error(`No se ha proporcionado la hora de inicio.`);
      }
      if (!data.hora_fin) {
        return res.error(`No se ha proporcionado la hora final.`);
      }
      if (Object.keys(data.dias).length === 0) {
        return res.error(`No se seleccionaron días.`);
      }

      // Validamos que las horas de inicio y fin tengan el formato de hora HH:MM
      const regexp = /^(?:[0-1]?[0-9]|2[0-3])(?::[0-5][0-9])?$/;
      if (!data.hora_inicio.match(regexp) || data.hora_inicio.match(regexp).length === 0) {
        return res.error(`La hora de inicio ${data.hora_inicio} no está en el formato de hora esperado (HH:MM)`);
      }
      if (!data.hora_fin.match(regexp) || data.hora_fin.match(regexp).length === 0) {
        return res.error(`La hora final ${data.hora_fin} no está en el formato de hora esperado (HH:MM)`);
      }

      // Validamos que la hora de inicio no se mayor o igual a la hora fin
      const { horaInicioMinutos, horaFinMinutos } = util.convertirHoraStrMinutos(data.hora_inicio, data.hora_fin);
      // console.log('-------------------------------horaInicioMinutos', horaInicioMinutos);
      // console.log('-------------------------------horaFinMinutos', horaFinMinutos);
      if (horaInicioMinutos < 300 || horaFinMinutos > 1615) {
        return res.error(`La hora de inicio y hora fin [${data.hora_inicio} - ${data.hora_fin}] debe estar en el rango de [05:00 - 02:55]`);
      }
      if (horaFinMinutos <= horaInicioMinutos) {
        return res.error(`La hora de inicio ${data.hora_inicio} no puede ser mayor igual a la hora fin ${data.hora_fin}`);
      }

      // Validamos que la hora de inicio y fin sean múltiplos de cinco
      if ((horaInicioMinutos % 5) !== 0) {
        return res.error(`La hora de inicio ${data.hora_inicio} no es una hora válida`);
      }
      if ((horaFinMinutos % 5) !== 0) {
        return res.error(`La hora final ${data.hora_fin} no es una hora válida`);
      }

      // validar que los horarios no se sobrepongan
      const tarifarios = await tarifario.findAllDetalle({ id_tarifario: idTarifario, id_detalle: idDetalle });

      let programa = {
        horaInicio: moment(data.hora_inicio, 'HH:mm').format('HH:mm:ss'), 
        horaFin: moment(data.hora_fin, 'HH:mm').format('HH:mm:ss'),
        dias: data.dias
      };

      let cont = 0;
      if (tarifarios && tarifarios.rows.length > 0) {
        let validateIntervalo = true;
        tarifarios.rows.forEach(item => {
          const hora2 = util.convertirHoraStrMinutos(item.hora_inicio, item.hora_fin);
          const horaInicioMinutos2 = hora2.horaInicioMinutos;
          const horaFinMinutos2 = hora2.horaFinMinutos;
          // console.log('-----------------------------------------------------------------------------------------------------');
          // console.log('-------------------------------H1', data.hora_inicio, '   -', data.hora_fin, '    - ', horaInicioMinutos, '-', horaFinMinutos);
          // console.log('-------------------------------H2', item.hora_inicio, '-', item.hora_fin, ' - ', horaInicioMinutos2, '-', horaFinMinutos2);
          let diasChoque = [];
          // Que no se registre dentro de otro programa
          if (horaInicioMinutos >= horaInicioMinutos2 && horaFinMinutos <= horaFinMinutos2) {
            diasChoque = item.dias.filter(function(val) {
              return programa.dias.indexOf(val) != -1;
            });
            if (diasChoque.length > 0) {
              cont += 1;
              validateIntervalo = false;
            } else {
              validateIntervalo = true;
            }
            // console.log('*** if1 val: ', validateIntervalo, ' choques: ', diasChoque);
          }
          // Que no finalice dentro del horario de otro programa
          if (horaInicioMinutos2 < horaFinMinutos && horaInicioMinutos < horaInicioMinutos2 && horaFinMinutos <= horaFinMinutos2) {
            diasChoque = item.dias.filter(function(val) {
              return programa.dias.indexOf(val) != -1;
            });
            if (diasChoque.length > 0) {
              cont += 1;
              validateIntervalo = false;
            } else {
              validateIntervalo = true;
            }
            // console.log('*** if2 val: ', validateIntervalo, ' choques: ', diasChoque);
          }
          // Que no empiece dentro del horario de otro programa
          if (horaInicioMinutos < horaFinMinutos2 && horaInicioMinutos >= horaInicioMinutos2 && horaFinMinutos > horaFinMinutos2) {
            diasChoque = item.dias.filter(function(val) {
              return programa.dias.indexOf(val) != -1;
            });
            if (diasChoque.length > 0) {
              cont += 1;
              validateIntervalo = false;
            } else {
              validateIntervalo = true;
            }
            // console.log('*** if3 val: ', validateIntervalo, ' choques: ', diasChoque);
          }
          // Que no se solape sobre otro programa
          if (horaInicioMinutos < horaInicioMinutos2 && horaFinMinutos > horaFinMinutos2) {
            diasChoque = item.dias.filter(function(val) {
              return programa.dias.indexOf(val) != -1;
            });
            if (diasChoque.length > 0) {
              cont += 1;
              validateIntervalo = false;
            } else {
              validateIntervalo = true;
            }
            // console.log('*** if4 val: ', validateIntervalo, ' choques: ', diasChoque);
          }
        });
        if (!validateIntervalo || cont > 0) {
          return res.error(`Ya existe otro programa que usa la misma franja horario e intérvalo de días que el enviado.`);
        }
      }
      return res.success(data);
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarHorarioDetalle2 (data, idTarifario, idDetalle) {
    try {
      
      // Validamos que las horas de inicio y fin hayan sido enviadas
      if (!data.hora_inicio) {
        return res.error(`No se ha proporcionado la hora de inicio.`);
      }

      if (!data.hora_fin) {
        return res.error(`No se ha proporcionado la hora final.`);
      }

      // Validamos que las horas de inicio y fin tengan el formato de hora HH:MM
      const regexp = /^(?:[0-1]?[0-9]|2[0-3])(?::[0-5][0-9])?$/;

      if (!data.hora_inicio.match(regexp) || data.hora_inicio.match(regexp).length === 0) {
        return res.error(`La hora de inicio ${data.hora_inicio} no está en el formato de hora esperado (HH:MM)`);
      }

      if (!data.hora_fin.match(regexp) || data.hora_fin.match(regexp).length === 0) {
        return res.error(`La hora final ${data.hora_fin} no está en el formato de hora esperado (HH:MM)`);
      }
      
      // Validamos que la hora de inicio no se mayor o igual a la hora fin
      const { horaInicioMinutos, horaFinMinutos } = util.convertirHoraStrMinutos(data.hora_inicio, data.hora_fin);
      if (horaFinMinutos <= horaInicioMinutos) {
        if(horaFinMinutos > 175){ // 175 representa la cantidad de minutos desde las 00:00 hasta las 02:55 AM
          return res.error(`La hora de inicio ${data.hora_inicio} no puede ser mayor igual a la hora fin ${data.hora_fin}`);
        } else if(horaInicioMinutos >= 0 && horaInicioMinutos <= 175){
          if(horaFinMinutos < horaInicioMinutos){
            return res.error(`La hora de inicio ${data.hora_inicio} no puede ser mayor igual a la hora fin ${data.hora_fin}`);
          }
        }
      }

      // Validamos que el programa este dentro del rango permitido
      // if (data.hora_inicio < '05:00' && data.hora_fin >= '23:59') {
      //   return res.error(`La hora de inicio y hora fin [${data.hora_inicio} - ${data.hora_fin}] debe estar en el rango de [05:00 - 23:55]`);
      // }

      // Validamos que la hora de inicio y fin sean múltiplos de cinco
      if ((horaInicioMinutos % 5) !== 0) {
        return res.error(`La hora de inicio ${data.hora_inicio} no es una hora válida`);
      }

      if ((horaFinMinutos % 5) !== 0) {
        return res.error(`La hora final ${data.hora_fin} no es una hora válida`);
      }

      // validar que los horarios no se sobrepongan
      // const tarifarios = await tarifario.findAllDetalle({ id_tarifario: idTarifario, hora_inicio: data.hora_inicio, hora_fin: data.hora_fin, id_detalle: idDetalle });
      const tarifarios = await tarifario.findAllDetalle({ id_tarifario: idTarifario, id_detalle: idDetalle });

      let programa = {
        horaInicio: moment(data.hora_inicio, 'HH:mm').format('HH:mm:ss'), 
        horaFin: moment(data.hora_fin, 'HH:mm').format('HH:mm:ss'),
        dias: data.dias
      }

      let cont = 0;
      if (tarifarios && tarifarios.rows.length > 0) {
        let validateIntervalo = true;
          tarifarios.rows.forEach(item => {
            const { horaInicioMinutos2, horaFinMinutos2 } = util.convertirHoraStrMinutos2(item.hora_inicio, item.hora_fin);
            let diasChoque = [];
            // Los siguientes logs permiten la revision en consola de las condiciones que se cumplen al momento de registrar una orden publicitaria.
            // Que no se registre dentro de otro programa
            if ((horaInicioMinutos2 <= horaInicioMinutos && horaInicioMinutos <= horaFinMinutos2) && horaFinMinutos <= horaFinMinutos2) {
              console.log('*** if1 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if1 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0) {
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if1 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
            // Que no finalice dentro del horario de otro programa
            if ((horaInicioMinutos2 < horaFinMinutos && horaFinMinutos <= horaFinMinutos2) && horaInicioMinutos <= horaInicioMinutos2) {
              console.log('*** if2 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if2 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0) {
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if2 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
            // Que no empiece dentro del horario de otro programa
            if (horaInicioMinutos2 >= horaInicioMinutos && (horaInicioMinutos < horaFinMinutos2 && horaFinMinutos2 <= horaFinMinutos) && horaInicioMinutos > 0) {
              console.log('*** if3 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if3 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0){
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if3 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
            // Que no se solape sobre otro programa
            if (horaInicioMinutos < horaFinMinutos2 && (horaInicioMinutos2 <= horaFinMinutos && horaFinMinutos >= horaFinMinutos2)) {
              console.log('*** if4 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if4 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0){
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if4 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
            // Validacion para programas que exceden la media noche
            if((0 <= horaFinMinutos2 && horaFinMinutos2 < horaInicioMinutos2) && (horaInicioMinutos2 <= horaInicioMinutos) && (horaFinMinutos < horaInicioMinutos) && (0 <= horaFinMinutos && horaFinMinutos < 175)){
              console.log('*** if5 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if5 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0) {
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if5 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
            // Validacion para programas que exceden la media noche
            if((0 <= horaFinMinutos2 && horaFinMinutos2 < horaInicioMinutos2) && (horaInicioMinutos2 >= horaInicioMinutos) && (horaFinMinutos < horaInicioMinutos) && (0 <= horaFinMinutos && horaFinMinutos < 175)){
              console.log('*** if6 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if6 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0) {
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if6 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
            // Validacion para programas que exceden la media noche
            if((0 <= horaFinMinutos2 && horaFinMinutos2 < horaInicioMinutos2) && (horaInicioMinutos2 >= horaInicioMinutos) && (horaFinMinutos > horaInicioMinutos) && (horaFinMinutos < horaFinMinutos2 && horaFinMinutos < horaFinMinutos2)){
              console.log('*** if7 horaInicioMinutos2: ', horaInicioMinutos2, '[',item.hora_inicio,']', ' horaFinMinutos2: ',  horaFinMinutos2, '[',item.hora_fin,']',' dias: ', item.dias);
              console.log('*** if7 horaInicioMinutos: ', horaInicioMinutos, '[',programa.horaInicio,']', ' horaFinMinutos: ',  horaFinMinutos, '[',programa.horaFin,']', ' dias: ', programa.dias);
              diasChoque = item.dias.filter(function(val) {
                return programa.dias.indexOf(val) != -1;
              });
              if (diasChoque.length > 0) {
                cont += 1;
                validateIntervalo = false
              } else {
                validateIntervalo = true
              }
              console.log('*** if7 val: ', validateIntervalo,' choques: ', diasChoque, '\n');
              console.log('-----------------------------------------------------------------------------------------------------\n');
            }
          });
        if (!validateIntervalo || cont > 0) {
          return res.error(`Ya existe otro programa que usa la misma franja horario e intérvalo de días que el enviado.`);
        }
      }
      return res.success(data);
    } catch (e) {
      return res.error(e);
    } finally {

    }
  }

  async function crearTarifario (idMedio, idTipoMedio, data, user) {
    try {
      debug('Domain: Crear tarifario');
      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, true);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);

      const tarifarioCreate = {};

      if (!tipoMedioValidate || tipoMedioValidate.length === 0) {
        return res.error('El medio no es el tipo de medio indicado.');
      }

      const tarifarioValidate = await validarTarifarioPorTipoMedio(tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) { // Ya existe un tarifario activo, retorna error
        return res.error(tarifarioValidate.message);
      } else { // No existe tarifario activo
        if (tarifarioValidate && tarifarioValidate.data && tarifarioValidate.data.id) { // Pero sí uno pendiente, lo retornamos
          return res.success(tarifarioValidate.data);
        } else { // Lo creamos
          tarifarioCreate.id_tipo_medio = tipoMedioValidate[0].medioTiposMedio.id;
          tarifarioCreate._user_created = user.id;

          const tarifarioReturn = await tarifario.createOrUpdate(tarifarioCreate);

          return res.success(tarifarioReturn);
        }
      }
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarTarifarioPorTipoMedio (tipoMedio) {
    try {
      debug('Domain: Validando Tarifario por Tipo de Medio');
      // Obtenemos si existe algún tarifario por el tipo de medio del medio.
      const tarifarioValidate = await tarifario.findByTipoMedio(tipoMedio.medioTiposMedio.id);

      if (tarifarioValidate && tarifarioValidate.estado === 'ACTIVO') {
        return res.error(new Error(`Ya existe un tarifario para el tipo de medio ${tipoMedio.nombre}`));
      }

      // TODO: si se elimina el borrado de cascada activar esta validación
      // Obtenemos también los tarifarios que coincidan con la paramétrica del tipo medio enviado, si ya existe y no está INACTIVO retornamos un error.
      // const tarifarioParValidate = await tarifario.findByTipoMedioParametrica(tipoMedio.id);
      // if (tarifarioParValidate && (tarifarioParValidate.estado === 'ACTIVO' || tarifarioParValidate.estado === 'PENDIENTE')) {
      //   return res.error(new Error(`Ya existe creado un tarifario para el tipo de medio ${tipoMedio.nombre}`));
      // }
      return res.success(tarifarioValidate);
    } catch (e) {
      return res.error(e);
    }
  }

  async function validarTarifarioPorId (idTarifario, tipoMedio) {
    try {
      debug('Domain: Validando Tarifario por Tipo de Medio');
      const tarifarioValidate = await tarifario.findById(idTarifario);

      if (!tarifarioValidate) {
        return res.error('No existe el tarifario solicitado.');
      }

      if (tarifarioValidate.id_tipo_medio !== tipoMedio.medioTiposMedio.id) {
        return res.error(`El tarifario no corresponde al tipo de medio ${tipoMedio.nombre}`);
      }

      return res.success(tarifarioValidate);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerTarifario (idMedio, idTipoMedio, idTarifario, user) {
    try {
      debug('Domain: Obtener tarifario y sus detalles por tipo de medio');

      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, false);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);

      if (!tipoMedioValidate || tipoMedioValidate.length === 0) {
        return res.error('El medio no es el tipo de medio indicado.');
      }

      const tarifarioValidate = await validarTarifarioPorId(idTarifario, tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) {
        return res.error(tarifarioValidate.data);
      }

      const tarifarioReturn = Object.assign({}, tarifarioValidate.data);

      tarifarioReturn.detalles = tarifarioReturn.detalles ? tarifarioReturn.detalles.map(item => {
        return item;
      }) : [];

      if (tipoMedioValidate[0].id !== constantes.TIPO_MEDIO_PRENSA) {
        tarifarioReturn.matriz_detalles = await obtenerMatrizDetalles(idTarifario, tarifarioReturn.detalles);
      }

      return res.success(tarifarioReturn);
    } catch (e) {
      return res.error(e);
    }
  }

  async function obtenerMatrizDetalles (idTarifario, detalles) {
    let matrizDetalles = [1, 2, 3, 4, 5, 6, 7];
    const matrizBluePrint = await util.obtenermatrizBluePrint();

    matrizDetalles = matrizDetalles.map(item => {
      const programacion = [];

      detalles.map(itemDet => {
        const diaV = itemDet.dias.find(dia => dia === item);

        const encontrado = matrizBluePrint.find(itemV => itemV.horaInicio === itemDet.hora_inicio);

        const encontradoF = matrizBluePrint.find(itemV => itemV.horaInicio === itemDet.hora_fin);

        if (diaV) {
          let horasMinutos = encontradoF.index - encontrado.index;
          horasMinutos = horasMinutos > 0 ? horasMinutos : (288 - (Math.abs(horasMinutos)));

          let horaIndex = encontrado.index;

          for (var i = 1; i <= horasMinutos; i++) {
            programacion.push({
              primero: i === 1,
              horaIndex,
              costo: itemDet.costo,
              descripcion: itemDet.descripcion,
              horas: `${itemDet.hora_inicio.substring(0, 5)} - ${itemDet.hora_fin.substring(0, 5)}`,
              ultimo: i === horasMinutos,
              id: itemDet.id,
              hora: matrizBluePrint[horaIndex],
              tipo_costo: itemDet.tipo_costo
            });
            horaIndex = horaIndex === 288 ? 0 : (horaIndex + 1);
          }
        }
      });
      return {
        label: util.convertirIndexMes(item),
        index: item,
        programacion
      };
    });
    return matrizDetalles;
  }

  async function registrarTarifarioPorDefecto (idMedio, idTipoMedio, idTarifario, data, user) {
    try {
      
      const Medio = require('./Medio')(repositories, res);
      const medioValidate = await Medio.validarMedio(idMedio, user, true);

      const tipoMedioValidate = medioValidate.tipos_medio.filter(item => item.medioTiposMedio.id === idTipoMedio);
      const tarifarioValidate = await validarTarifarioPorId(idTarifario, tipoMedioValidate[0]);

      if (tarifarioValidate.code === -1) {
        return res.error(tarifarioValidate.data);
      }

      if (tarifarioValidate.data.estado === 'ACTIVO') {
        return res.error(`El tarifario ya ha sido enviado y no puede ser modificado.`);
      }

      const detalleValidate = tarifarioValidate.data.detalles.find(item => item.id_tarifario === idTarifario);

      if (detalleValidate) {
        return res.error(`El tarifario ya cuenta con una programación registrada, debe eliminar(las) para poder continuar.`);
      }

      // Recorremos las horas del dia para el registro
      for (var i = 8; i < 20; i++) {
        if (i < 10) {
          data.hora_inicio = '0' + i.toString() + ':00';
          if (i === 9) {
            data.hora_fin = (i + 1).toString() + ':00';
          } else {
            data.hora_fin = '0' + (i + 1).toString() + ':00';
          }
        }
        else {
          data.hora_inicio = i.toString() + ':00';
          data.hora_fin = (i + 1).toString() + ':00';
        }
        const detalleReturn = await crearTarifarioDetalle(idMedio, idTipoMedio, idTarifario, data, user);
      }
      
      return data;
    } catch (e) {
      return res.error(e);
    }
  }

  return {
    crearTarifario,
    crearTarifarioDetalle,
    modificarTarifarioDetalle,
    eliminarTarifarioDetalle,
    obtenerTarifarioDetalle,
    obtenerTarifario,
    registrarTarifarioPorDefecto
  };
};
