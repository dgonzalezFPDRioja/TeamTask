//Hago aqui las llamadas a la API y manejo el token
const API_URL = import.meta.env.VITE_API_URL || "https://teamtask.es/API";

//Login y guardo el token que devuelve el backend
export async function loginRequest(correo, contrasena) {
  const res = await fetch(`${API_URL}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error en el login");
  return data;
}

//Adjunto el token almacenado y disparo la peticion al endpoint dado
async function requestWithToken(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");
  if (!token) throw new Error("No hay token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.mensaje || "Error en la peticion");
  return data;
}

//Traigo los proyectos del usuario logueado
export async function getMisProyectos() {
  return requestWithToken("proyectos.php?accion=mis");
}

//Traigo todos los proyectos (admin)
export async function getProyectos() {
  return requestWithToken("proyectos.php");
}

//Creo un proyecto nuevo
export async function crearProyecto(nombre, descripcion) {
  return requestWithToken("proyectos.php", {
    method: "POST",
    body: JSON.stringify({ nombre, descripcion }),
  });
}

//Traigo tareas de un proyecto
export async function getTareasPorProyecto(proyectoId) {
  return requestWithToken(`tareas.php?proyecto_id=${proyectoId}`);
}

//Traigo mis tareas
export async function getMisTareas() {
  return requestWithToken("tareas.php?accion=mis");
}

//Traigo comentarios de una tarea
export async function getComentariosTarea(tarea_id) {
  return requestWithToken(`tareas.php?accion=comentarios&tarea_id=${tarea_id}`);
}

//Agrego un comentario a una tarea
export async function crearComentarioTarea(tarea_id, texto) {
  return requestWithToken("tareas.php?accion=comentarios", {
    method: "POST",
    body: JSON.stringify({ tarea_id, texto }),
  });
}

//Renombro un proyecto
export async function renombrarProyecto(nombre, nuevo_nombre, descripcion) {
  return requestWithToken("proyectos.php", {
    method: "PUT",
    body: JSON.stringify({ nombre, nuevo_nombre, descripcion }),
  });
}

//Elimino un proyecto
export async function eliminarProyecto(nombre) {
  return requestWithToken("proyectos.php", {
    method: "DELETE",
    body: JSON.stringify({ nombre }),
  });
}

//Traigo usuarios (admin)
export async function getUsuarios() {
  return requestWithToken("usuarios.php");
}

//Traigo el usuario del token actual
export async function getUsuarioActual() {
  return requestWithToken("usuarios.php?me=1");
}

//Traigo usuarios asignados a un proyecto
export async function getUsuariosPorProyecto(proyectoId) {
  return requestWithToken(`usuarios.php?proyecto_id=${proyectoId}`);
}

//Creo un usuario nuevo
export async function crearUsuarioApi({ nombre, correo, contrasena, rol }) {
  return requestWithToken("usuarios.php", {
    method: "POST",
    body: JSON.stringify({ nombre, correo, contrasena, rol }),
  });
}

//Actualizo un usuario
export async function actualizarUsuarioApi(correo, cambios) {
  return requestWithToken("usuarios.php", {
    method: "PUT",
    body: JSON.stringify({ correo, ...cambios }),
  });
}

//Elimino un usuario
export async function eliminarUsuarioApi(correo) {
  return requestWithToken("usuarios.php", {
    method: "DELETE",
    body: JSON.stringify({ correo }),
  });
}

//Asigno un usuario a un proyecto
export async function asignarUsuarioProyecto(proyecto_id, usuario_id) {
  return requestWithToken("proyectos.php?accion=asignar", {
    method: "POST",
    body: JSON.stringify({ proyecto_id, usuario_id }),
  });
}

//Desasigno un usuario de un proyecto
export async function desasignarUsuarioProyecto(proyecto_id, usuario_id) {
  return requestWithToken("proyectos.php?accion=desasignar", {
    method: "DELETE",
    body: JSON.stringify({ proyecto_id, usuario_id }),
  });
}

//Creo una tarea
export async function crearTareaApi(payload) {
  return requestWithToken("tareas.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

//Actualizo una tarea
export async function actualizarTareaApi(payload) {
  return requestWithToken("tareas.php", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

//Elimino una tarea
export async function eliminarTareaApi(tarea_id) {
  return requestWithToken("tareas.php", {
    method: "DELETE",
    body: JSON.stringify({ tarea_id }),
  });
}

//Asigno un usuario a una tarea
export async function asignarUsuarioTarea(tarea_id, usuario_id) {
  return requestWithToken("tareas.php?accion=asignar", {
    method: "POST",
    body: JSON.stringify({ tarea_id, usuario_id }),
  });
}

//Desasigno un usuario de una tarea
export async function desasignarUsuarioTarea(tarea_id, usuario_id) {
  return requestWithToken("tareas.php?accion=desasignar", {
    method: "DELETE",
    body: JSON.stringify({ tarea_id, usuario_id }),
  });
}
