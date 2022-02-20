module.exports = `
  # Escalar tipo Fecha
  # scalar JSON

  # Entidades del sistema
  type Entidad {
    # ID del Entidad
    id: ID!
    # nombre de Entidad
    nombre: String!
    # sigla de la entidad
    sigla: String
    # descripcion de Entidad
    descripcion: String!
    # email de Entidad
    email: String
    # telefonos de Entidad
    telefonos: String
    # direccion de Entidad
    direccion: String
    # página web de Entidad
    web: String
    # Código de portal de trámites de Entidad
    codigo_portal: String!
    # estado de Entidad
    estado: EstadoEntidad!
    # información adicional de la Entidad
    info: JSON
    # subdominio de la Entidad
    subdomain: String
    # Usuario que creo el registro
    _user_created: Int
    # Usuario que actualizó el registro
    _user_updated: Int
    # Fecha de creación del registro
    _created_at: Date
    # Fecha de actualización del registro
    _updated_at: Date
  }

  # Tipos de estado del Entidad
  enum EstadoEntidad {
    # Entidad activo
    ACTIVO
    # Entidad inactivo
    INACTIVO
  }

  # Objeto para crear un Entidad
  input NewEntidad {
    nombre: String!
    sigla: String
    descripcion: String!
    estado: EstadoEntidad
    email: String
    telefonos: String
    direccion: String
    web: String
    info: String
    subdomain: String
    codigo_portal: String
  }

  # Objeto para editar un Entidad
  input EditEntidad {
    nombre: String
    sigla: String
    descripcion: String
    estado: EstadoEntidad
    email: String
    telefonos: String
    direccion: String
    web: String
    info: String
    subdomain: String
    codigo_portal: String
  }  

  # Objeto de paginación para Entidad
  type Entidades {
    count: Int 
    rows: [Entidad]
  }
`;
