module.exports = `
  # Escalar tipo Fecha
  scalar Date
  scalar JSON

  # Usuarios del sistema
  type Usuario {
    # ID del usuario
    id: ID!
    # Nombre de usuario
    usuario: String!
    # Correo electrónico del persona
    email: String
    # Nombres del persona
    tour: JSON
    # Cargo del usuario
    cargo: String
    # Estado del usuario
    estado: EstadoUsuario!
    # Última vez que hizo login
    ultimo_login: Date
    # Id de la entidad
    id_entidad: Int
    # Id de Rol
    id_rol: Int!
    # Id de persona
    id_persona: Int!
    # Nombres del persona
    persona_nombres: String
    # Primer apellido
    persona_primer_apellido: String
    # Segundo apellido
    persona_segundo_apellido: String
    # nombre_completo
    persona_nombre_completo: String
    # tipo_documento
    persona_tipo_documento: TipoDocPersona
    # tipo_documento_otro
    persona_tipo_documento_otro: String
    # nro_documento
    persona_nro_documento: String
    # fecha_nacimiento
    persona_fecha_nacimiento: Date
    # movil
    persona_movil: String
    # nacionalidad
    persona_nacionalidad: String
    # pais_nacimiento
    persona_pais_nacimiento: String
    # genero
    persona_genero: GeneroPersona
    # Teléfono del persona
    persona_telefono: String    
    # Estado del persona
    persona_estado: EstadoPersona!
    # Nombre de rol
    rol_nombre: String
    # Nombre de entidad
    entidad_nombre: String
    # Id de la persona que creo el registro
    _user_created: Int
    # Usuario que actualizó el registro
    _user_updated: Int
    # Fecha de creación del registro
    _created_at: Date
    # Fecha de actualización del registro
    _updated_at: Date
  }

  # Tipos de estado del usuario
  enum EstadoUsuario {
    # Usuario activo
    ACTIVO
    # Usuario inactivo
    INACTIVO
  }

  # Objeto para crear un usuario
  input NewUsuario {
    usuario: String!
    contrasena: String!
    email: String
    cargo: String
    id_entidad: Int!
    id_rol: Int!
    nombres: String!
    primer_apellido: String
    segundo_apellido: String
    nombre_completo: String
    tipo_documento: TipoDocPersona!
    tipo_documento_otro: String
    nro_documento: String!
    fecha_nacimiento: Date!
    movil: String
    nacionalidad: String
    pais_nacimiento: String
    genero: GeneroPersona
    telefono: String
  }

  # Objeto para editar un usuario
  input EditUsuario {
    usuario: String
    email: String
    tour: JSON
    cargo: String
    estado: EstadoUsuario
    id_entidad: Int
    id_rol: Int
    id_persona: Int
    nombres: String
    primer_apellido: String
    segundo_apellido: String
    nombre_completo: String
    tipo_documento: TipoDocPersona
    tipo_documento_otro: String
    nro_documento: String
    fecha_nacimiento: Date
    movil: String
    nacionalidad: String
    pais_nacimiento: String
    genero: GeneroPersona
    telefono: String    
    estado_persona: EstadoPersona
  }

  # Objeto de paginación para usuario
  type Usuarios {
    count: Int 
    rows: [Usuario]
  }

  # Objeto de respuesta de objeto eliminado
  type Delete {
    deleted: Boolean
  }
`;
