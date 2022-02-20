module.exports = {
  Query: `
    # Lista de modulos
    modulos(
      # Límite de la consulta para la paginación
      limit: Int, 
      # Nro. de página para la paginación
      page: Int, 
      # Campo a ordenar, "-campo" ordena DESC
      order: String, 
      # Buscar por label
      label: String
      # Buscar por estado
      estado: EstadoModulo
      # Buscar por visible
      visible: Boolean
      # Buscar por módulo
      id_modulo: Int
      # Buscar por sección
      id_seccion: Int
    ): Modulos
    # Obtener un modulo
    modulo(id: Int!): Modulo
  `,
  Mutation: `
    # Agregar modulo
    moduloAdd(modulo: NewModulo!): Modulo
    # Editar modulo
    moduloEdit(id: Int!, modulo: EditModulo!): Modulo
    # Eliminar modulo
    moduloDelete(id: Int!): Delete
  `
};
