# Módulo de usuarios, módulos y permisos

Este módulo contiene los siguientes modelos:

- Entidades
- Usuarios
- Personas
- Roles
- Módulos
- Permisos

También ya se integra los siguientes módulos con sus respectivos seeders

- Logs del sistema
- Parámetros del sistema
- Servicios de Interoperabilidad

## Requisitos
- Nodejs 7.6 en adelante

## Dependencias
Este módulo requiere el módulo common https://gitlab.geo.gob.bo/base/common donde se encuentra la configuración de base de datos entre otras cosas

## Modo de uso

``` bash
# Instalando librería
npm install file:../base-usuarios
```

Instanciando el módulo params en un proyecto
``` js
const Usuarios = require('base-usuarios');

// Cargando módulo de usuarios que tiene servicios(services), api, graphql y sus modelos(_models)
const services = await Usuarios(config.db).catch(err => console.error(err));

```

### Nota.- Este módulo no funciona por si mismo, debe ser importado en otra aplicación que implemente una instancia de ExpressJS, se puede usar https://gitlab.geo.gob.bo/base/base-app como base para implementar la instancia ExpressJS.

## Instalando Node.js v8.x para el modo desarrollo

NOTA.- Debian Wheezy no soporta Node 8

``` bash
# Para Ubuntu
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# Para Debian, instalar como root
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get install -y nodejs
```

## Instalando el proyecto

Siga los siguientes pasos:

``` bash
# 1. Instalar dependencias
npm install

# 2. Crear una base de datos en postgres y configurar la conexión en el módulo common instalado fuera del proyecto en  [Ruta del proyecto]/common/src/config/db.js (Este archivo se obtiene copiando el archivo db.js.sample)

# 3. Ejecutar lo siguiente para crear las tablas, seeders y tests unitarios de las 3 capas del DDD, esto eliminará las tablas y los datos de estas para reescribirlos
npm test

```
