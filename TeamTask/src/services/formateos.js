//Compruebo si el rol es admin
export const esAdministrador = (rol) => rol === "ADMIN";

//Compruebo si el rol es manager
export const esGerente = (rol) => rol === "MANAGER";

//Texto del rol para la UI
export const etiquetaRol = (rol) => {
  if (rol === "ADMIN") return "Admin";
  if (rol === "MANAGER") return "Manager";
  return "Usuario";
};

//Color del badge segun rol
export const colorRol = (rol) => {
  if (rol === "ADMIN") return "primary";
  if (rol === "MANAGER") return "warning";
  return "secondary";
};

//Lista de roles para selects
export const OPCIONES_ROL = [
  { value: "USUARIO", label: "Usuario" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

//Ajusto etiquetas de estado a un formato consistente
export const textoEstado = (estado) => {
  if (estado === "en_progreso") return "En progreso";
  if (estado === "completada") return "Completada";
  return "Pendiente";
};

//Ajusto etiquetas de prioridad a un formato consistente
export const textoPrioridad = (prioridad) => {
  if (prioridad === "alta") return "Alta";
  if (prioridad === "media") return "Media";
  return "Baja";
};

