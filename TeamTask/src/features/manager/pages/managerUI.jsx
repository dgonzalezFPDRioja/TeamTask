//Piezas visuales
import { Button, Alert, Container, Row, Col, Card, Stack } from "react-bootstrap";
//Logica del panel manager
import useManagerPanel from "../hooks/useManagerPanel.js";
//Componentes reutilizados del usuario
import MisProyectos from "../../user/componentes/MisProyectos.jsx";
import TareasProyectoTabla from "../../user/componentes/TareasProyectoTabla.jsx";
import StatsTareas from "../../user/componentes/StatsTareas.jsx";
import CommentsModal from "../../user/componentes/CommentsModal.jsx";
//Modal para crear/editar tareas
import ModalTarea from "../../admin/componentes/ModalTarea.jsx";
//Textos bonitos para estado y prioridad
import {
  textoEstado,
  textoPrioridad,
} from "../../../services/formateos.js";
//Logo
import teamtaskLogo from "../../../assets/appnofondo.png";

export default function ManagerUI() {
  //Estructuro la vista principal del manager
  const panel = useManagerPanel();

  const fondo = {
    //Fondo suave de la pagina
    background:
      "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(32,201,151,0.08))",
    minHeight: "100vh",
  };

  //Mientras carga el usuario muestro un texto simple
  if (panel.cargando && !panel.usuario) {
    return <div className="p-4">Cargando panel de manager...</div>;
  }

  return (
    <Container fluid style={fondo} className="py-3">
      <Container>
        {/*Cabecera con logo y saludo*/}
        <Card className="bg-primary text-white rounded-3 mb-3 border-0 shadow-sm">
          <Card.Body className="py-3 px-4">
            <Stack direction="horizontal" className="justify-content-between align-items-center">
              <Stack direction="horizontal" className="align-items-center gap-3">
                <img src={teamtaskLogo} alt="TeamTask" className="banner-logo" />
                <Stack gap={1}>
                  <Card.Title className="mb-0">TeamTask</Card.Title>
                  <Card.Text className="small opacity-75 mb-0">
                    Bienvenido, {panel.usuario?.nombre}
                  </Card.Text>
                </Stack>
              </Stack>
              <Button variant="light" size="sm" onClick={panel.handleLogout}>
                Cerrar sesion
              </Button>
            </Stack>
          </Card.Body>
        </Card>

        {/*Muestro errores si hay*/}
        {panel.error && <Alert variant="danger">{panel.error}</Alert>}
        {/*Resumen de tareas*/}
        <StatsTareas stats={panel.stats} />

        <Row className="g-3">
          <Col xs={12} md={5}>
            {/*Lista de proyectos*/}
            <MisProyectos
              proyectos={panel.proyectos}
              cargandoProyectos={panel.cargandoProyectos}
              proyectoSeleccionado={panel.proyectoSeleccionado}
              onSeleccionarProyecto={panel.handleSeleccionarProyecto}
            />
          </Col>

          <Col xs={12} md={7}>
            {/*Tabla de tareas con acciones*/}
            <TareasProyectoTabla
              proyectoSeleccionado={panel.proyectoSeleccionado}
              tareas={panel.tareas}
              cargandoTareas={panel.cargandoTareas}
              error={panel.error}
              onCambiarEstado={panel.handleCambiarEstado}
              puedeCrear
              onCrearTarea={() => panel.setShowCrearTarea(true)}
              puedeEditar
              onEditarTarea={(t) => {
                //Preparo la tarea para editar en el modal
                panel.setTareaEditando({
                  ...t,
                  estado: textoEstado(t.estado),
                  prioridad: textoPrioridad(t.prioridad),
                  usuarioIds: Array.isArray(t.usuarioIds)
                    ? t.usuarioIds
                    : t.usuario_ids
                    ? t.usuario_ids
                        .split(",")
                        .map((n) => Number(n))
                        .filter((n) => !Number.isNaN(n))
                    : [],
                });
                panel.setShowEditarTarea(true);
              }}
              onSeleccionarTarea={(t) => {
                //Abro comentarios de la tarea
                panel.setTareaSeleccionada(t);
                panel.setVerComentarios(true);
              }}
            />
          </Col>
        </Row>

        {/*Modal de comentarios*/}
        <CommentsModal
          show={panel.verComentarios}
          tarea={panel.tareaSeleccionada}
          usuario={panel.usuario}
          onClose={() => {
            panel.setVerComentarios(false);
            panel.setTareaSeleccionada(null);
          }}
        />

        {/*Modal para crear tareas*/}
        <ModalTarea
          show={panel.showCrearTarea}
          titulo="Nueva tarea"
          tareaInicial={{
            titulo: "",
            descripcion: "",
            usuarioIds: [],
            prioridad: "Media",
            estado: "Pendiente",
          }}
          usuarios={panel.usuariosProyecto}
          usuariosAsignados={panel.usuariosProyecto.map((u) => u.id)}
          onClose={() => panel.setShowCrearTarea(false)}
          onSave={panel.handleCrearTarea}
        />
        {/*Modal para editar tareas*/}
        <ModalTarea
          show={panel.showEditarTarea}
          titulo="Editar tarea"
          tareaInicial={panel.tareaEditando}
          usuarios={panel.usuariosProyecto}
          usuariosAsignados={panel.usuariosProyecto.map((u) => u.id)}
          onClose={() => {
            panel.setShowEditarTarea(false);
            panel.setTareaEditando(null);
          }}
          onSave={panel.handleEditarTarea}
        />
      </Container>
    </Container>
  );
}


