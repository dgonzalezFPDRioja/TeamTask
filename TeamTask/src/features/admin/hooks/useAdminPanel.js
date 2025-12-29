import { useEffect, useState } from "react";
import * as api from "../../../services/api.jsx";
import {
  normalizarEstadoTexto,
  normalizarPrioridadTexto,
} from "../utils/text.js";
import { crearAccionesProyectos } from "./accionesProyectos.js";
import { crearAccionesUsuarios } from "./accionesUsuarios.js";

//Defino valores iniciales para formularios y modales
const nuevaTareaInicial = () => ({
  titulo: "",
  descripcion: "",
  usuarioIds: [],
  prioridad: "Media",
  estado: "Pendiente",
});

const nuevoUsuarioInicial = () => ({
  nombre: "",
  correo: "",
  contrasena: "",
  rol: "USER",
});

const normalizarTarea = (tarea) => ({
  ...tarea,
  prioridad: normalizarPrioridadTexto(tarea.prioridad),
  estado: normalizarEstadoTexto(tarea.estado),
  usuarioIds: Array.isArray(tarea.usuarioIds)
    ? tarea.usuarioIds
    : tarea.usuario_ids
    ? tarea.usuario_ids
        .split(",")
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n))
    : [],
});

export function useAdminPanel() {
  //Manejo el estado global del panel y sus formularios
  const [cargando, setCargando] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [seccion, setSeccion] = useState("estadisticas");

  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tareas, setTareas] = useState({});
  const [asignaciones, setAsignaciones] = useState({});

  const [proyectoActivo, setProyectoActivo] = useState(null);
  const [tabProyecto, setTabProyecto] = useState("tareas");
  const [showModalTarea, setShowModalTarea] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState(nuevaTareaInicial);
  const [showModalEditarTarea, setShowModalEditarTarea] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);

  const [nombreProyecto, setNombreProyecto] = useState("");
  const [descripcionProyecto, setDescripcionProyecto] = useState("");
  const [mensajeProyecto, setMensajeProyecto] = useState("");
  const [errorProyecto, setErrorProyecto] = useState("");

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState(nuevoUsuarioInicial);
  const [errorUsuario, setErrorUsuario] = useState("");

  //Redirijo a login si no hay usuario admin en sessionStorage
  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (!usuarioGuardado) {
      redirectToLogin();
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);
      if (!usuario || (usuario.rol || "").toUpperCase() !== "ADMIN") {
        redirectToLogin();
        return;
      }
      setAdmin(usuario);
      setCargando(false);
    } catch {
      redirectToLogin();
    }
  }, []);

  useEffect(() => {
    //Cargo proyectos y usuarios al montar el panel
    const cargarDatos = async () => {
      if (!admin) return;
      try {
        setCargando(true);
        const [proys, usrs] = await Promise.all([
          (admin.rol || "").toUpperCase() === "ADMIN"
            ? api.getProyectos()
            : api.getMisProyectos(),
          api.getUsuarios(),
        ]);
        setProyectos(proys || []);
        setUsuarios(usrs || []);
      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [admin]);

  useEffect(() => {
    //Cuando hay proyectos, traigo sus tareas para pintarlas en listados
    const cargarTareasIniciales = async () => {
      if (!proyectos.length) return;
      try {
        const pares = await Promise.all(
          proyectos.map(async (p) => {
            try {
              const tareasApi = await api.getTareasPorProyecto(p.id);
              return [p.id, (tareasApi || []).map(normalizarTarea)];
            } catch (err) {
              console.error("Error cargando tareas del proyecto", p.id, err);
              return [p.id, []];
            }
          })
        );
        setTareas((prev) => {
          const copia = { ...prev };
          pares.forEach(([id, lista]) => {
            copia[id] = lista;
          });
          return copia;
        });
      } catch (err) {
        console.error("Error cargando tareas iniciales", err);
      }
    };
    cargarTareasIniciales();
  }, [proyectos]);

  const accionesProyectos = crearAccionesProyectos({
    nombreProyecto,
    descripcionProyecto,
    proyectos,
    tareas,
    proyectoActivo,
    asignaciones,
    setProyectos,
    setNombreProyecto,
    setDescripcionProyecto,
    setMensajeProyecto,
    setErrorProyecto,
    setTareas,
    setAsignaciones,
    setProyectoActivo,
    setTabProyecto,
    setCargando,
    setNuevaTarea,
  });

  //Gestiono acciones CRUD de usuarios y asignaciones
  const accionesUsuarios = crearAccionesUsuarios({
    nuevoUsuario,
    usuarioSeleccionado,
    usuarios,
    asignaciones,
    setUsuarios,
    setNuevoUsuario,
    setErrorUsuario,
    setUsuarioSeleccionado,
    setAsignaciones,
  });

  const cargarProyectoDetalle = accionesProyectos.cargarProyectoDetalle;

  useEffect(() => {
    //Limpio modales cuando se cambia de proyecto
    if (!proyectoActivo) {
      setShowModalTarea(false);
      setShowModalEditarTarea(false);
      setTareaEditando(null);
    }
  }, [proyectoActivo]);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleCrearProyecto = accionesProyectos.handleCrearProyecto;
  const handleEliminarProyecto = accionesProyectos.handleEliminarProyecto;
  const handleRenombrarProyecto = accionesProyectos.handleRenombrarProyecto;
  const handleActualizarTarea = accionesProyectos.handleActualizarTarea;
  const handleEliminarTarea = accionesProyectos.handleEliminarTarea;
  const handleCrearTarea = accionesProyectos.handleCrearTarea;

  const handleNuevoUsuario = accionesUsuarios.handleNuevoUsuario;
  const handleActualizarUsuario = accionesUsuarios.handleActualizarUsuario;
  const handleEliminarUsuario = accionesUsuarios.handleEliminarUsuario;
  const handleAsignarUsuario = accionesUsuarios.handleAsignarUsuario;
  const handleDesasignarUsuario = accionesUsuarios.handleDesasignarUsuario;

  //Calculo estadisticas basicas para la vista de inicio
  const stats = {
    totalProyectos: proyectos.length,
    totalUsuarios: usuarios.length,
    tareasAbiertas: proyectos.reduce((acc, p) => {
      const tareasProyecto = tareas[p.id] || [];
      const abiertas = tareasProyecto.filter(
        (t) => (t.estado || "").toLowerCase() !== "completada"
      ).length;
      return acc + abiertas;
    }, 0),
    usuariosPorProyecto: Math.round(
      proyectos.length ? usuarios.length / proyectos.length : 0
    ),
  };

  const limpiarAlertasProyecto = () => {
    setMensajeProyecto("");
    setErrorProyecto("");
  };

  return {
    admin,
    cargando,
    seccion,
    setSeccion,
    proyectos,
    usuarios,
    tareas,
    asignaciones,
    proyectoActivo,
    tabProyecto,
    setTabProyecto,
    showModalTarea,
    setShowModalTarea,
    nuevaTarea,
    setNuevaTarea,
    showModalEditarTarea,
    setShowModalEditarTarea,
    tareaEditando,
    setTareaEditando,
    nombreProyecto,
    setNombreProyecto,
    descripcionProyecto,
    setDescripcionProyecto,
    mensajeProyecto,
    errorProyecto,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    nuevoUsuario,
    setNuevoUsuario,
    errorUsuario,
    stats,
    handleLogout,
    handleCrearProyecto,
    handleEliminarProyecto,
    handleRenombrarProyecto,
    handleActualizarTarea,
    handleEliminarTarea,
    handleCrearTarea,
    handleNuevoUsuario,
    handleActualizarUsuario,
    handleEliminarUsuario,
    handleAsignarUsuario,
    handleDesasignarUsuario,
    cargarProyectoDetalle,
    limpiarAlertasProyecto,
    setErrorProyecto,
    setMensajeProyecto,
  };
}

export default useAdminPanel;
