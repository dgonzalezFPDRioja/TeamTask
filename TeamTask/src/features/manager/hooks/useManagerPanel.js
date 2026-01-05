//Herramientas para manejar estado y efectos
import { useEffect, useState } from "react";
//Llamadas al backend
import * as api from "../../../services/api.jsx";
//Ayudas para roles
import { esAdmin, esManager } from "../../../services/roles.js";
//Textos bonitos para mostrar estado y prioridad
import {
  normalizarEstadoTexto,
  normalizarPrioridadTexto,
} from "../../admin/utils/text.js";

//Paso el estado al formato que espera la API
const estadoParaApi = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("progreso")) return "en_progreso";
  if (e.includes("complet")) return "completada";
  return "pendiente";
};

//Paso la prioridad al formato que espera la API
const prioridadParaApi = (prioridad) => {
  const p = (prioridad || "").toLowerCase();
  if (p.includes("alta")) return "alta";
  if (p.includes("media")) return "media";
  return "baja";
};

//Saco los ids de usuarios asignados de una tarea
const obtenerUsuarioIds = (tarea) => {
  if (!tarea) return [];
  if (Array.isArray(tarea.usuarioIds)) return tarea.usuarioIds;
  if (tarea.usuario_ids) {
    return String(tarea.usuario_ids)
      .split(",")
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
};

export function useManagerPanel() {
  //Manejo el estado del panel de manager y sus acciones
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [usuariosProyecto, setUsuariosProyecto] = useState([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const [cargandoTareas, setCargandoTareas] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pendientes: 0,
    enProgreso: 0,
    completadasSemana: 0,
  });
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [verComentarios, setVerComentarios] = useState(false);
  const [showCrearTarea, setShowCrearTarea] = useState(false);
  const [showEditarTarea, setShowEditarTarea] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);

  //Mando al login si no hay sesion valida
  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  useEffect(() => {
    //Valido el rol y preparo el usuario
    let activo = true;
    const cargarUsuario = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        redirectToLogin();
        return;
      }
      try {
        const data = await api.getUsuarioActual();
        if (!activo) return;
        sessionStorage.setItem("usuario", JSON.stringify(data));
        if (esAdmin(data.rol)) {
          window.location.href = "/admin";
          return;
        }
        if (!esManager(data.rol)) {
          window.location.href = "/";
          return;
        }
        setUsuario(data);
        setCargando(false);
      } catch {
        redirectToLogin();
      }
    };
    cargarUsuario();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    //Cargo proyectos del manager
    const cargar = async () => {
      if (!usuario) return;
      try {
        setError("");
        setCargandoProyectos(true);
        const data = await api.getMisProyectos();
        setProyectos(data || []);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setCargandoProyectos(false);
      }
    };
    cargar();
  }, [usuario?.id]);

  const handleSeleccionarProyecto = async (proyecto) => {
    //Cargo tareas del proyecto seleccionado
    setProyectoSeleccionado(proyecto);
    setTareas([]);
    setUsuariosProyecto([]);
    setCargandoTareas(true);
    setError("");
    setShowCrearTarea(false);
    setShowEditarTarea(false);
    setTareaEditando(null);

    try {
      const [data, usuarios] = await Promise.all([
        api.getTareasPorProyecto(proyecto.id),
        api.getUsuariosPorProyecto(proyecto.id),
      ]);
      setTareas(data || []);
      setUsuariosProyecto(usuarios || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setCargandoTareas(false);
    }
  };

  const handleCambiarEstado = async (tareaId, estado) => {
    //Actualizo estado de una tarea y reflejo el cambio localmente
    try {
      await api.actualizarTareaApi({
        id: tareaId,
        estado: estado === "Completada" ? "completada" : "en_progreso",
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo actualizar la tarea");
    }
    setTareas((prev) =>
      prev.map((t) => (t.id === tareaId ? { ...t, estado: estado } : t))
    );
  };

  const usuariosProyectoIds = usuariosProyecto.map((u) => u.id);

  const handleCrearTarea = async (data) => {
    //Creo la tarea y asigno usuarios si toca
    if (!proyectoSeleccionado || !data.titulo) return;
    try {
      const res = await api.crearTareaApi({
        proyecto_id: proyectoSeleccionado.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: estadoParaApi(data.estado),
        prioridad: prioridadParaApi(data.prioridad),
        fecha_limite: data.fecha_limite || null,
      });
      const usuarioIds = (data.usuarioIds || []).filter((id) =>
        usuariosProyectoIds.includes(id)
      );
      if (res?.tarea?.id) {
        //Asigno uno por uno
        for (const uid of usuarioIds) {
          try {
            await api.asignarUsuarioTarea(res.tarea.id, uid);
          } catch (err) {
            console.error(err);
          }
        }
      }
      const tareaCreada = {
        ...(res?.tarea || {}),
        id: res?.tarea?.id || Date.now(),
        proyecto_id: proyectoSeleccionado.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: normalizarEstadoTexto(data.estado),
        prioridad: normalizarPrioridadTexto(data.prioridad),
        fecha_limite: data.fecha_limite || null,
        usuarioIds,
      };
      setTareas((prev) => [tareaCreada, ...prev]);
      setShowCrearTarea(false);
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo crear la tarea");
    }
  };

  const handleEditarTarea = async (data) => {
    //Actualizo la tarea y sincronizo asignaciones
    if (!tareaEditando) return;
    const prevIds = obtenerUsuarioIds(tareaEditando);
    const nuevosIds = (data.usuarioIds || []).filter((id) =>
      usuariosProyectoIds.includes(id)
    );
    try {
      await api.actualizarTareaApi({
        id: tareaEditando.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: estadoParaApi(data.estado),
        prioridad: prioridadParaApi(data.prioridad),
        fecha_limite: data.fecha_limite || null,
      });
      //Agrego asignaciones nuevas
      for (const uid of nuevosIds) {
        if (!prevIds.includes(uid)) {
          try {
            await api.asignarUsuarioTarea(tareaEditando.id, uid);
          } catch (err) {
            console.error(err);
          }
        }
      }
      //Quito asignaciones que ya no estan
      for (const uid of prevIds) {
        if (!nuevosIds.includes(uid)) {
          try {
            await api.desasignarUsuarioTarea(tareaEditando.id, uid);
          } catch (err) {
            console.error(err);
          }
        }
      }
      setTareas((prev) =>
        prev.map((t) =>
          t.id === tareaEditando.id
            ? {
                ...t,
                titulo: data.titulo,
                descripcion: data.descripcion,
                estado: normalizarEstadoTexto(data.estado),
                prioridad: normalizarPrioridadTexto(data.prioridad),
                fecha_limite: data.fecha_limite || null,
                usuarioIds: nuevosIds,
              }
            : t
        )
      );
      setShowEditarTarea(false);
      setTareaEditando(null);
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo actualizar la tarea");
    }
  };

  useEffect(() => {
    //Calculo estadisticas basicas
    const cargarStats = async () => {
      if (!usuario) return;
      try {
        const data = await api.getMisTareas();
        const ahora = new Date();
        const hace7 = new Date();
        hace7.setDate(ahora.getDate() - 7);
        const pendientes = (data || []).filter(
          (t) => (t.estado || "").toLowerCase() === "pendiente"
        ).length;
        const enProgreso = (data || []).filter(
          (t) =>
            (t.estado || "").toLowerCase() === "en progreso" ||
            (t.estado || "").toLowerCase() === "en_progreso"
        ).length;
        const completadasSemana = (data || []).filter((t) => {
          const est = (t.estado || "").toLowerCase();
          if (est !== "completada") return false;
          const fechaStr = t.fecha_creacion || t.fecha || t.fecha_limite;
          if (!fechaStr) return true;
          const fecha = new Date(fechaStr);
          return fecha >= hace7;
        }).length;
        setStats({ pendientes, enProgreso, completadasSemana });
      } catch (e) {
        console.error(e);
      }
    };
    cargarStats();
  }, [usuario?.id]);

  //Cierro sesion
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return {
    //Datos para pintar el panel
    cargando,
    usuario,
    proyectos,
    proyectoSeleccionado,
    tareas,
    usuariosProyecto,
    cargandoProyectos,
    cargandoTareas,
    error,
    stats,
    tareaSeleccionada,
    verComentarios,
    showCrearTarea,
    showEditarTarea,
    tareaEditando,
    setTareaSeleccionada,
    setVerComentarios,
    setShowCrearTarea,
    setShowEditarTarea,
    setTareaEditando,
    //Acciones que usa la pantalla
    handleLogout,
    handleSeleccionarProyecto,
    handleCambiarEstado,
    handleCrearTarea,
    handleEditarTarea,
  };
}

export default useManagerPanel;
