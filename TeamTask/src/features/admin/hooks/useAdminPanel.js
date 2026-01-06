//Herramientas para estado y efectos
import { useEffect, useState } from "react";
//Llamadas al backend
import * as api from "../../../services/api.jsx";
//Ayuda para rol admin
import { esAdministrador } from "../../../services/formateos.js";
//Textos bonitos para tareas
import {
  textoEstado,
  textoPrioridad,
} from "../../../services/formateos.js";
//Acciones separadas por area
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

//Ajusto los datos de una tarea al formato de la vista
const normalizarTarea = (tarea) => ({
  ...tarea,
  prioridad: textoPrioridad(tarea.prioridad),
  estado: textoEstado(tarea.estado),
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
    //Valido sesion y rol
    let activo = true;
    const cargarUsuario = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        redirectToLogin();
        return;
      }
      try {
        const usuario = await api.getUsuarioActual();
        if (!activo) return;
        if (!usuario || !esAdministrador(usuario.rol)) {
          redirectToLogin();
          return;
        }
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        setAdmin(usuario);
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
    //Cargo proyectos y usuarios al montar el panel
    const cargarDatos = async () => {
      if (!admin) return;
      try {
        setCargando(true);
        const [proys, usrs] = await Promise.all([
          esAdministrador(admin.rol)
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

  //Acciones para proyectos
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

  //Cierro sesion del admin
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleCrearProyecto = accionesProyectos.handleCrearProyecto;
  const handleEliminarProyecto = accionesProyectos.handleEliminarProyecto;
  const handleRenombrarProyecto = accionesProyectos.handleRenombrarProyecto;
  const handleCambiarDescripcion = accionesProyectos.handleCambiarDescripcion;
  const handleActualizarTarea = accionesProyectos.handleActualizarTarea;
  const handleEliminarTarea = accionesProyectos.handleEliminarTarea;
  const handleCrearTarea = accionesProyectos.handleCrearTarea;

  const handleNuevoUsuario = accionesUsuarios.handleNuevoUsuario;
  const handleActualizarUsuario = accionesUsuarios.handleActualizarUsuario;
  const handleResetUsuarioContrasena =
    accionesUsuarios.handleResetUsuarioContrasena;
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
    //Datos para la vista
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
    //Acciones que usa la pantalla
    handleLogout,
    handleCrearProyecto,
    handleEliminarProyecto,
    handleRenombrarProyecto,
    handleCambiarDescripcion,
    handleActualizarTarea,
    handleEliminarTarea,
    handleCrearTarea,
    handleNuevoUsuario,
    handleActualizarUsuario,
    handleResetUsuarioContrasena,
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


