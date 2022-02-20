module.exports = {
  Query: `
    # Lista de roles
    roles(
      # Límite de la consulta para la paginación
      limit: Int, 
      # Nro. de página para la paginación
      page: Int, 
      # Campo a ordenar, "-campo" ordena DESC
      order: String, 
    ): Roles
    # Obtener un rol
    rol(id: Int!): Rol
  `,
  Mutation: `
    # Agregar rol
    rolAdd(rol: NewRol!): Rol
    # Editar rol
    rolEdit(id: Int!, rol: EditRol!): Rol
    # Eliminar rol
    rolDelete(id: Int!): Delete
  `
};
