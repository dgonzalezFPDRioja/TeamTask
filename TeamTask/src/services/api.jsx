//Centralizo aqui las llamadas a la API y manejo el token
const API_URL = import.meta.env.VITE_API_URL || "https://teamtask.es/API"; //Uso /TeamTask/API si lo tengo asi

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

export async function getMisProyectos() {
  return requestWithToken("proyectos.php?accion=mis");
}

export async function getProyectos() {
  return requestWithToken("proyectos.php");
}

export async function crearProyecto(nombre, descripcion) {
  return requestWithToken("proyectos.php", {
    method: "POST",
    body: JSON.stringify({ nombre, descripcion }),
  });
}

export async function getTareasPorProyecto(proyectoId) {
  return requestWithToken(`tareas.php?proyecto_id=${proyectoId}`);
}

export async function getMisTareas() {
  return requestWithToken("tareas.php?accion=mis");
}

export async function getComentariosTarea(tarea_id) {
  return requestWithToken(`tareas.php?accion=comentarios&tarea_id=${tarea_id}`);
}

export async function crearComentarioTarea(tarea_id, texto) {
  return requestWithToken("tareas.php?accion=comentarios", {
    method: "POST",
    body: JSON.stringify({ tarea_id, texto }),
  });
}

export async function renombrarProyecto(nombre, nuevo_nombre, descripcion) {
  return requestWithToken("proyectos.php", {
    method: "PUT",
    body: JSON.stringify({ nombre, nuevo_nombre, descripcion }),
  });
}

export async function eliminarProyecto(nombre) {
  return requestWithToken("proyectos.php", {
    method: "DELETE",
    body: JSON.stringify({ nombre }),
  });
}

export async function getUsuarios() {
  return requestWithToken("usuarios.php");
}

export async function getUsuariosPorProyecto(proyectoId) {
  return requestWithToken(`usuarios.php?proyecto_id=${proyectoId}`);
}

export async function crearUsuarioApi({ nombre, correo, contrasena, rol }) {
  return requestWithToken("usuarios.php", {
    method: "POST",
    body: JSON.stringify({ nombre, correo, contrasena, rol }),
  });
}

export async function actualizarUsuarioApi(correo, cambios) {
  return requestWithToken("usuarios.php", {
    method: "PUT",
    body: JSON.stringify({ correo, ...cambios }),
  });
}

export async function eliminarUsuarioApi(correo) {
  return requestWithToken("usuarios.php", {
    method: "DELETE",
    body: JSON.stringify({ correo }),
  });
}

export async function asignarUsuarioProyecto(proyecto_id, usuario_id) {
  return requestWithToken("proyectos.php?accion=asignar", {
    method: "POST",
    body: JSON.stringify({ proyecto_id, usuario_id }),
  });
}

export async function desasignarUsuarioProyecto(proyecto_id, usuario_id) {
  return requestWithToken("proyectos.php?accion=desasignar", {
    method: "DELETE",
    body: JSON.stringify({ proyecto_id, usuario_id }),
  });
}

export async function crearTareaApi(payload) {
  return requestWithToken("tareas.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarTareaApi(payload) {
  return requestWithToken("tareas.php", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function eliminarTareaApi(tarea_id) {
  return requestWithToken("tareas.php", {
    method: "DELETE",
    body: JSON.stringify({ tarea_id }),
  });
}

export async function asignarUsuarioTarea(tarea_id, usuario_id) {
  return requestWithToken("tareas.php?accion=asignar", {
    method: "POST",
    body: JSON.stringify({ tarea_id, usuario_id }),
  });
}

export async function desasignarUsuarioTarea(tarea_id, usuario_id) {
  return requestWithToken("tareas.php?accion=desasignar", {
    method: "DELETE",
    body: JSON.stringify({ tarea_id, usuario_id }),
  });
}
