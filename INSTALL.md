# Instalación de la Aplicación Registro de Medios y Pauteo de Publicidad (BACKEND)


## Configuración del Servidor

Para una correcta instalación, el servidor debe tener las siguientes configuraciones obligatoriamente:

> [SERVER.md](SERVER.md)


Después recién llevar a cabo los siguientes pasos, que son necesarios para instalar la aplicación.

## Creación de la Base de Datos

Se debe crear la base de datos para la ejecución del backend, para ello conectarse con el siguiente comando:
```sh
$ psql -U postgres
```
Crear un usuario gestor de la base de datos y crear la base de datos:
```sh
postgres=# CREATE USER miusuario WITH PASSWORD 'Developer';
postgres=# CREATE DATABASE mibase WITH OWNER miusuario;
postgres=# grant all privileges on database mibase to miusuario;
```

## Intalación de postgis (Verificar si es necesario)

Se debe instalar postgis mediante uno de los siguiente comandos, dependiendo de la versión de postgres que tenga
```sh
$ sudo apt-get install postgis postgresql-9.6-postgis-2.3
```
o
```sh
$ sudo apt-get install postgis
```
Finalmente se debe reiniciar el servicio e importarlo a nuestra base de datos:
```sh
$ /etc/init.d/postgresql restart
$ sudo -u postgres psql -d pauteo_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```
## Instalación

### Se debe clonar el proyecto:

```sh
git clone https://gitlab.geo.gob.bo/ministerio-comunicacion/pauteo-backend
```
si se quiere https o ssh
```sh
git clone git@gitlab.geo.gob.bo:ministerio-comunicacion/pauteo-backend.git
```

En caso de que se obtenga un error del tipo **server certificate verification failed. CAfile: /etc/ssl/certs/ca-certificates.crt CRLfile: none**, lanzar el comando:
```sh
git config --global http.sslverify "false"
```
### Instalar el proyecto
Ingresar a la carpeta del proyecto:
```sh
$ cd pauteo-backend/
```
Posteriormente, ingresar a la carpeta common
```sh
$ cd common/
```
E instalar las dependencias:
```
$ npm install
```

Posteriormente, ingresara a la carpeta core e instalar dependencias:
```sh
$ cd ../core
$ npm install
```
Finalmente a la carpeta app e instalar dependencias:
```sh
$ cd ../app
$ npm install
```

## Archivos de Configuración

Dirigirse a las librerias common
Copiar el archivo db.js.sample
```sh
$ cd ../common/src/config/
$ cp db.js.sample db.js
```

Posteriormente, abrir el nuevo archivo creado utilizando un editor de preferencia.

Ahora, en el nuevo archivo *db.js* reemplazar los valores necesarios (username, password, database, host), por ejemplo:
```sh
    'username': 'postgres',
    'password': 'postgres_pass',
    'database': 'pauteo_db',
    'host': 'localhost',
```
Hacer lo mismo con el archivo de configuración de email
```sh
$ cp mail.js.sample mail.js
```

Ahora dirigirse a la carpeta  core e instalar la base de datos.
$ cd ../../../core/
```sh
$ npm run setup
```

Aceptar la consulta: "Realmente quiere destruir y crear de nuevo la base de datos del modulo usuario". Aceptar

## Iniciar la aplicación (modo desarrollo)

Dirigirse a la carpeta de la aplicaciòn:

$ cd ../app

$ npm run dev

## Iniciar la aplicación (modo test)

Dirigirse a la carpeta de la aplicaciòn:

$ cd ../app

$ npm run start-test

# PARA PRODUCCIÓN

Modificar el seeders core/src/infraestructura/seeders/0008-seeder-servicios-iop.js, para la configuración de los servicios de interoperabilidad
Actualizar la urL y token.
```
$ NODE_ENV=production npm run setup
```
Si no se modifico el seeders, se puede actualizar realizando una consula a la base de datos, de la siguiente manera:

```sql
update servicios_iop set url = 'https://ws.agetic.gob.bo/segip/v2/personas/', token = '' where id = 1;
update servicios_iop set url = 'https://ws.agetic.gob.bo/segip/v2/personas/contrastacion', token = '' where id = 2;
update servicios_iop set url = 'https://ws.agetic.gob.bo/fundempresa/v1/nit/', token = '' where id = 3;
update servicios_iop set url = 'https://ws.agetic.gob.bo/fundempresa/v2/', token = '' where id = 4;
update servicios_iop set url = 'https://ws.agetic.gob.bo/impuestos/v1/', token = '' where id = 5;
```

## Instalación de pm2

```sh
npm install -g pm2

```
En caso de tener problemas con los accesos de escritura de npm, leer:
 https://docs.npmjs.com/getting-started/fixing-npm-permissions

Dentro del directorio app/ lanzar:
```sh
pm2 start src/application/index.js --name "pauteo-backend"
```
