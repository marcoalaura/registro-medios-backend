# Rutas
## Registro

### Obtener matrículas por un determinado NIT
```
 GET '/api/v1/:nit/matriculas'
 ```

### Obtener medio por una determinada matrícula
```
GET '/api/v1/:nit/matriculas/:matricula'
```

### Adjuntar autorización de la ATT
```
POST '/api/v1/medios/:id/autorizacion_att'
```

### Adjuntar certificado RUPE
```
POST '/api/v1/medios/:id/rupe'
```

### Obtener Medio por Id
```
GET '/api/v1/medios/:id/'
```

### Modificar datos de un medio
```
PUT '/api/v1/medios/:id/'
```
**Cuerpo de la petición**
```
{
  "email": "email@a.bo",
  "telefonos": "231231",
  "direccion": "direccion falsa 123",
  "web": "http://misitio.bo",
  "tipos_medio": [1,2,3]
}
```

### Agregar una referencia personal
```
POST '/api/v1/medios/:id/referencias'
```
**Cuerpo de la petición**
```
{
	"id_persona": 2,
	"email": "emailnuevo@a.cl",
  "telefonos": 2132131,
  "tipo": "CONTACTO" // si no se especifica este valor por defecto se guardará con REPRESENTANTE_LEGAL
}
```

### Adjuntar poder legal del representante
```
POST /api/v1/medios/:id/referencias/:idRef/poder_representante
```
### Obtener archivos adjuntos según tipo
```
GET /api/v1/medios/:id/adjuntos?tipo=tipo
 ```
### Modificar datos de la referencia personal
```
PUT /api/v1/medios/:id/referencias/:idRef
 ```
### Eliminar a la referencia personal
```
DELETE /api/v1/medios/:id/referencias/:idRef
```


# Accesos
## Roles
El sistema es de simple rol. Lo que quiere decir que un usuario sólo tiene accceso a un rol. El sistema cuenta con los siguientes roles:
- Super ADMIN
- ADMININSTRADOR
- Técnico de la unidad de difusión
- Jefe de Difusión y Pauteo

## Módulos
Un módulo es un objeto (visible o no) al que se tiene acceso. Cuando es visible es un menú.
Los siguientes son los módulos encontrados en el sistema:

- config
- personas
- usuarios
- modulos
- parametros
- permisos
- roles
- logs
- serviciosIOP
- registro
- no_adeduo
- notificaciones

## Distribución de módulos según rol

#### SUPER ADMIN
- config
- personas
- usuarios
- modulos
- parametros
- permisos
- roles
- logs
- serviciosIOP
- registro
- no_adeudo
- notificaciones

#### ADMIN
- config
- personas
- usuarios
- modulos
- parametros
- permisos
- roles

#### Técnico
- ¿?

#### Jefe difusión
- ¿?

#### MEDIO
- serviciosIOP
- registro
- no_adeudo
- notificaciones
