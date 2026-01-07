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

//Ajusto etiquetas de estado
export const textoEstado = (estado) => {
  if (estado === "en_progreso") return "En progreso";
  if (estado === "completada") return "Completada";
  return "Pendiente";
};

//Ajusto etiquetas de prioridad
export const textoPrioridad = (prioridad) => {
  const p = (prioridad || "").toLowerCase().trim();
  if (p === "alta") return "Alta";
  if (p === "media") return "Media";
  return "Baja";
};

//Convierte una lista de ids en texto a numeros
export const parseUsuarioIds = (usuarioIds) => {
  if (!usuarioIds) return [];
  return String(usuarioIds)
    .split(",")
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n));
};

//Normaliza tareas que vienen desde la API
export const normalizarTareaApi = (tarea) => {
  if (!tarea) return tarea;
  const { usuario_ids, ...rest } = tarea;
  return {
    ...rest,
    prioridad: textoPrioridad(rest.prioridad),
    estado: textoEstado(rest.estado),
    usuarioIds: parseUsuarioIds(usuario_ids),
  };
};

