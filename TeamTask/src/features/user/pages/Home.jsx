import { useEffect, useState } from "react";
import { Button, Alert } from "react-bootstrap";
import {
  getMisProyectos,
  getTareasPorProyecto,
  actualizarTareaApi,
  getMisTareas,
} from "../../../services/api.jsx";
import MisProyectos from "../componentes/MisProyectos.jsx";
import TareasProyectoTabla from "../componentes/TareasProyectoTabla.jsx";
import StatsTareas from "../componentes/StatsTareas.jsx";
import CommentsModal from "../componentes/CommentsModal.jsx";

function Home() {
  //Verifico si hay usuario en sesion y redirijo segun rol
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("usuario");
      const parsed = raw ? JSON.parse(raw) : null;

      if (!parsed) {
        window.location.href = "/login";
        return;
      }

      if ((parsed.rol || "").toUpperCase() === "ADMIN") {
        window.location.href = "/admin";
        return;
      }

      setUsuario(parsed);
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    //Limpio la sesion y regreso al login
    sessionStorage.clear();
    window.location.href = "/login";
  };

  if (!usuario) {
    return null;
  }

  return <HomeUsuario usuario={usuario} onLogout={handleLogout} />;
}

export default Home;

function HomeUsuario({ usuario, onLogout }) {
  //Gestiono datos y estado de la vista de usuario
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [tareas, setTareas] = useState([]);
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

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setCargandoProyectos(true);
        const data = await getMisProyectos();
        setProyectos(data);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setCargandoProyectos(false);
      }
    }

    cargar();
  }, [usuario.id]);

  const handleSeleccionarProyecto = async (proyecto) => {
    //Cargo tareas del proyecto seleccionado
    setProyectoSeleccionado(proyecto);
    setTareas([]);
    setCargandoTareas(true);
    setError("");

    try {
      const data = await getTareasPorProyecto(proyecto.id);
      setTareas(data || []);
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
      await actualizarTareaApi({
        id: tareaId,
        estado: estado === "Completada" ? "completada" : "en_progreso",
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo actualizar la tarea");
    }
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId ? { ...t, estado: estado } : t
      )
    );
  };

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const data = await getMisTareas();
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
  }, [usuario.id]);

  const fondo = {
    background:
      "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(32,201,151,0.08))",
    minHeight: "100vh",
  };

  return (
    <div style={fondo} className="py-3">
      <div className="container">
        <div className="bg-primary text-white py-3 px-4 rounded-3 mb-3 d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold fs-4">TeamTask</div>
            <div className="small opacity-75">
              Bienvenido, {usuario.nombre}
            </div>
          </div>
          <Button variant="light" size="sm" onClick={onLogout}>
            Cerrar sesion
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        <StatsTareas stats={stats} />

        <div className="row g-3">
          <div className="col-12 col-md-5">
            <MisProyectos
              proyectos={proyectos}
              cargandoProyectos={cargandoProyectos}
              proyectoSeleccionado={proyectoSeleccionado}
              onSeleccionarProyecto={handleSeleccionarProyecto}
            />
          </div>

          <div className="col-12 col-md-7">
            <TareasProyectoTabla
              proyectoSeleccionado={proyectoSeleccionado}
              tareas={tareas}
              cargandoTareas={cargandoTareas}
              error={error}
              onCambiarEstado={handleCambiarEstado}
              onSeleccionarTarea={(t) => {
                setTareaSeleccionada(t);
                setVerComentarios(true);
              }}
            />
          </div>
        </div>
        <CommentsModal
          show={verComentarios}
          tarea={tareaSeleccionada}
          usuario={usuario}
          onClose={() => {
            setVerComentarios(false);
            setTareaSeleccionada(null);
          }}
        />
      </div>
    </div>
  );
}
