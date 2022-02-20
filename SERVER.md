# Instalación General en el Registro de Medios y Pauteo de Publicidad (BACKEND)

Se realizaron distintas instalaciones en el servidor de TEST Debian, a continuación las configuraciones realizadas.

## Dependencias necesarias

Instalar dependencias necesarias para el entorno
```sh
$ sudo apt-get update
$ sudo apt-get install libssl-dev curl wget unzip libfontconfig1 apt-transport-https ca-certificates
```

Instalar git:
```sh
$ sudo apt-get update
$ sudo apt-get install git-core
```
Es posible configurar los nombres de usuarios:
```sh
$ git config --global user.name "usuario"
$ git config --global user.email usuario@agetic.gob.bo
$ git config --list

```

El último comando es para verificar que se haya guardado la configuración realizada.

##### Generar SSH key
Si aún no se cuenta con una llave SSH para la conexión a GIT, seguir los siguientes pasos:
Para la generación de la llava SSH se siguieron los pasos del siguiente enlace:
> https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/

```sh
$ ssh-keygen -t rsa -b 4096 -C "usuario@agetic.gob.bo"
```

Para verificar la creación de la llave SSH navegar al siguiente directorio:
```sh
$ cd /home/nombre_usuario/.ssh/
```

La llave se encontrará en el archivo `id_rsa.pub`;

Copiar el contenido del archivo en la respectiva cuenta del GITLAB para la autenticación.

> **Profile Settings** >> **SSH Keys**


## Postgres

### Agregando PostgreSQL APT Repository

Para agregar el repositorio, primero crear el archivo:
```sh
/etc/apt/sources.list.d/pgdg.list
```
En este archivo, agregar una linea para el repositorio, como se muestra a continuación:

```
deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main
```
Luego importar la clave firmada del repositorio y actualizar la lista de paquetes del sistema:

```sh
$ wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
$ sudo apt-get update
```

Como se indica se ejecutaron los siguientes comandos:
```sh
$ sudo sudo apt install postgresql-9.6
$ ps -ef | grep postgres
```
El último comando sólo es par comprobar la instalación.

##### Problemas en la Autenticación
Fuente:
> http://stackoverflow.com/questions/7695962/postgresql-password-authentication-failed-for-user-postgres

Al conectar con postgres, es posible que dispare el siguiente error:
```sh
$ psql -U postgres
Postgresql: password authentication failed for user “postgres”
ó
psql: FATAL:  la autentificación Peer falló para el usuario «postgres»
```
Si esto es así, se debe verificar los datos del siguiente archivo:
```sh
$ cd /etc/postgresql/9.6/main/
$ sudo nano pg_hba.conf
```
Como indica el enlace, la primera línea no comentada debería estar en peer o ident, en caso de que no sea así cambiarlo a estos valores, luego reiniciar el servicio:
```sh
$ sudo /etc/init.d/postgresql restart
```
Posteriormente, se procede a cambiar los datos del usuario postgres:
```sh
$ sudo -u postgres psql template1
$ ALTER USER postgres PASSWORD 'suContrasenia';
```
Después, volver al archivo de configuración de postgres y cambiar peer por md5:
```sh
$ cd /etc/postgresql/9.4/main/
$ sudo nano pg_hba.conf
```
Ejemplo:
```sh
> # DO NOT DISABLE!
> # If you change this first entry you will need to make sure that the
# database superuser can access the database using some other method.
# Noninteractive access to all databases is required during automatic
# maintenance (custom daily cronjobs, replication, and similar tasks).
#
# Database administrative login by Unix domain socket
local   all             postgres                                md5

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
```
Reiniciar el servicio.
```sh
$ sudo /etc/init.d/postgresql restart
```
Con estos cambios ya es posible realizar la conexión con el siguiente comando:
```sh
$ psql -U postgres
Password for user postgres:
psql (9.4.6)
Type "help" for help.

postgres=#
```


## Node.js

Instalar dependencias necesarias para node y node:
```sh
$ sudo apt-get install build-essential
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

Para verificar que nodejs y npm estan instalados, los siguientes comandos deben devolver las versiones de node (8.x.x) y npm:
```sh
$ node --version
$ npm --version
```


## Instalación del Proyecto

Para continuar con la instalación del PROYECTO, seguir los pasos del siguiente archivo:

> [INSTALL.md](INSTALL.md)
