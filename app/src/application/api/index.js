'use strict';

const debug = require('debug')('pauteo:app:api');
const auth = require('express-jwt');
const { config } = require('common');
const guard = require('express-jwt-permissions')();

module.exports = async function setupApi (app, services, api) {
  debug('Iniciando API-REST');

  // Inicio de sesión
  app.post('/auth', api.public.auth);

  // Agregando validación del token jwt
  app.use('*', auth(config.auth));
  app.get('/api/system/menu', guard.check(['modulos:read']), api.system.obtenerMenu);
  app.get('/api/system/persona-segip/:ci', guard.check(['serviciosIop:read']), api.system.buscarPersona);
  app.patch('/api/system/cambiar_pass', guard.check(['usuarios:update']), api.system.cambiarContrasena);
  app.patch('/api/system/desactivar_cuenta', guard.check(['usuarios:update']), api.system.desactivarCuenta);
  app.get('/api/v1/parametros', api.system.obtenerParametros);
  app.post('/api/system/persona', guard.check(['registro:update']), api.system.registraPersona);
  app.get('/api/system/menu', guard.check(['modulos:read']), api.system.obtenerMenu);
  app.get('/api/v1/system/manuales/:idManual', guard.check(['registro:read']), api.system.obtenerManuales);

  // Medio
  // Obtener matrículas por un determinado NIT
  app.get('/api/v1/:nit/matriculas', guard.check(['serviciosIop:read']), api.medio.obtenerMatriculas);
  // Obtener medio por una determinada matrícula
  app.get('/api/v1/:nit/matriculas/:matricula', guard.check(['serviciosIop:read']), api.medio.obtenerMedioPorMatricula);
  // Adjuntar autorización de la ATT
  app.post('/api/v1/medios/:id/autorizacion_att', guard.check(['registro:update']), api.medio.adjuntarAutorizacionATT);
  // Adjuntar contrato
  app.post('/api/v1/medios/:id/contrato', guard.check(['registro:update']), api.medio.adjuntarContrato);
  // Adjuntar certificado RUPE
  app.post('/api/v1/medios/:id/rupe', guard.check(['registro:update']), api.medio.adjuntarRupe);
  // Adjuntar certificado de Empresa NO comercial
  app.post('/api/v1/medios/:id/no_comercial', guard.check(['registro:update']), api.medio.adjuntarNoComercial);
  // Obtener Medio por Id
  app.get('/api/v1/medios/:id/', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.medio.obtenerMedio);
  // Modificar datos de un medio
  app.put('/api/v1/medios/:id/', guard.check(['registro:update']), api.medio.actualizarMedio);
  // Agregar una referencia personal
  app.post('/api/v1/medios/:id/referencias', guard.check(['registro:update']), api.medio.crearReferencia);
  // Obtener referencias
  app.get('/api/v1/medios/:id/referencias', guard.check([['registro:update'], ['bandejaPauteo:read']]), api.medio.obtenerReferencias);
  // Adjuntar un poder legal para el representante legal
  app.post('/api/v1/medios/:id/referencias/:idRef/poder_representante', guard.check(['registro:update']), api.medio.adjuntarPoderRL);
  // Obtener archivos adjuntos según tipo
  app.get('/api/v1/medios/:id/adjuntos', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.medio.obtenerAdjunto);
  // Modificar datos de la referencia personal
  app.put('/api/v1/medios/:id/referencias/:idRef', guard.check(['registro:update']), api.medio.modificarReferencia);
  // Eliminar a la referencia personal
  app.delete('/api/v1/medios/:id/referencias/:idRef', guard.check(['registro:update']), api.medio.eliminarReferencia);
  // Validar el registro del medio
  app.get('/api/v1/medios/:id/validaciones', guard.check(['registro:update'], ['bandejaPauteo:read']), api.medio.validarRegistroMedio);
  // Enviar el medio
  app.post('/api/v1/medios/:id/enviar', guard.check(['registro:update']), api.medio.enviarRegistroMedio);

  // CERTIFICACIONES
  // Crear certificación afp de un medio
  app.post('/api/v1/medios/:id/afps/', guard.check(['registro:update']), api.medio.crearCertificacionAFP);
  // Confirmar cambios en certificación afp de un medio
  app.put('/api/v1/medios/:id/afps', guard.check(['registro:update']), api.medio.confirmarCertificacionAFP);
  // Adjuntar certificación afp de un medio
  app.post('/api/v1/medios/:id/afps/:idAfp/adjuntos', guard.check(['registro:update']), api.medio.adjuntarCertificacionAFP);
  // Obtener el adjunto de una certificación AFP_PREVISION
  app.get('/api/v1/medios/:id/afps/:idAfp/adjuntos', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.medio.obtenerAdjuntoAFP);
  // Obtener certificaciones AFP de un medio
  app.get('/api/v1/medios/:id/afps/', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.medio.obtenerCertificacionesAFP);
  
  // Rechazar certificado afp de un medio
  app.put('/api/v1/medios/:id/afps/:idAfp/rechazar', guard.check(['documentacion:update']), api.medio.rechazarCertificacionAFP);

  // DPAs
  // Dpas Obtener departamentos
  app.get('/api/v1/dpas/departamentos/', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.dpa.obtenerDepartamentos);
  // Dpas Obtener provincias de un departamento
  app.get('/api/v1/dpas/departamentos/:id/provincias/', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.dpa.obtenerProvinciasPorDepartamento);
  // Dpas Obtener municipios por provincia
  app.get('/api/v1/dpas/provincias/:id/municipios/', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.dpa.obtenerMunicipiosPorProvincia);
  // Dpas Obtener municipios por departamento
  app.get('/api/v1/dpas/departamentos/:id/municipios', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.dpa.obtenerMunicipiosPorDepartamento);

  // Cobertura
  // Crear coberturas
  app.post('/api/v1/medios/:id/tipos_medio/:idTipoMedio/coberturas', guard.check(['registro:update']), api.cobertura.crearCobertura);
  app.get('/api/v1/medios/:id/tipos_medio/:idTipoMedio/coberturas', guard.check(['registro:update']), api.cobertura.obtenerCoberturas);

  // Tarifario y tarifario detalles
  // Crear tarifario
  app.post('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/', guard.check(['registro:update']), api.tarifario.crearTarifario);
  // Obtener tarifario
  app.get('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/:idTarifario', guard.check([['registro:read'], ['bandejaPauteo:read']]), api.tarifario.obtenerTarifario);
  // Crear tarifario detalle
  app.post('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/:idTarifario/detalles', guard.check(['registro:update']), api.tarifario.crearTarifarioDetalle);
  // Obtener tarifario detalle
  app.get('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/:idTarifario/detalles/:idDet', guard.check([['registro:update'], ['bandejaPauteo:read']]), api.tarifario.obtenerTarifarioDetalle);
  // Modificar tarifario detalle
  app.put('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/:idTarifario/detalles/:idDet', guard.check(['registro:update']), api.tarifario.modificarTarifarioDetalle);
  // Eliminar tarifario detalle
  app.delete('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/:idTarifario/detalles/:idDet', guard.check(['registro:update']), api.tarifario.eliminarTarifarioDetalle);
  // Registrar tarifario detalle por defecto
  app.post('/api/v1/medios/:id/tipos_medio/:idTipoMedio/tarifarios/:idTarifario/detalles/pordefecto', guard.check(['registro:update']), api.tarifario.registrarTarifarioPorDefecto);

  // Medios para el Técnico Pauteo
  app.get('/api/v1/pauteo/medios/clasificar', guard.check(['bandejaPauteo:update']), api.medio.obtenerMediosClasificar);
  app.put('/api/v1/pauteo/medios/:id/clasificar', guard.check(['bandejaPauteo:update']), api.medio.clasificarMedio);
  app.put('/api/v1/pauteo/medios/:id/rechazar', guard.check(['bandejaPauteo:update']), api.medio.rechazarMedio);
  app.get('/api/v1/pauteo/medios/documentacion', guard.check(['bandejaPauteo:update']), api.medio.obtenerMediosDocumentacion);

  // Campañas
  // Obtener campañas
  app.get('/api/v1/campanas', guard.check(['bandejaPauteo:read']), api.campana.obtenerCampanas);
  // Crear campaña
  app.post('/api/v1/campanas', guard.check(['bandejaPauteo:create']), api.campana.crearCampana);
  // obtener Campaña por id
  app.get('/api/v1/campanas/:id', guard.check(['bandejaPauteo:read']), api.campana.obtenerCampana);
  // modificar Campaña
  app.put('/api/v1/campanas/:id', guard.check(['bandejaPauteo:update']), api.campana.modificarCampana);
  // eliminar Campaña
  app.delete('/api/v1/campanas/:id', guard.check(['bandejaPauteo:update']), api.campana.eliminarCampana);
  // Cambiar de estado de la campaña
  app.put('/api/v1/campanas/:id/estado', guard.check(['campanas_estado:update']), api.campana.cambiarEstado);
  // Modifica correlativos de campaña
  app.put('/api/v1/campanas/:id/correlativos', guard.check(['bandejaPauteo:update']), api.campana.actualizarCorrelativos);

  // Medios y campañas
  // medios posibles para campaña
  app.get('/api/v1/campanas/:id/medios_habilitados', guard.check(['bandejaPauteo:update']), api.campana.obtenerMediosParaCampana);
  // asignar medios para campaña
  app.post('/api/v1/campanas/:id/medios', guard.check(['bandejaPauteo:update']), api.campana.asignarMediosCampana);
  // asignar persona de contacto a la relación entre medio y campaña
  app.put('/api/v1/campanas/:id/medios/:idCampanaMedio', guard.check(['bandejaPauteo:update']), api.campana.actualizarCampanaMedio);
  // Obtener los detalles del medio campana
  app.get('/api/v1/campanas/:id/medios', guard.check(['bandejaPauteo:read']), api.campana.obtenerMediosRelacionados);
  // Obtener el medio de una campaña (la relación)
  app.get('/api/v1/campanas/:id/medios/:idCampanaMedio', guard.check(['bandejaPauteo:read']), api.campana.obtenerMedioRelacionado);
  // Eliminar medio de una campaña (la relación)
  app.delete('/api/v1/campanas/:id/medios/:idCampanaMedio', guard.check(['bandejaPauteo:update']), api.campana.eliminarMediosRelacionados);
  // Validar campaña antes de enviar a jefe/a pauteo
  app.get('/api/v1/campanas/:id/validar', guard.check(['bandejaPauteo:update']), api.campana.validarCampana);
  // Enviar campañana a jefe/a de pauteo
  app.put('/api/v1/campanas/:id/enviar', guard.check(['bandejaPauteo:update']), api.campana.enviarCampana);

  // Órdenes de publicidad
  // agregar orden de publicidad a una campana medio
  app.post('/api/v1/campanas/:id/medios_relacionados/:idCampanaMedio/ordenes', guard.check(['bandejaPauteo:update']), api.ordenPublicidad.crearOrdenPublicidad);
  // modificar una orden de publicidad
  app.put('/api/v1/campanas/:id/medios_relacionados/:idCampanaMedio/ordenes/:idOrden', guard.check(['bandejaPauteo:update']), api.ordenPublicidad.modificarOrdenPublicidad);
  // modificar una orden de publicidad para TV o RADIO
  app.put('/api/v1/campanas/:id/medios_relacionados/:idCampanaMedio/ordenes/nro/:nroOrden', guard.check(['bandejaPauteo:update']), api.ordenPublicidad.eliminarCrearOrdenPublicidad);
  // eliminar una orden de publicidad
  app.delete('/api/v1/campanas/:id/medios_relacionados/:idCampanaMedio/ordenes/:idOrden', guard.check(['bandejaPauteo:update']), api.ordenPublicidad.eliminarOrdenPublicidad);
  // obtener el máximo número de orden de publicidad
  app.get('/api/v1/campanas/:id/medios_relacionados/:idCampanaMedio/maxordenes', guard.check(['bandejaPauteo:update']), api.ordenPublicidad.maximoNroOrden);

  // Cobertura de campañas
  // Crear coberturas campaña
  app.post('/api/v1/campanas/:id/coberturas', guard.check(['bandejaPauteo:update']), api.coberturaCampana.crearCobertura);
  app.get('/api/v1/campanas/:id/coberturas', guard.check(['bandejaPauteo:update']), api.coberturaCampana.obtenerCoberturas);

  // Reportes
  // app.get('/api/v1/campanas/:id/medios_relacionados/:idCampanaMedio/reportes/ordenes', guard.check(['bandejaPauteo:read']), api.reporte.generarOrdenPublicitaria);
  app.get('/api/v1/campanas/:id/reportes/ordenes', guard.check(['bandejaPauteo:read']), api.reporte.generarOrdenPublicitaria);
  app.get('/api/v1/campanas/:id/reportes/visual', guard.check(['bandejaPauteo:read']), api.reporte.generarResumenVisual);
  app.get('/api/v1/campanas/:id/reportes/fsc', guard.check(['bandejaPauteo:read']), api.reporte.generarFormularioSC);
  // Nueva api para calcular costos campana tv
  app.get('/api/v1/campanas/:id/costoCampanaTV', guard.check(['bandejaPauteo:read']), api.campana.costoCampanaTV);
  return app;
};
