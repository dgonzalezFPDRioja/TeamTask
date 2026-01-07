//Textos bonitos para estado y prioridad
import { normalizarTareaApi } from "../../../services/formateos.js";
//Llamadas al backend
import * as api from "../../../services/api.jsx";

//Obtengo ids de usuario desde varias formas posibles en la tarea
const obtenerUsuarioIds = (t) => (Array.isArray(t?.usuarioIds) ? t.usuarioIds : []);

//Paso el estado a la clave esperada por la API
const estadoParaApi = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("progreso")) return "en_progreso";
  if (e.includes("complet")) return "completada";
  return "pendiente";
};

export function crearAccionesProyectos(ctx) {
  //Creo un proyecto nuevo y reseteo el formulario
  const handleCrearProyecto = async (e) => {
    e.preventDefault();
    ctx.setMensajeProyecto("");
    ctx.setErrorProyecto("");

    const nombre = ctx.nombreProyecto.trim();
    if (!nombre) {
      ctx.setErrorProyecto("El nombre del proyecto es obligatorio");
      return;
    }

    const yaExiste = ctx.proyectos.find(
      (p) => p.nombre && p.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (yaExiste) {
      ctx.setErrorProyecto(
        "No puedes crear un proyecto con el mismo nombre que otro"
      );
      return;
    }

    try {
      const creado = await api.crearProyecto(nombre, ctx.descripcionProyecto);
      const nuevo =
        creado && creado.id
          ? {
              id: creado.id,
              nombre: creado.nombre || nombre,
              descripcion: creado.descripcion || ctx.descripcionProyecto,
              tareasAbiertas: 0,
            }
          : {
              id: Date.now(),
              nombre,
              descripcion: ctx.descripcionProyecto,
              tareasAbiertas: 0,
            };
      ctx.setProyectos((prev) => [nuevo, ...prev]);
      ctx.setMensajeProyecto("Proyecto creado correctamente");
      ctx.setNombreProyecto("");
      ctx.setDescripcionProyecto("");
    } catch (err) {
      ctx.setErrorProyecto(err.message);
    }
  };

  //Elimino un proyecto y limpio tareas/asignaciones asociadas
  const handleEliminarProyecto = async (proyectoId) => {
    const proyecto = ctx.proyectos.find((p) => p.id === proyectoId);
    if (proyecto) {
      try {
        await api.eliminarProyecto(proyecto.nombre);
      } catch (err) {
        console.error(err);
      }
    }
    ctx.setProyectos((prev) => prev.filter((p) => p.id !== proyectoId));
    ctx.setTareas((prev) => {
      const copia = { ...prev };
      delete copia[proyectoId];
      return copia;
    });
    ctx.setAsignaciones((prev) => {
      const copia = { ...prev };
      delete copia[proyectoId];
      return copia;
    });
    if (ctx.proyectoActivo?.id === proyectoId) {
      ctx.setProyectoActivo(null);
    }
  };

  //Renombro un proyecto y actualizo la vista activa
  const handleRenombrarProyecto = (proyectoId, nombreActual, nuevoNombre) => {
    if (!nuevoNombre || !nuevoNombre.trim()) return;
    ctx.setMensajeProyecto("");
    ctx.setErrorProyecto("");
    const nombreLimpio = nuevoNombre.trim();
    const yaExiste = ctx.proyectos.some(
      (p) =>
        p.id !== proyectoId &&
        p.nombre &&
        p.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (yaExiste) {
      ctx.setErrorProyecto(
        "No puedes renombrar un proyecto con el mismo nombre que otro"
      );
      return;
    }
    const descripcionActual = ctx.proyectos.find((p) => p.id === proyectoId)
      ?.descripcion;
    api
      .renombrarProyecto(nombreActual, nombreLimpio, descripcionActual)
      .catch((err) => console.error(err));
    ctx.setProyectos((prev) =>
      prev.map((p) =>
        p.id === proyectoId ? { ...p, nombre: nombreLimpio } : p
      )
    );
    if (ctx.proyectoActivo?.id === proyectoId) {
      ctx.setProyectoActivo((prev) => ({ ...prev, nombre: nombreLimpio }));
    }
  };

  //Cambio la descripcion del proyecto
  const handleCambiarDescripcion = (
    proyectoId,
    nombreActual,
    nuevaDescripcion
  ) => {
    if (nuevaDescripcion === undefined || nuevaDescripcion === null) return;
    api
      .renombrarProyecto(nombreActual, nombreActual, nuevaDescripcion.trim())
      .catch((err) => console.error(err));
    ctx.setProyectos((prev) =>
      prev.map((p) =>
        p.id === proyectoId ? { ...p, descripcion: nuevaDescripcion.trim() } : p
      )
    );
    if (ctx.proyectoActivo?.id === proyectoId) {
      ctx.setProyectoActivo((prev) => ({
        ...prev,
        descripcion: nuevaDescripcion.trim(),
      }));
    }
  };

  //Cargo tareas y usuarios asignados de un proyecto seleccionado
  const cargarProyectoDetalle = async (proyecto) => {
    if (!proyecto) return;
    ctx.setProyectoActivo(proyecto);
    ctx.setTabProyecto("tareas");
    try {
      ctx.setCargando(true);
      const [tareasApi, usuariosProyecto] = await Promise.all([
        api.getTareasPorProyecto(proyecto.id),
        api.getUsuariosPorProyecto(proyecto.id),
      ]);

      ctx.setTareas((prev) => ({
        ...prev,
        [proyecto.id]: (tareasApi || []).map(normalizarTareaApi),
      }));
      ctx.setAsignaciones((prev) => ({
        ...prev,
        [proyecto.id]: (usuariosProyecto || []).map((u) => u.id),
      }));
    } catch (err) {
      console.error("Error cargando proyecto", err);
    } finally {
      ctx.setCargando(false);
    }
  };

  //Actualizo una tarea y sincronizo asignaciones de usuarios
  const handleActualizarTarea = async (proyectoId, tareaId, cambios) => {
    const listaPrev = ctx.tareas[proyectoId] || [];
    const tareaPrev = listaPrev.find((t) => t.id === tareaId);
    const prevIds = obtenerUsuarioIds(tareaPrev);
    const nuevosIds = Array.isArray(cambios.usuarioIds) ? cambios.usuarioIds : [];

    try {
      await api.actualizarTareaApi({
        id: tareaId,
        titulo: cambios.titulo,
        descripcion: cambios.descripcion,
        estado: estadoParaApi(cambios.estado),
        prioridad: (cambios.prioridad || "").toLowerCase(),
        fecha_limite: cambios.fecha_limite || null,
      });
      //Agrego asignaciones nuevas
      for (const uid of nuevosIds) {
        if (!prevIds.includes(uid) && uid !== null && uid !== undefined) {
          try {
            await api.asignarUsuarioTarea(tareaId, uid);
          } catch (e) {
            console.error(e);
          }
        }
      }
      //Quito asignaciones que ya no aplican
      for (const uid of prevIds) {
        if (!nuevosIds.includes(uid) && uid !== null && uid !== undefined) {
          try {
            await api.desasignarUsuarioTarea(tareaId, uid);
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    ctx.setTareas((prev) => {
      const lista = prev[proyectoId] || [];
      const actualizada = lista.map((t) => {
        if (t.id !== tareaId) return t;
        const normalizada = {
          ...t,
          ...cambios,
          prioridad: cambios.prioridad,
          estado: cambios.estado,
          fecha_limite: cambios.fecha_limite ?? t.fecha_limite,
        };
        if (normalizada.usuarioIds) {
          normalizada.usuarioIds = normalizada.usuarioIds.filter(
            (id) => id !== null && id !== undefined
          );
        }
        return normalizada;
      });
      return { ...prev, [proyectoId]: actualizada };
    });
  };

  //Elimino una tarea y la quito de la lista local
  const handleEliminarTarea = async (proyectoId, tareaId) => {
    const confirmado = window.confirm("Eliminar esta tarea?");
    if (!confirmado) return;
    try {
      await api.eliminarTareaApi(tareaId);
    } catch (err) {
      console.error(err);
    }
    ctx.setTareas((prev) => {
      const lista = prev[proyectoId] || [];
      return { ...prev, [proyectoId]: lista.filter((t) => t.id !== tareaId) };
    });
  };

  //Creo una tarea nueva, asigno usuarios validos y la agrego a la lista
  const handleCrearTarea = async (tareaData) => {
    if (!ctx.proyectoActivo || !tareaData.titulo?.trim()) return;

    const asignadosProyecto = ctx.asignaciones[ctx.proyectoActivo.id] || [];
    const usuariosValidos = Array.isArray(tareaData.usuarioIds)
      ? tareaData.usuarioIds.filter((id) => asignadosProyecto.includes(id))
      : [];

    const nueva = {
      titulo: tareaData.titulo.trim(),
      descripcion: (tareaData.descripcion || "").trim(),
      usuarioIds: usuariosValidos,
      prioridad: tareaData.prioridad,
      estado: tareaData.estado,
    };

    try {
      const res = await api.crearTareaApi({
        proyecto_id: ctx.proyectoActivo.id,
        titulo: nueva.titulo,
        descripcion: nueva.descripcion,
        estado: estadoParaApi(nueva.estado),
        prioridad: nueva.prioridad.toLowerCase(),
        fecha_limite: tareaData.fecha_limite || null,
      });
      const tareaCreada = {
        id: res?.tarea?.id || Date.now(),
        ...nueva,
        fecha_limite: tareaData.fecha_limite || null,
      };
      //Asigno usuarios a la tarea creada
      for (const uid of nueva.usuarioIds) {
        try {
          await api.asignarUsuarioTarea(tareaCreada.id, uid);
        } catch (e) {
          console.error(e);
        }
      }
      ctx.setTareas((prev) => {
        const lista = prev[ctx.proyectoActivo.id] || [];
        return { ...prev, [ctx.proyectoActivo.id]: [tareaCreada, ...lista] };
      });
    } catch (err) {
      console.error(err);
    }
    ctx.setNuevaTarea({
      titulo: "",
      descripcion: "",
      usuarioIds: [],
      prioridad: "Media",
      estado: "Pendiente",
    });
  };

  return {
    //Acciones disponibles para la vista
    handleCrearProyecto,
    handleEliminarProyecto,
    handleRenombrarProyecto,
    handleCambiarDescripcion,
    cargarProyectoDetalle,
    handleActualizarTarea,
    handleEliminarTarea,
    handleCrearTarea,
  };
}



