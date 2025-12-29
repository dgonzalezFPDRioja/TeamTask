import { Card, Button, Alert, ListGroup, Row, Col } from "react-bootstrap";
import PanelEstadisticas from "../componentes/PanelEstadisticas.jsx";
import PanelUsuarios from "../componentes/PanelUsuarios.jsx";
import PanelProyectos from "../componentes/PanelProyectos.jsx";
import useAdminPanel from "../hooks/useAdminPanel.js";

//Defino la navegacion principal del panel
const MENU = [
  { key: "estadisticas", label: "Inicio" },
  { key: "proyectos", label: "Administrar proyectos" },
  { key: "usuarios", label: "Administrar usuarios" },
  { key: "ajustes", label: "Ajustes rapidos" },
];

export default function AdminUI() {
  //Configuro el fondo base del layout del admin
  const fondo = {
    background:
      "linear-gradient(135deg, rgba(13,110,253,0.12), rgba(32,201,151,0.12))",
    minHeight: "100vh",
  };

  //Uso el hook para centralizar estado y handlers del panel
  const panel = useAdminPanel();
  const admin = panel.admin;
  const cargando = panel.cargando;
  const seccion = panel.seccion;
  const setSeccion = panel.setSeccion;
  const proyectos = panel.proyectos;
  const usuarios = panel.usuarios;
  const tareas = panel.tareas;
  const asignaciones = panel.asignaciones;
  const proyectoActivo = panel.proyectoActivo;
  const tabProyecto = panel.tabProyecto;
  const setTabProyecto = panel.setTabProyecto;
  const showModalTarea = panel.showModalTarea;
  const setShowModalTarea = panel.setShowModalTarea;
  const nuevaTarea = panel.nuevaTarea;
  const showModalEditarTarea = panel.showModalEditarTarea;
  const setShowModalEditarTarea = panel.setShowModalEditarTarea;
  const tareaEditando = panel.tareaEditando;
  const setTareaEditando = panel.setTareaEditando;
  const nombreProyecto = panel.nombreProyecto;
  const setNombreProyecto = panel.setNombreProyecto;
  const descripcionProyecto = panel.descripcionProyecto;
  const setDescripcionProyecto = panel.setDescripcionProyecto;
  const mensajeProyecto = panel.mensajeProyecto;
  const errorProyecto = panel.errorProyecto;
  const usuarioSeleccionado = panel.usuarioSeleccionado;
  const setUsuarioSeleccionado = panel.setUsuarioSeleccionado;
  const nuevoUsuario = panel.nuevoUsuario;
  const setNuevoUsuario = panel.setNuevoUsuario;
  const errorUsuario = panel.errorUsuario;
  const stats = panel.stats;
  const handleLogout = panel.handleLogout;
  const handleCrearProyecto = panel.handleCrearProyecto;
  const handleEliminarProyecto = panel.handleEliminarProyecto;
  const handleRenombrarProyecto = panel.handleRenombrarProyecto;
  const handleActualizarTarea = panel.handleActualizarTarea;
  const handleEliminarTarea = panel.handleEliminarTarea;
  const handleCrearTarea = panel.handleCrearTarea;
  const handleNuevoUsuario = panel.handleNuevoUsuario;
  const handleActualizarUsuario = panel.handleActualizarUsuario;
  const handleEliminarUsuario = panel.handleEliminarUsuario;
  const handleAsignarUsuario = panel.handleAsignarUsuario;
  const handleDesasignarUsuario = panel.handleDesasignarUsuario;
  const cargarProyectoDetalle = panel.cargarProyectoDetalle;
  const limpiarAlertasProyecto = panel.limpiarAlertasProyecto;

  if (cargando && !admin) {
    return <div className="p-4">Cargando panel de administrador...</div>;
  }

  return (
    <div style={fondo} className="py-3">
      <div className="container-fluid">
        {cargando && admin && (
          <div
            className="position-fixed top-0 end-0 p-3"
            style={{ zIndex: 2000, pointerEvents: "none" }}
          >
            <Alert variant="info" className="shadow" style={{ minWidth: "220px" }}>
              Cargando datos...
            </Alert>
          </div>
        )}

        <div className="bg-primary text-white py-3 px-4 rounded-3 mb-3 d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold fs-4">TeamTask</div>
            <div className="small opacity-75">
              Panel de administracion de proyectos
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{admin.nombre}</div>
              <div className="small">Administrador</div>
            </div>
            <Button size="sm" variant="light" onClick={handleLogout}>
              Cerrar sesion
            </Button>
          </div>
        </div>

        <Row>
          <Col md={3} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <ListGroup>
                  {MENU.map((item) => (
                    <ListGroup.Item
                      key={item.key}
                      action
                      active={seccion === item.key}
                      onClick={() => setSeccion(item.key)}
                    >
                      {item.label}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            {seccion === "proyectos" && (
              <PanelProyectos
                proyectos={proyectos}
                proyectoActivo={proyectoActivo}
                tabProyecto={tabProyecto}
                usuarios={usuarios}
                tareas={tareas}
                asignaciones={asignaciones}
                nombreProyecto={nombreProyecto}
                descripcionProyecto={descripcionProyecto}
                mensaje={mensajeProyecto}
                error={errorProyecto}
                onNombreProyecto={setNombreProyecto}
                onDescripcionProyecto={setDescripcionProyecto}
                onCrearProyecto={handleCrearProyecto}
                onEliminarProyecto={handleEliminarProyecto}
                onRenombrarProyecto={handleRenombrarProyecto}
                onClearAlerts={limpiarAlertasProyecto}
                onSeleccionarProyecto={cargarProyectoDetalle}
                onAsignarUsuario={handleAsignarUsuario}
                onDesasignarUsuario={handleDesasignarUsuario}
                onSetTabProyecto={setTabProyecto}
                onActualizarTarea={handleActualizarTarea}
                onShowModalTarea={setShowModalTarea}
                nuevaTarea={nuevaTarea}
                showModalTarea={showModalTarea}
                onCrearTarea={handleCrearTarea}
                onEliminarTarea={handleEliminarTarea}
                onShowModalEditarTarea={setShowModalEditarTarea}
                onSetTareaEditando={setTareaEditando}
                showModalEditarTarea={showModalEditarTarea}
                tareaEditando={tareaEditando}
              />
            )}

            {seccion === "usuarios" && (
              <PanelUsuarios
                usuarios={usuarios}
                errorUsuario={errorUsuario}
                usuarioSeleccionado={usuarioSeleccionado}
                onSeleccionarUsuario={setUsuarioSeleccionado}
                onEliminarUsuario={handleEliminarUsuario}
                onActualizarUsuario={handleActualizarUsuario}
                nuevoUsuario={nuevoUsuario}
                onNuevoUsuarioChange={setNuevoUsuario}
                onCrearUsuario={handleNuevoUsuario}
              />
            )}

            {seccion === "estadisticas" && (
              <PanelEstadisticas stats={stats} proyectos={proyectos} />
            )}

            {seccion === "ajustes" && (
              <Card className="p-4 shadow-sm">
                <h5>Ajustes rapidos</h5>
                <p className="text-muted mb-2">
                  Espacio para accesos rapidos (backups, mantenimiento, roles).
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="outline-secondary" size="sm">
                    Forzar sincronizacion
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    Limpiar cache
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    Revisar logs
                  </Button>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
