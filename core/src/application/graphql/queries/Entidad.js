module.exports = {
  Query: `
    # Lista de entidades
    entidades(
      # Límite de la consulta para la paginación
      limit: Int, 
      # Nro. de página para la paginación
      page: Int, 
      # Campo a ordenar, "-campo" ordena descendentemente
      order: String,  
      # Buscar por nombre
      nombre: String
      # Buscar por sigla
      sigla: String
      # Buscar por estado
      estado: EstadoEntidad
    ): Entidades
    # Obtener un entidad
    entidad(id: Int!): Entidad
  `,
  Mutation: `
    # Agregar entidad
    entidadAdd(entidad: NewEntidad!): Entidad
    # Editar entidad
    entidadEdit(id: Int!, entidad: EditEntidad!): Entidad
    # Eliminar entidad
    entidadDelete(id: Int!): Delete
  `
};
