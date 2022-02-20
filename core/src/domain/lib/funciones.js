'use strict';

const dias = ['D', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];

function totales (items, total) {
  if (total.length === 0) {
    let array = [];
    for (let i in items) {
      array.push({
        dia: items[i].dia,
        cantidad: items[i].cantidad ? items[i].cantidad : 0
      });
    }
    total = array;
  } else {
    for (let i in total) {
      total[i].cantidad += items[i].cantidad ? parseInt(items[i].cantidad) : 0;
    }
  }
  return total;
}

function getDias(mes, gestion, length) {
  let meses = [];
  for (let i = 0; i < length; i++) {
    let date = new Date(gestion, mes - 1, i + 1);
    meses.push({
      dia: i + 1,
      literal: dias[date.getDay()]
    });
  }
  return meses;
}

function setDias(items, length) {
  let array = [];
  for (let i = 0; i < length; i++) {
    array.push({
      dia: i + 1,
      cantidad: obtenerCantidad(i + 1, items)
    });
  }
  return array;
}

function setClass(items, total) {
  for (let i in total) {
    items[i].class = total[i].cantidad ? 'gray' : ''
  }
}

function obtenerCantidad(dia, items) {
  for (let i in items) {
    if (items[i].dia === dia) {
      return items[i].cantidad;
    }
  }
  return '';
}

function diasMes (month, year) {
  return new Date(year, month, 0).getDate();
}

module.exports = {
  totales,
  getDias,
  setDias,
  setClass,
  obtenerCantidad,
  diasMes
};