'use strict';

// Definiendo asociaciones de las tablas
module.exports = function associations (models) {
  const {
    roles,
    usuarios,
    entidades,
    modulos,
    permisos,
    personas,
    medio,
    parametrica,
    medioTiposMedio,
    coberturaMedio,
    dpa,
    referencia,
    afpCertificacion,
    tarifario,
    tarifarioDetalle,
    campana,
    coberturaCampana,
    campanaMedio,
    ordenPublicidad
  } = models;

  // Asociaciones tabla usuarios
  usuarios.belongsTo(entidades, { foreignKey: { name: 'id_entidad', allowNull: true }, as: 'entidad' });
  entidades.hasMany(usuarios, { foreignKey: { name: 'id_entidad', allowNull: true }, as: 'entidad' });

  usuarios.belongsTo(roles, { foreignKey: { name: 'id_rol', allowNull: false }, as: 'rol' });
  roles.hasMany(usuarios, { foreignKey: { name: 'id_rol', allowNull: false }, as: 'rol' });

  usuarios.belongsTo(personas, { foreignKey: { name: 'id_persona', allowNull: true }, as: 'persona' });
  personas.hasMany(usuarios, { foreignKey: { name: 'id_persona', allowNull: true }, as: 'persona' });

  // Asociaciones para la tabla medio
  // un medio pertenece a un usuario
  medio.belongsTo(usuarios, { foreignKey: { name: 'id_usuario', allowNull: false }, as: 'usuario' });
  // un usuario tiene muchos medios
  usuarios.hasMany(medio, { foreignKey: { name: 'id_usuario', allowNull: false }, as: 'medios' });
  // un medio pertenece a (o es) muchos tipos de medio
  medio.belongsToMany(parametrica, { through: medioTiposMedio, foreignKey: 'id_medio', timestamps: false, as: 'tipos_medio' });
  // un tipo de medio pertenece a varios medios
  parametrica.belongsToMany(medio, { through: medioTiposMedio, foreignKey: 'id_tipo_medio', timestamps: false, as: 'medios' });
  // un medio tiene varias personas de referencias
  medio.belongsToMany(personas, { through: referencia, foreignKey: { name: 'id_medio', allowNull: false }, timestamps: false, as: 'referencias' });
  // una persona de referencia pertenece a varios medios
  personas.belongsToMany(medio, { through: referencia, foreignKey: { name: 'id_persona', allowNull: false }, timestamps: false, as: 'medios' });
  // un medio tiene varias referencias
  medio.hasMany(referencia, { foreignKey: { name: 'id_medio', allowNull: false }, as: 'referencia' });
  // un medio tiene varias certificaciones afp
  medio.hasMany(afpCertificacion, { foreignKey: { name: 'id_medio', allowNull: false }, as: 'afp_certificacion' });
  // una certificación afp pertence a un medio
  afpCertificacion.belongsTo(medio, { foreignKey: { name: 'id_medio', allowNull: false }, as: 'medio' });
  // una certificación afp pertenece a un tipo de afp
  afpCertificacion.belongsTo(parametrica, { foreignKey: { name: 'id_tipo', allowNull: false }, as: 'tipo' });

  // asociaciones para Tipos de medio
  // Un tipo de medio de un medio tiene muchas dpas a través de una cobertura
  medioTiposMedio.belongsToMany(dpa, { through: coberturaMedio, timestamps: false, foreignKey: 'id_medio_tipo_medio', as: 'coberturas' });
  dpa.belongsToMany(medioTiposMedio, { through: coberturaMedio, timestamps: false, foreignKey: 'id_dpa', as: 'medios' });
  coberturaMedio.belongsTo(dpa, { foreignKey: { name: 'id_dpa', allowNull: false }, as: 'dpa' });
  // un tipo de medio de un medio tiene varios tarifarios
  medioTiposMedio.hasMany(tarifario, { foreignKey: { name: 'id_tipo_medio', allowNull: false }, as: 'tarifarios' });
  tarifario.belongsTo(medioTiposMedio, { foreignKey: { name: 'id_tipo_medio', allowNull: false }, as: 'tipo_medio' });
  tarifario.hasMany(tarifarioDetalle, { foreignKey: { name: 'id_tarifario', allowNull: false }, as: 'detalles' });
  tarifarioDetalle.belongsTo(tarifario, { foreignKey: { name: 'id_tarifario', allowNull: false }, as: 'tarifario' });

  dpa.hasMany(dpa, { foreignKey: { name: 'id_dpa_superior', allowNull: true }, as: 'hijos' });
  dpa.belongsTo(dpa, { foreignKey: { name: 'id_dpa_superior', allowNull: true }, as: 'superior' });

  referencia.belongsTo(personas, { foreignKey: { name: 'id_persona', allowNull: false }, as: 'persona' });
  referencia.belongsTo(medio, { foreignKey: { name: 'id_medio', allowNull: false }, as: 'medio' });

  // Asociaciones tablas permisos - roles
  permisos.belongsTo(roles, { foreignKey: { name: 'id_rol', allowNull: false }, as: 'rol' });
  roles.hasMany(permisos, { foreignKey: { name: 'id_rol', allowNull: false } });

  // Asociaciones tablas permisos - modulos
  permisos.belongsTo(modulos, { foreignKey: { name: 'id_modulo', allowNull: false }, as: 'modulo' });
  modulos.hasMany(permisos, { foreignKey: { name: 'id_modulo', allowNull: false } });

  // Asociaciones tablas modulos - sección
  modulos.belongsTo(modulos, { foreignKey: 'id_modulo' });
  modulos.hasMany(modulos, { foreignKey: 'id_modulo' });
  modulos.belongsTo(modulos, { foreignKey: 'id_seccion' });
  modulos.hasMany(modulos, { foreignKey: 'id_seccion' });

  // Asociaciones tabla campaña
  // Una campaña pertenece a un tipo de campaña
  campana.belongsTo(parametrica, { foreignKey: { name: 'id_tipo_campana', allowNull: false }, as: 'tipo_campana' });
  // Una campaña tiene un técnico encargado
  campana.belongsTo(usuarios, { foreignKey: { name: 'id_tecnico', allowNull: false }, as: 'tecnico' });
  // Una campaña pertenece a varios dpas a través de la tabla cobertura_campana
  campana.belongsToMany(dpa, { through: coberturaCampana, timestamps: false, foreignKey: 'id_campana', as: 'coberturasCampana' });
  // Un dpa pertenece a varias campañas a través de la tabla cobertura_campana
  dpa.belongsToMany(campana, { through: coberturaCampana, timestamps: false, foreignKey: 'id_dpa', as: 'campanas' });
  // Una relación cobertura_campana pertenece a un dpa (necesario para hacer uniones más simples)
  coberturaCampana.belongsTo(dpa, { foreignKey: { name: 'id_dpa', allowNull: false }, as: 'dpa' });
  // Una campana tiene n medios a través de la tabla campanaMedio
  campana.belongsToMany(medio, { through: campanaMedio, timestamps: false, foreignKey: 'id_campana', as: 'medios' });
  // Un medio pertenece a n campasñas a través de la tabla campanaMedio
  medio.belongsToMany(campana, { through: campanaMedio, timestamps: false, foreignKey: 'id_medio', as: 'campanas' });
  // Una campanamedio tiene n órdenes de publicidad
  campanaMedio.belongsTo(medio, { foreignKey: { name: 'id_medio', allowNull: false }, as: 'medio' });
  campanaMedio.hasMany(ordenPublicidad, { foreignKey: { name: 'id_campana_medio', allowNull: false }, as: 'ordenes' });
  ordenPublicidad.belongsTo(campanaMedio, { foreignKey: { name: 'id_campana_medio', allowNull: false }, as: 'campanaMedio' });
  // Una campanaMedio tiene un contacto de referencia
  campanaMedio.belongsTo(referencia, { foreignKey: { name: 'id_referencia', allowNull: true }, as: 'referencia' });
  // Una orden de publicidad pertenece a un tarifario detalle
  ordenPublicidad.belongsTo(tarifarioDetalle, { foreignKey: { name: 'id_tarifario_det', allowNull: false }, as: 'tarifario' });

  return models;
};
