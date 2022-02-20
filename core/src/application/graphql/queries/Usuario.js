module.exports = {
  Query: `
    # Lista de usuarios
    usuarios(
      # Límite de la consulta para la paginación
      limit: Int, 
      # Nro. de página para la paginación
      page: Int, 
      # Campo a ordenar, "-campo" ordena DESC
      order: String, 
      # Buscar por usuario
      usuario: String, 
      # Buscar por email
      email: String, 
      # Buscar por nombre completo
      nombre_completo: String,
      # Buscar por estado
      estado: EstadoUsuario,
      # Buscar por ID rol
      id_rol: Int,
      # Buscar por ID entidad
      id_entidad: Int
    ): Usuarios
    # Obtener un usuario
    usuario(id: Int!): Usuario
  `,
  Mutation: `
    # Agregar usuario
    usuarioAdd(usuario: NewUsuario): Usuario
    # Editar usuario
    usuarioEdit(id: Int!, usuario: EditUsuario): Usuario
    # Editar usuario
    usuarioUpdate(id: Int!, usuario: EditUsuario): Usuario
    # Eliminar usuario
    usuarioDelete(id: Int!): Delete
  `
};
