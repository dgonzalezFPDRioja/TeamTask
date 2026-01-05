//Dejo el rol en un formato fijo para comparar sin liarnos
export const normalizarRol = (rol) =>
  (rol ?? "").toString().trim().toUpperCase();

//Compruebo si el rol es admin
export const esAdmin = (rol) => normalizarRol(rol) === "ADMIN";

//Compruebo si el rol es manager
export const esManager = (rol) => normalizarRol(rol) === "MANAGER";

//Devuelvo el texto bonito del rol para la UI
export const rolLabel = (rol) => {
  const r = normalizarRol(rol);
  if (r === "ADMIN") return "Admin";
  if (r === "MANAGER") return "Manager";
  return "Usuario";
};

//Devuelvo el color del badge segun rol
export const rolVariant = (rol) => {
  const r = normalizarRol(rol);
  if (r === "ADMIN") return "primary";
  if (r === "MANAGER") return "warning";
  return "secondary";
};

//Lista de roles para selects
export const ROL_OPTIONS = [
  { value: "USER", label: "Usuario" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];
