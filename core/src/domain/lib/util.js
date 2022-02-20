'use strict';

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
// const pdf = require('html-pdf');
const Response = require('./response');
const { array, mail } = require('common');

let res;

/**
 * Cargando los repositorios en la carpeta especificada
 *
 * @param {string} PATH: Path del directorio de donde se cargará los modelos del sistema
 * @param {object} models: Objeto con todos los modelos de la bd
 * @param {object} res: objeto con respuestas predeterminadas
 * @param {object} opts: Json de configuración
 */
function loadServices (PATH, repositories, opts = {}, logs) {
  if (!res) {
    res = Response(logs);
  }
  let files = fs.readdirSync(PATH);
  let services = {};

  if (opts.exclude) {
    array.removeAll(opts.exclude, files);
  }

  files.forEach(function (file) {
    let pathFile = path.join(PATH, file);
    if (fs.statSync(pathFile).isDirectory()) {
      services[file] = loadServices(pathFile, repositories, opts, logs);
    } else {
      file = file.replace('.js', '');
      services[file] = require(pathFile)(repositories, res);
    }
  });

  return services;
}

function createDirectoryIfNotExists (PATH) {
  try {
    if (!fs.existsSync(PATH)) {
      fs.mkdirSync(PATH);
    }
  } catch (e) {
    throw new Error(e.message);
  }
}

function createMedioDirectory (PATH_BASE, PATH, idMedio) {
  try {
    if (!fs.existsSync(PATH_BASE)) {
      throw new Error(`No se encuentra la ruta ${PATH_BASE} en su directorio.`);
    }
    createDirectoryIfNotExists(PATH);
    const directorioMedio = `${PATH}/${idMedio}`;
    createDirectoryIfNotExists(directorioMedio);
    return directorioMedio;
  } catch (e) {
    throw e;
  }
}

function base64Encode (file) {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString('base64');
}

async function obtenermatrizBluePrint () {
  const nroFilas = 288;
  const matrizBluePrint = [];
  const fakeData = new Date(new Date().getYear(), new Date().getMonth(), new Date().getDay(), 5, 0, 0);
  for (var fila = 1; fila <= nroFilas; fila++) {
    let horas = fakeData.getHours();
    let minutos = fakeData.getMinutes();
    let horasShow = horas >= 10 ? horas : `0${horas}`;
    let minutosShow = minutos >= 10 ? minutos : `0${minutos}`;
    matrizBluePrint.push({
      index: fila,
      horaInicio: `${horasShow}:${minutosShow}:00`
    });
    fakeData.setMinutes(fakeData.getMinutes() + 5);
  }
  return matrizBluePrint;
}

function convertirHoraStrMinutos (horaInicio, horaFin) {
  const horaInicioDesglosado = horaInicio.split(':');
  const horaFinDesglosado = horaFin.split(':');

  let horaInicioMinutos = +horaInicioDesglosado[0] * 60 + (+horaInicioDesglosado[1]);
  if (horaInicioMinutos >= 0 && horaInicioMinutos <= 295) { // si esta entre 00:00 a 04:55
    horaInicioMinutos = horaInicioMinutos + 1440; // adicionamos 24 horas
  }

  let horaFinMinutos = +horaFinDesglosado[0] * 60 + (+horaFinDesglosado[1]);
  if (horaFinMinutos >= 0 && horaFinMinutos <= 295) { // si esta entre 00:00 a 04:55
    horaFinMinutos = horaFinMinutos + 1440; // adicionamos 24 horas
  }

  return {
    horaInicioMinutos,
    horaFinMinutos
  };
}

function convertirHoraStrMinutosOld (horaInicio, horaFin) {
  const horaInicioDesglosado = horaInicio.split(':');

  const horaFinDesglosado = horaFin.split(':');

  const horaInicioMinutos = +horaInicioDesglosado[0] * 60 + (+horaInicioDesglosado[1]);

  const horaFinMinutos = +horaFinDesglosado[0] * 60 + (+horaFinDesglosado[1]);

  return {
    horaInicioMinutos,
    horaFinMinutos
  };
}

function convertirHoraStrMinutos2 (horaInicio, horaFin) {
  const horaInicioDesglosado = horaInicio.split(':');

  const horaFinDesglosado = horaFin.split(':');

  const horaInicioMinutos2 = +horaInicioDesglosado[0] * 60 + (+horaInicioDesglosado[1]);

  const horaFinMinutos2 = +horaFinDesglosado[0] * 60 + (+horaFinDesglosado[1]);

  return {
    horaInicioMinutos2,
    horaFinMinutos2
  };
}

function convertirIndexMes (index) {
  if (index === 1) {
    return 'Lunes';
  } else if (index === 2) {
    return 'Martes';
  } else if (index === 3) {
    return 'Miércoles';
  } else if (index === 4) {
    return 'Jueves';
  } else if (index === 5) {
    return 'Viernes';
  } else if (index === 6) {
    return 'Sábado';
  } else if (index === 7) {
    return 'Domingo';
  }
}

function obtenerMes (index) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[index];
}

/**
 * Función para envio de correos
 */
async function sendMail (plantilla, peticion, data, res) {
  try {
    const template = handlebars.compile(plantilla.contenido);
    peticion.html = template(data);
    await mail.enviar(peticion);
  } catch (error) {
    res.error(error);
  }
}

async function generarPlantilla (plantillaOrigen, data) {
  handlebars.registerHelper('inc', function (value, options) {
    return parseInt(value) + 1;
  });

  const template = handlebars.compile(plantillaOrigen);
  return template(data);
}

function generatePdf (html) {
  return new Promise((resolve, reject) => {
    const pdf = require('html-pdf');
    const options = { format: 'Letter', orientation: "portrait" };
    pdf.create(html, options).toBuffer(function (err, buffer) {
      if (err) {
        reject(err);
      }
      console.log('This is a buffer:', Buffer.isBuffer(buffer));
      const base64 = Buffer.from(buffer).toString('base64');
      // console.log('This is a buffer:', base64);
      resolve(base64);
    });
  });
}

function generatePdfFormato (html, formato) {
  return new Promise((resolve, reject) => {
    const pdf = require('html-pdf');
    const options = { format: 'Letter', orientation: formato };
    pdf.create(html, options).toBuffer(function (err, buffer) {
      if (err) {
        reject(err);
      }
      console.log('This is a buffer:', Buffer.isBuffer(buffer));
      const base64 = Buffer.from(buffer).toString('base64');
      // console.log('This is a buffer:', base64);
      resolve(base64);
    });
  });
}

module.exports = {
  loadServices,
  createMedioDirectory,
  base64Encode,
  obtenermatrizBluePrint,
  convertirHoraStrMinutos,
  convertirHoraStrMinutos2,
  convertirIndexMes,
  sendMail,
  obtenerMes,
  generarPlantilla,
  generatePdf,
  generatePdfFormato
};
