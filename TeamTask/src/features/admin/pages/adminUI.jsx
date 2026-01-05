//Piezas visuales
import { Card, Button, Alert, ListGroup, Row, Col } from "react-bootstrap";
//Paneles de la vista admin
import PanelEstadisticas from "../componentes/PanelEstadisticas.jsx";
import PanelUsuarios from "../componentes/PanelUsuarios.jsx";
import PanelProyectos from "../componentes/PanelProyectos.jsx";
//Logica del panel admin
import useAdminPanel from "../hooks/useAdminPanel.js";
//Logo
import teamtaskLogo from "../../../assets/appnofondo.png";

//Defino la navegacion principal del panel
const MENU = [
  { key: "estadisticas", label: "Inicio" },
  { key: "proyectos", label: "Administrar proyectos" },
  { key: "usuarios", label: "Administrar usuarios" },
];

export default function AdminUI() {
  //Configuro el fondo base del layout del admin
  const fondo = {
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
  const handleCambiarDescripcion = panel.handleCambiarDescripcion;
  const handleActualizarTarea = panel.handleActualizarTarea;
  const handleEliminarTarea = panel.handleEliminarTarea;
  const handleCrearTarea = panel.handleCrearTarea;
  const handleNuevoUsuario = panel.handleNuevoUsuario;
  const handleActualizarUsuario = panel.handleActualizarUsuario;
  const handleResetUsuarioContrasena = panel.handleResetUsuarioContrasena;
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
        {/*Aviso flotante mientras carga*/}
        {cargando && admin && (
          <div
            className="position-fixed top-0 end-0 p-3"
            style={{ zIndex: 2000, pointerEvents: "none" }}
          >
            <Alert
              variant="info"
              className="shadow"
              style={{ minWidth: "220px" }}
            >
              Cargando datos...
            </Alert>
          </div>
        )}

        {/*Cabecera con logo y salida*/}
        <div className="bg-primary text-white py-3 px-4 rounded-3 mb-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <img src={teamtaskLogo} alt="TeamTask" className="banner-logo" />
            <div>
              <div className="fw-bold fs-4">TeamTask</div>
              <div className="small opacity-75">
                Panel de administracion de proyectos
              </div>
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
                {/*Menu lateral*/}
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
            {/*Seccion de proyectos*/}
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
                onCambiarDescripcion={handleCambiarDescripcion}
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

            {/*Seccion de usuarios*/}
            {seccion === "usuarios" && (
              <PanelUsuarios
                usuarios={usuarios}
                errorUsuario={errorUsuario}
                usuarioSeleccionado={usuarioSeleccionado}
                onSeleccionarUsuario={setUsuarioSeleccionado}
                onEliminarUsuario={handleEliminarUsuario}
                onActualizarUsuario={handleActualizarUsuario}
                onResetUsuarioContrasena={handleResetUsuarioContrasena}
                nuevoUsuario={nuevoUsuario}
                onNuevoUsuarioChange={setNuevoUsuario}
                onCrearUsuario={handleNuevoUsuario}
              />
            )}

            {/*Seccion de estadisticas*/}
            {seccion === "estadisticas" && (
              <PanelEstadisticas
                stats={stats}
                proyectos={proyectos}
                tareas={tareas}
              />
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
