module.exports = {
  Query: `
    # Lista de permisos
    permisos(
      # Límite de la consulta para la paginación
      limit: Int, 
      # Nro. de página para la paginación
      page: Int, 
      # Campo a ordenar, "-campo" ordena DESC
      order: String, 
      # Buscar por id_modulo
      id_modulo: Int
    ): Permisos
    # Obtener un permiso
    permiso(id: Int!): Permiso
  `,
  Mutation: `
    # Agregar permiso
    permisoAdd(permiso: NewPermiso!): Permiso
    # Editar permiso
    permisoEdit(id: Int!, permiso: EditPermiso!): Permiso
    # Eliminar permiso
    permisoDelete(id: Int!): Delete
  `
};
