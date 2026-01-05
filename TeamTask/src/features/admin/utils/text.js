//Aseguro que el primer caracter vaya en mayusculas
export const capitalizar = (txt = "") =>
  txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : "";

//Ajusto etiquetas de estado a un formato consistente
export const normalizarEstadoTexto = (estado = "") => {
  const e = estado.toLowerCase();
  if (e === "en progreso") return "En progreso";
  if (e === "en_progreso") return "En progreso";
  if (e === "en revision") return "En revision";
  if (e === "completada") return "Completada";
  if (e === "pendiente") return "Pendiente";
  return capitalizar(estado);
};

//Ajusto etiquetas de prioridad a un formato consistente
export const normalizarPrioridadTexto = (prioridad = "") => {
  const p = prioridad.toLowerCase();
  if (p === "alta") return "Alta";
  if (p === "media") return "Media";
  if (p === "baja") return "Baja";
  return capitalizar(prioridad);
};
