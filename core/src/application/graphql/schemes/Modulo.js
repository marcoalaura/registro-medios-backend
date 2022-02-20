module.exports = `
  # Escalar tipo Fecha

  # Modulos del sistema
  type Modulo {
    # ID del Modulo
    id: ID!
    # ruta de Modulo
    ruta: String!
    # label de Modulo
    label: String!
    # ícono del módulo (solo para los módulos)
    icono: String
    # orden de Modulo
    orden: Int!
    # estado de Modulo
    estado: EstadoModulo!
    # visible de Modulo
    visible: Boolean!
    # id_modulo de Modulo
    id_modulo: Int
    # id_seccion de Modulo
    id_seccion: Int
    # modulo_label de Modulo
    modulo_label: String
    # seccion_label de Modulo
    seccion_label: String
    # Usuario que creo el registro
    _user_created: Int
    # Usuario que actualizó el registro
    _user_updated: Int
    # Fecha de creación del registro
    _created_at: Date
    # Fecha de actualización del registro
    _updated_at: Date
  }

  # Tipos de estado del Modulo
  enum EstadoModulo {
    # Modulo activo
    ACTIVO
    # Modulo inactivo
    INACTIVO
  }

  # Objeto para crear un Modulo
  input NewModulo {
    ruta: String!
    label: String!
    icono: String
    orden: Int!
    visible: Boolean!
    id_modulo: Int
    id_seccion: Int
  }

  # Objeto para editar un Modulo
  input EditModulo {
    ruta: String
    label: String
    icono: String
    orden: Int
    estado: EstadoModulo
    visible: Boolean
    id_modulo: Int
    id_seccion: Int
  }

  # Objeto de paginación para Modulo
  type Modulos {
    count: Int 
    rows: [Modulo]
  }
`;
