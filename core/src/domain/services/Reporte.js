'use strict';

const debug = require('debug')('pauteo:core:domain:reportes');
const fs = require('fs');
const util = require('../lib/util');
const funciones = require('../lib/funciones');
const moment = require('moment');

module.exports = function reporteService (repositories, res) {
  const { ordenPublicidad, campana, constantes, referencia, Parametro, personas } = repositories;
  const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  async function generarOrdenPublicitaria (idCampana, data, user) {
    debug('Domain: Generando órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, false);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const listaProgramas = await Campana.costoCampanaTV(idCampana, data, user);
      const campanaNombre = await campana.findById(listaProgramas.data[0].id_campana);
      const campanaMedioRpt = [];
      const campanaMedios = campanaValidate.data.medios;
      // const objReferencia = await referencia.findById(listaProgramas.data[0].id_referencia);
      // const sysPersona = await personas.findById(objReferencia.id_persona);

      for (let index = 0; index < campanaMedios.length; index++) {
        const item = campanaMedios[index];
        var itemCampanaMedio = await campana.findCampanaMedioById(item.campanaMedio.id);
        
        itemCampanaMedio = itemCampanaMedio.toJSON();
        const ordenes = await ordenPublicidad.findAll(item.campanaMedio.id);
        itemCampanaMedio.ordenes = ordenes;
        campanaMedioRpt.push(itemCampanaMedio);
      }

      var html = '';
      for (var i = 0; i < campanaMedioRpt.length; i++) {
        const idMedio = campanaMedioRpt[i].id_medio;
        var idCampanaMedio = campanaValidate.data.medios[i].campanaMedio.id;
        // var odptv = await ordenPublicidad.findAll(idCampanaMedio);
        var campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
        if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
          return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado ${idCampanaMedio}.`);
        }

        const campanaMedio = await campana.findCampanaMedioById(idCampanaMedio);

        let listaMedios = [];

        listaProgramas.data.map(programa => {
          listaMedios.push({
            id: programa.id_medio,
            medio: programa.razon_social,
            referencia: programa.id_referencia,
            duracion: listaProgramas.data[0].duracion,
            programas: [],
            tarifa_segundo: 0,
            frecuencia_dia: null,
            costo_pase: [],
            costo_paquete: [],
            costo_por_pase: 0,
            costo_total: 0,
            total_pases: []
          });
        });

        function removerDuplicados(keyFn, array) {
          var mySet = new Set();
          return array.filter(function(x) {
            var key = keyFn(x), isNew = !mySet.has(key);
            if (isNew) mySet.add(key);
            return isNew;
          });
        }

        const groupBy = key => array =>
          array.reduce((objectsByKeyValue, obj) => {
            const value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
          }, {});

        const agruparPorMedio = groupBy('idMedio');
        const agruparReferenciaPorMedio = groupBy('id');
        const agruparMedios = groupBy('id');

        const listaMediosUnicos = removerDuplicados(x => x.id, listaMedios);
        const referenciasUnicasAgrupadasPorMedio = agruparReferenciaPorMedio(listaMediosUnicos);
        const objReferencia = await referencia.findById(referenciasUnicasAgrupadasPorMedio[idMedio][0].referencia);
        const sysPersona = await personas.findById(objReferencia.id_persona);

        let programasUnicos = [];

        for (var k = 0; k < campanaMedios.length; k++) {
          for (var l = 0; l < listaProgramas.data.length; l++) {
            if (listaProgramas.data[l].id_medio === listaMediosUnicos[k].id) {
              programasUnicos.push({
                id: listaProgramas.data[l].id,
                idMedio: listaProgramas.data[l].id_medio,
                nombre: listaProgramas.data[l].nombre,
                horaInicio: listaProgramas.data[l].hora_inicio,
                horaFin: listaProgramas.data[l].hora_fin,
                pases: [],
                dias: [],
                nroPases: 0,
                tarifaSegundo: listaProgramas.data[l].costo,
                tipoCosto: listaProgramas.data[l].tipo_costo,
                duracion: listaProgramas.data[l].duracion,
                totalCosto: 0
              });
            }
          }
        }

        programasUnicos = removerDuplicados(x => x.id, programasUnicos);

        let mesCampana = moment(listaProgramas.data[0].fecha_inicio).month();
        let anhoCampana = moment(listaProgramas.data[0].fecha_inicio).year();
        
        let mes = mesCampana + 1;
        const length = funciones.diasMes(mes, anhoCampana);
        let arrProgramas = [];

        let diasMes2 = moment(moment(listaProgramas.data[0].fecha_inicio, 'YYYY-MM-DD').format('YYYY-MM'), 'YYYY-MM').daysInMonth();
        var numDiasMes = [];
        
        for(var t = 1; t <= diasMes2; t++){
          numDiasMes.push(t);
        }
        
        let totalLiquidoPagable = [];
        let totalPases = [];

        programasUnicos.forEach(programaA => {
          listaProgramas.data.forEach(programaB => {
            if (programaA.id === programaB.id) {
              programaA.dias.push({ dia: parseInt(moment(programaB.fecha_publicacion, 'YYYY-MM-DD').format('D')), cantidad: programaB.nro_pases });
              programaA.pases.push(programaB.nro_pases);
              programaA.nroPases += programaB.nro_pases;
            }
          });
          totalPases.push({ idMedio: programaA.idMedio ,total: programaA.nroPases });
          programaA.totalCosto = (programaA.duracion*(parseInt(programaA.tarifaSegundo, 10)))*programaA.nroPases;
          arrProgramas.push(programaA);
          totalLiquidoPagable.push({ idMedio: programaA.idMedio ,total: programaA.totalCosto });
        });

        const totalPasesAgrupadosPorMedio = agruparPorMedio(totalPases);
        const totalLiquidoPagableAgrupadosPorMedio = agruparPorMedio(totalLiquidoPagable);
        
        var sumTotalPasesAgrupadosPorMedio = totalPasesAgrupadosPorMedio[idMedio].reduce(function(prev, cur) {
          return prev + cur.total;
        }, 0);

        var sumTotalLiquidoPagableAgrupadosPorMedio = totalLiquidoPagableAgrupadosPorMedio[idMedio].reduce(function(prev, cur) {
          return prev + cur.total;
        }, 0);

        let arrTemporal = [];
        for (var p = 0; p < arrProgramas.length; p++) {
          let indiceArr = 0;
          arrTemporal.push({
            id: arrProgramas[p].id,
            idMedio: arrProgramas[p].idMedio,
            nombre: arrProgramas[p].nombre,
            horaInicio: moment(arrProgramas[p].horaInicio, 'HH:mm:ss').format('HH:mm'),
            horaFin: moment(arrProgramas[p].horaFin, 'HH:mm:ss').format('HH:mm'),
            pases: arrProgramas[p].pases,
            nroPases: arrProgramas[p].nroPases,
            tarifaSegundo: arrProgramas[p].tarifaSegundo,
            tipoCosto: arrProgramas[p].tipoCosto,
            duracion: arrProgramas[p].duracion,
            totalCosto: arrProgramas[p].totalCosto.toLocaleString(undefined, { minimumFractionDigits:2 }),
            dias: []
          });
          for (var q = 1; q <= numDiasMes.length; q++) {
            if (arrProgramas[p].dias[indiceArr].dia !== q) {
              arrTemporal[p].dias.push({
                dia: q,
                cantidad: ''
              });
            } else {
              arrTemporal[p].dias.push({
                dia: q,
                cantidad: arrProgramas[p].dias[indiceArr].cantidad
              });
              if (indiceArr < arrProgramas[p].dias.length - 1) {
                indiceArr++;
              }
            }
          }
        }

        const nombresMedio = agruparMedios(listaMediosUnicos);
        const arrTemporalAgrupadoPorMedio = agruparPorMedio(arrTemporal);
        let lonDiasMes = arrTemporal[0].dias.length;

        let arrDias = [];
        for (let k of Object.keys(arrTemporalAgrupadoPorMedio)){
          for (var p = 0; p < lonDiasMes; p++) {
            let concat = [];
            for (var q = 0; q < arrTemporalAgrupadoPorMedio[k].length; q++) {
              var clave = parseInt(k);
              if (clave === arrTemporalAgrupadoPorMedio[clave][q].idMedio) {
                concat.push(arrTemporalAgrupadoPorMedio[clave][q].dias[p].cantidad);
              }
            }
            arrDias.push({idMedio: k, concat: concat});
          }
        }

        const arrDiasAgrupadosPorMedio = agruparPorMedio(arrDias);
        let sumatoriaDias = [];
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        
        for (let k of Object.keys(arrDiasAgrupadosPorMedio)){
          for (var p = 0; p < arrDiasAgrupadosPorMedio[k].length; p++) {
            let sumatoria = 0;
            var clave = parseInt(k);
            for (var q = 0; q < arrDiasAgrupadosPorMedio[clave][p].concat.length; q++) {
              if (arrDiasAgrupadosPorMedio[clave][p].concat[q] !== '') {
                sumatoria += parseInt(arrDiasAgrupadosPorMedio[clave][p].concat[q]);
              }
            }
            sumatoriaDias.push({ idMedio: parseInt(k), cantidad: sumatoria });
          }
        }

        const sumatoriaDiasAgrupadosPorMedio = agruparPorMedio(sumatoriaDias);

        // Generando pdf
        // Datos detalle reporte
        // let nombreCanal = listaProgramas.data[0].razon_social;
        let correoElectronico = listaProgramas.data[0].email;
        let duracionSpot = listaProgramas.data[0].duracion;
        let fechaCampana = moment(listaProgramas.data[0].fecha_aprobacion, 'YYYY-MM-DD').format('DD/MM/YYYY');
        let coberturaCampana = listaProgramas.data[0].tipo_cobertura;

        if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_PRENSA) {
          if (i === 0) {
            // Tipo de medio Prensa
            const plantilla = 'src/template/ordenPublicitariaPrensa.html';
            const rutaBase = await Parametro.getParam('RUTA_SYSTEM');
            var cabecerahtml = "<!DOCTYPE html> <html lang='en'> <head> <meta charset='UTF-8'> <title>Orden Publicitaria de prensa</title> <link rel='stylesheet' type='text/css' href='http://localhost:3000/css/main.css'> </head> <body> <style> @media all { .page-break { display: none; } } @media print { .page-break { display: block; page-break-before: always; } } </style>";
            var piepaginahtml = "</body> </html>";
            var dataPlantilla = fs.readFileSync(`${rutaBase.valor}/${plantilla}`, 'utf8');
          };
          var data = {
            ordenes: campanaMedioRpt[i].ordenes,
            nombre_referencia: campanaMedio.referencia.persona.nombre_completo,
            celular_referencia: campanaMedio.referencia.celular,
            razon_social: campanaMedioValidate[0].razon_social,
            correlativo: '1',
            gestion: campanaValidate.data.gestion,
            fecha: campanaValidate.data.fecha_inicio,
            nombre_campana: campanaValidate.data.nombre,
            total: campanaMedioRpt[i].ordenes[0].costo
          }
        } else {
          // Tipo de medio Tv y Radio
          if (i === 0) {
            const plantilla = 'src/template/ordenPublicitariaTvRadio.html';
            const rutaBase = await Parametro.getParam('RUTA_SYSTEM');
            var cabecerahtml = "<!DOCTYPE html> <html lang='en'> <head> <meta charset='UTF-8'> <title>Orden Publicitaria de prensa</title> <link rel='stylesheet' type='text/css' href='http://localhost:3000/css/main.css'> </head> <body> <style> @media all { .page-break { display: none; } } @media print { .page-break { display: block; page-break-before: always; } } </style>";
            var piepaginahtml = "</body> </html>";
            var dataPlantilla = fs.readFileSync(`${rutaBase.valor}/${plantilla}`, 'utf8');
          };

          var sigla_campana;
          if (campanaValidate.data.tipo_campana.sigla === 'TV'){
            sigla_campana = 'ODPTV';
          } else if (campanaValidate.data.tipo_campana.sigla === 'Prensa') {
            sigla_campana = 'ODPP';
          } else {
            sigla_campana = 'ODPR';
          }

          var data = {
            medios: arrTemporalAgrupadoPorMedio[idMedio],
            sumatoriaDias: sumatoriaDiasAgrupadosPorMedio,
            titulo: `Orden publicitaria de ${campanaValidate.data.tipo_campana.nombre}`,
            
            orden: {
              canal: {
                nombre: nombresMedio[idMedio][0].medio
              },
              encargado: {
                nombre: sysPersona.nombre_completo,
                celular: sysPersona.movil
              },
              correos: [
                { correo: objReferencia.email }
              ],
              campana: campanaNombre.nombre,
              spot: campanaNombre.descripcion,
              duracion: {
                tiempo: duracionSpot,
                tipo: 'SEG'
              },
              fecha: fechaCampana,
              cobertura: coberturaCampana,
              // odp: {
              //   tipo: 'ODPTV',
              //   numero: odptv[0].nro_orden
              // }
            },
            detalle: {
              mes: meses[mes - 1],
              gestion: anhoCampana,
              observaciones: campanaMedioValidate[0].campanaMedio.observacion ? campanaMedioValidate[0].campanaMedio.observacion : "Sin observaciones",
              correlativo: campanaValidate.data.inicio_correlativo,
              // od: 'ODP'+campanaValidate.data.tipo_campana.sigla,
              odp: sigla_campana,
              dias: funciones.getDias(mes, anhoCampana, length),
              sumatoriaDias: sumatoriaDiasAgrupadosPorMedio[idMedio], // pie de tabla
              totalPases: sumTotalPasesAgrupadosPorMedio,
              totalLiquidoPagable: sumTotalLiquidoPagableAgrupadosPorMedio.toLocaleString(undefined, { minimumFractionDigits: 2 }),
              items: [
                {
                  cantidad: sumatoriaDiasAgrupadosPorMedio[idMedio]
                }
              ]
            }
          };

          let tipos = {
            'LUN-VIE': 0,
            'SABADO': 0,
            'DOMINGO': 0
          };

          let total = [];

          let totalPases2 = 0;
          data.detalle.items.map(item => {
            tipos[item.tipo]++;
            item.dias = funciones.setDias(item.dias, length);
            total = funciones.totales(item.dias, total);
            totalPases2 += item.pases;
            return item;
          });

          let tipo = '';
          data.detalle.items.map(item => {
            if (item.tipo !== tipo) {
              tipo = item.tipo;
              item.rowspan = tipos[tipo];
            }
            funciones.setClass(item.dias, total);
            return item;
          });
          data.tipos = tipos;
          data.total = {
            items: total,
            pases: totalPases2
          };
        }
        // const html = await util.generarPlantilla(dataPlantilla, data);
        // Conformamos el reporte en caso de ser acumulado
        var html = html + await util.generarPlantilla(dataPlantilla, data);
      }
      var html = cabecerahtml + html + piepaginahtml;
      const r = await util.generatePdfFormato(html, 'landscape');
      return res.success(r);
    } catch (error) {
      return res.error(error);
    }
  }

  async function generarResumenVisual (idCampana, data2, user) {
    debug('Domain: Generando Resumen Visual');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, false);
      const arrProgramas = await Campana.costoCampanaTV(idCampana, data2, user);
      let listaMedios = [];
      arrProgramas.data.map(programa => {
        listaMedios.push({
          id: programa.id_medio,
          nro_proceso: null,
          medio: programa.razon_social,
          duracion: arrProgramas.data[0].duracion,
          programas: [],
          tarifa_segundo: [],
          frecuencia_dia: null,
          costo_pase: [],
          costo_paquete: [],
          costo_por_pase: 0,
          costo_total: 0,
          total_pases: []
        });
      });

      function removerDuplicados(keyFn, array) {
        var mySet = new Set();
        return array.filter(function(x) {
          var key = keyFn(x), isNew = !mySet.has(key);
          if (isNew) mySet.add(key);
          return isNew;
        });
      }

      const arrMedios = removerDuplicados(x => x.id, listaMedios);

      let arrProgramasData = arrProgramas.data;
      let arrMedios2 = arrMedios;

      for (var k = 0; k < arrMedios.length; k++) {
        for (var l = 0; l < arrProgramasData.length; l++) {
          if (arrMedios[k].id === arrProgramasData[l].id_medio) {
            arrMedios2[k].programas.push({
              id: arrProgramasData[l].nombre+'-'+arrProgramasData[l].hora_inicio,
              nombre: arrProgramasData[l].nombre,
              horaInicio: arrProgramasData[l].hora_inicio,
              tarifaSegundo: arrProgramasData[l].costo,
              tipoCosto: arrProgramasData[l].tipo_costo
            });
            arrMedios2[k].programas = removerDuplicados(x => x.id, arrMedios2[k].programas); // borra duplicados
          }
        }
      }

      for (var i = 0; i < arrMedios2.length; i++) {
        let costoCampana = 0;
        let costoPases = 0;

        let nroPasesPrograma = 0;
        let frecuencia = [];
        let tarifaSegundo = [];
        let arrCostoPase = [];
        let costoPorPrograma = 0;
        let costoPorMedio = 0;
        let arrTotalPases = [];

        let costoPase = 0;
        let costoPaquete = 0;
        // Sacar los programas que no sean con tarifario segundo
        for (var k = 0; k < arrMedios2[i].programas.length; k++) {
          for (var j = 0; j < arrProgramasData.length; j++) {
            if (arrMedios2[i].id === arrProgramasData[j].id_medio) {
              arrMedios2[i].nro_proceso = arrProgramasData[j].nro_orden;
              let idPrograma = arrProgramasData[j].nombre + '-' + arrProgramasData[j].hora_inicio;
              if (arrProgramasData[j].tipo_costo === 'SEGUNDO') {
                if (arrMedios2[i].programas[k].id === idPrograma) {
                  let costo = 0;
                  costo += arrMedios2[i].duracion * parseInt(arrProgramasData[j].costo) * arrProgramasData[j].nro_pases;
                  costoCampana += costo;
                  nroPasesPrograma += arrProgramasData[j].nro_pases;
                  frecuencia.push(arrProgramasData[j].nro_pases);
                  tarifaSegundo.push(parseInt(arrMedios2[i].programas[k].tarifaSegundo, 10));
                  frecuencia = [...new Set(frecuencia)];
                  tarifaSegundo = [...new Set(tarifaSegundo)];
                }
              } else if (arrProgramasData[j].tipo_costo === 'PASE') {
                if (arrMedios2[i].programas[k].id === idPrograma) {
                  let costo2 = 0;
                  nroPasesPrograma += arrProgramasData[j].nro_pases;
                  costo2 += parseInt(arrProgramasData[j].costo) * arrProgramasData[j].nro_pases;
                  costoPases += costo2;
                  frecuencia.push(arrProgramasData[j].nro_pases);
                  frecuencia = [...new Set(frecuencia)];
                  costoPase = parseInt(arrProgramasData[j].costo, 10);
                  arrCostoPase.push(parseInt(arrMedios2[i].programas[k].tarifaSegundo, 10));
                  arrCostoPase = [...new Set(arrCostoPase)];
                }
              } else if (arrProgramasData[j].tipo_costo === 'PAQUETE') {
                if (arrMedios2[i].programas[k].id === idPrograma) {
                  costoPaquete = parseInt(arrProgramasData[j].costo, 10);
                }
              }
            }
          }
        }
        arrTotalPases.push(tarifaSegundo);
        costoPorMedio += costoPorPrograma;

        arrMedios2[i].costo_total = costoCampana+costoPases+costoPaquete;
        arrMedios2[i].costo_total_formateado = (costoCampana+costoPases+costoPaquete).toLocaleString(undefined, {minimumFractionDigits: 2});
        arrMedios2[i].total_pases = nroPasesPrograma;
        arrMedios2[i].costo_pase = costoPase;
        arrMedios2[i].costo_paquete = costoPaquete;
        arrMedios2[i].frecuencia_dia = frecuencia.join(' - ');
        arrMedios2[i].tarifa_segundo = tarifaSegundo.join(' - ');
        arrMedios2[i].costo_por_pase = arrCostoPase.join(' - ');
      }

      let costoTotalCampana = { total: 0 };
      arrMedios2.map(arr => {
        costoTotalCampana.total += arr.costo_total;
      });

      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const idCampanaMedio = campanaValidate.data.medios[0].campanaMedio.id;
      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado ${idCampanaMedio}.`);
      }

      const campanaMedioRpt = [];
      const campanaMedios = campanaValidate.data.medios;
      var cantidad = 0;
      var cantidadT = 0;
      var cantidadTxt = null;
      var precio = 0;
      var costo = 0;
      var total = 0;
      var unidad = 0;
      var unidadTxt = null;
      var tipoCosto = null;

      for (let index = 0; index < campanaMedios.length; index++) {
        const item = campanaMedios[index];
        let itemCampanaMedio = await campana.findCampanaMedioById(item.campanaMedio.id);
        itemCampanaMedio = itemCampanaMedio.toJSON();
        const ordenes = await ordenPublicidad.findAll(item.campanaMedio.id);
        if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_PRENSA) {
          // SE REALIZAN LOS CALCULOS PARA PRENSA
          costo = Number(ordenes[0].costo);
          precio = costo;
          total = total + precio;
          cantidadTxt = '1 PÁGINAS';
          unidadTxt = 'ARTE';
        } else {
          // SE REALIZAN LOS CALCULOS PARA TV Y RADIO
          cantidad = 0;
          cantidadT = 0;
          unidad = campanaValidate.data.duracion;
          precio = 0;
          for (let i = 0; i < ordenes.length; i++) {
            costo = Number(ordenes[i].costo);
            cantidad = Number(ordenes[i].nro_pases);
            tipoCosto = ordenes[i].tipo_costo;
            if (tipoCosto === 'PASE') {
              precio = precio + cantidad * costo;
            } else if(tipoCosto === 'SEGUNDO') {
              precio = precio + unidad * cantidad * costo;
            } else {
              precio = precio + costo;
            }
            cantidadT = cantidadT + cantidad;
          }
          total = total + precio;
          unidadTxt = unidad + ' SEG';
          cantidadTxt = cantidadT + ' PASES';
        }
        itemCampanaMedio.razon_social = item.razon_social;
        itemCampanaMedio.unidad = unidadTxt;
        itemCampanaMedio.nro_pases = cantidadTxt;
        itemCampanaMedio.costo = costo;
        itemCampanaMedio.precio = precio;
        // itemCampanaMedio.precio = precio.toLocaleString(undefined, { minimumFractionDigits: 2 });
        campanaMedioRpt.push(itemCampanaMedio);
      }
      const modalidad = { cont_directa: true };
      const formaadj = { items: true };
      const metodo = { no_aplica: true };

      // Generando pdf
      const plantilla = 'src/template/resumenVisual.html';
      const rutaBase = await Parametro.getParam('RUTA_SYSTEM');
      const dataPlantilla = fs.readFileSync(`${rutaBase.valor}/${plantilla}`, 'utf8');

      const campanaDatos = campanaValidate.data;
      let diasCampana = moment(campanaDatos.fecha_fin).diff(moment(campanaDatos.fecha_inicio), 'days');

      var sigla_campana;
      if (campanaValidate.data.tipo_campana.sigla === 'TV'){
        sigla_campana = 'PTV';
      } else {
        sigla_campana = 'PR';
      }

      const data = {
        // unidad_solicitante: 'DIRECCIÓN GENERAL DE ESTRATEGIAS / UNIDAD DE DIFUSIÓN',
        unidad_solicitante: `Resumen Visual de ${campanaValidate.data.tipo_campana.nombre}`,
        campanaMedios: campanaMedioRpt,
        razon_social: campanaMedioValidate[0].razon_social,
        fecha_inicio: moment(campanaDatos.fecha_inicio, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        fecha_fin: moment(campanaDatos.fecha_fin, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        dias_campana: diasCampana,
        duracion_spot: campanaDatos.duracion,
        correlativo: campanaValidate.data.visual_correlativo,
        sigla: sigla_campana,
        total: total,
        cite: campanaValidate.data.cite,
        gestion: campanaValidate.data.gestion,
        fecha: moment().format('DD/MM/YYYY'),
        nombre_camapana: campanaValidate.data.nombre,
        medios: arrMedios,
        costo_total: costoTotalCampana.total.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        modalidad,
        formaadj,
        metodo
      };

      const html = await util.generarPlantilla(dataPlantilla, data);
      const r = await util.generatePdf(html);
      return res.success(r);
    } catch (error) {
      return res.error(error);
    }
    // try {
    //   const Campana = require('./Campana')(repositories, res);
    //   const campanaValidate = await Campana.validarCampana(idCampana, user, false);
    //   if (campanaValidate.code === -1) {
    //     return res.error(campanaValidate.data);
    //   }

    //   // Generando pdf
    //   const plantilla = 'src/template/resumenVisual.html';
    //   const rutaBase = await Parametro.getParam('RUTA_SYSTEM');
    //   const dataPlantilla = fs.readFileSync(`${rutaBase.valor}/${plantilla}`, 'utf8');

    //   console.log('CAMPAÑAS:', campanaValidate.data.medios);
    //   const data = {
    //     campanaMedios: campanaValidate,
    //     medios: campanaValidate.data.medios,
    //     correlativo: '1',
    //     tipo: 'TELEVISIÓN',
    //     gestion: campanaValidate.data.gestion,
    //     fecha: moment().format('DD/MM/YYYY'),
    //     nombre_camapana: campanaValidate.data.nombre,
    //     fecha_inicio: campanaValidate.data.fecha_inicio,
    //     fecha_fin: campanaValidate.data.fecha_fin,
    //     dias: '7 días'
    //   };

    //   const html = await util.generarPlantilla(dataPlantilla, data);
    //   const r = await util.generatePdfFormato(html, 'landscape');
    //   return res.success(r);
    // } catch (error) {
    //   return res.error(error);
    // }
  }

  async function generarFormularioSC (idCampana, data, user) {
    debug('Domain: Generando Formulario de Solicitud de Contratación');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, false);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const idCampanaMedio = campanaValidate.data.medios[0].campanaMedio.id;
      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado ${idCampanaMedio}.`);
      }

      const campanaMedioRpt = [];
      const campanaMedios = campanaValidate.data.medios;
      var cantidad = 0;
      var cantidadT = 0;
      var cantidadTxt = null;
      var precio = 0;
      var costo = 0;
      var total = 0;
      var unidad = 0;
      var unidadTxt = null;
      var tipoCosto = null;

      for (let index = 0; index < campanaMedios.length; index++) {
        const item = campanaMedios[index];
        let itemCampanaMedio = await campana.findCampanaMedioById(item.campanaMedio.id);
        itemCampanaMedio = itemCampanaMedio.toJSON();
        const ordenes = await ordenPublicidad.findAll(item.campanaMedio.id);
        if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_PRENSA){
          //SE REALIZAN LOS CALCULOS PARA PRENSA
          costo = Number(ordenes[0].costo);
          precio = costo;
          total = total + precio;
          cantidadTxt = '1 PÁGINAS';
          unidadTxt = 'ARTE';
        } else {
          //SE REALIZAN LOS CALCULOS PARA TV Y RADIO
          cantidad = 0;
          cantidadT = 0;
          unidad = campanaValidate.data.duracion;
          precio = 0;
          for (let i = 0; i < ordenes.length; i++) {
            costo = Number(ordenes[i].costo);
            cantidad = Number(ordenes[i].nro_pases);
            tipoCosto = ordenes[i].tipo_costo;
            if (tipoCosto === 'PASE') {
              precio = precio + cantidad * costo;
            } else if(tipoCosto === 'SEGUNDO') {
              precio = precio + unidad * cantidad * costo;
            } else {
              precio = precio + costo;
            }
            cantidadT = cantidadT + cantidad;
          }

          total = total + precio;
          unidadTxt = unidad + ' SEG';
          cantidadTxt = cantidadT + ' PASES';
        }
        itemCampanaMedio.razon_social = item.razon_social;
        itemCampanaMedio.unidad = unidadTxt;
        itemCampanaMedio.nro_pases = cantidadTxt;
        itemCampanaMedio.costo = costo;
        itemCampanaMedio.precio = precio.toLocaleString(undefined, { minimumFractionDigits: 2 });
        campanaMedioRpt.push(itemCampanaMedio);
      }

      const modalidad = { cont_directa: true };
      // const formaadj = { items: true };
      const metodo = { no_aplica: true };

      var formaadj = {};
      if (campanaMedios.length > 1){
        formaadj = { 
          total: false,
          items: true 
        };
      } else {
        formaadj = { 
          total: true,
          items: false
        };
      }

      // Generando pdf
      const plantilla = 'src/template/formularioSC.html';
      const rutaBase = await Parametro.getParam('RUTA_SYSTEM');
      const dataPlantilla = fs.readFileSync(`${rutaBase.valor}/${plantilla}`, 'utf8');

      const data = {
        unidad_solicitante: 'DIRECCIÓN GENERAL DE ESTRATEGIAS / UNIDAD DE DIFUSIÓN',
        campanaMedios: campanaMedioRpt,
        razon_social: campanaMedioValidate[0].razon_social,
        correlativo: '1',
        total: total.toLocaleString(undefined, { minimumFractionDigits: 2}),
        cite: campanaValidate.data.cite,
        gestion: campanaValidate.data.gestion,
        fecha: moment().format('DD/MM/YYYY'),
        nombre_camapana: campanaValidate.data.nombre,
        modalidad,
        formaadj,
        metodo
      };

      const html = await util.generarPlantilla(dataPlantilla, data);
      const r = await util.generatePdf(html);
      return res.success(r);
    } catch (error) {
      return res.error(error);
    }
  }

  async function modificarOrdenPublicidad (idCampana, idCampanaMedio, idOrden, data, user) {
    debug('Domain: Modificando órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      const ordenValidate = await ordenPublicidad.findById(idOrden);
      if (!ordenValidate) {
        return res.error(`No existe la orden de publicidad solicitada.`);
      }

      let ordenReturn = null;
      if (campanaValidate.data.id_tipo_campana === constantes.TIPO_MEDIO_PRENSA) {
        const ordenUpd = Object.assign({}, data);
        ordenUpd.id = ordenValidate.id;
        ordenUpd._user_updated = user.id;
        ordenReturn = await ordenPublicidad.createOrUpdate(ordenUpd);
      } else {
        return res.error(`No hay soporte para modificar órdenes de campañas que no sean PRENSA`);
        /* const ordenes = data.ordenes;
        ordenes.forEach(item => {
          item._user_created = user.id;
          item.id_campana_medio = idCampanaMedio;
        });
        ordenReturn = await ordenPublicidad.bulkCreate(ordenes); */
      }
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  async function eliminarOrdenPublicidad (idCampana, idCampanaMedio, idOrden, user) {
    debug('Domain: Eliminando órdenes de publicidad');
    try {
      const Campana = require('./Campana')(repositories, res);
      const campanaValidate = await Campana.validarCampana(idCampana, user, true);
      if (campanaValidate.code === -1) {
        return res.error(campanaValidate.data);
      }

      const campanaMedioValidate = campanaValidate.data.medios.filter(item => item.campanaMedio.id === idCampanaMedio);
      if (!campanaMedioValidate || campanaMedioValidate.length === 0) {
        return res.error(`La campañana ${campanaValidate.data.nombre} no está relacionada con el medio enviado.`);
      }

      const ordenValidate = await ordenPublicidad.findById(idOrden);
      if (!ordenValidate) {
        return res.error(`No existe la orden de publicidad solicitada.`);
      }

      let ordenReturn = null;
      ordenReturn = await ordenPublicidad.deleteItem(idOrden);
      return res.success(ordenReturn);
    } catch (error) {
      return res.error(error);
    }
  }

  return {
    generarOrdenPublicitaria,
    generarResumenVisual,
    generarFormularioSC,
    modificarOrdenPublicidad,
    eliminarOrdenPublicidad
  };
};
