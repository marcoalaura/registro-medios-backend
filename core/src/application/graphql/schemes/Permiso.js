module.exports = `
  # Escalar tipo Fecha
  # Permisos del sistema
  type Permiso {
    # ID del Permiso
    id: ID!
    # create de Permiso
    create: Boolean!
    # read de Permiso
    read: Boolean!
    # update de Permiso
    update: Boolean!
    # delete de Permiso
    delete: Boolean!
    # firma de Permiso
    firma: Boolean!
    # csv de Permiso
    csv: Boolean!
    # activo de Permiso
    activo: Boolean!
    # id_modulo de Permiso
    id_modulo: Int!
    # id_rol de Permiso
    id_rol: Int!
    # modulo_label de Permiso
    modulo_label: String
    # rol_nombre de Permiso
    rol_nombre: String
    # rol_descripcion de Permiso
    rol_descripcion: String
    # Usuario que creo el registro
    _user_created: Int
    # Usuario que actualizó el registro
    _user_updated: Int
    # Fecha de creación del registro
    _created_at: Date
    # Fecha de actualización del registro
    _updated_at: Date
  }

  # Objeto para crear un Permiso
  input NewPermiso {
    create: Boolean!
    read: Boolean!
    update: Boolean!
    delete: Boolean!
    firma: Boolean!
    csv: Boolean!
    activo: Boolean!
    id_modulo: Int!
    id_rol: Int!
  }

  # Objeto para editar un Permiso
  input EditPermiso {
    create: Boolean
    read: Boolean
    update: Boolean
    delete: Boolean
    firma: Boolean
    csv: Boolean
    activo: Boolean
    id_rol: Int
    id_modulo: Int
  }

  # Objeto de paginación para Permiso
  type Permisos {
    count: Int 
    rows: [Permiso]
  }
`;
