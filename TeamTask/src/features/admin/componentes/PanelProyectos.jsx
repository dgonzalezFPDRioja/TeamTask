import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Accordion,
} from "react-bootstrap";
import ModalTarea from "./ModalTarea.jsx";
import TareasProyecto from "./TareasProyecto.jsx";
import UsuariosProyecto from "./UsuariosProyecto.jsx";
import FormProyectoNuevo from "./FormProyectoNuevo.jsx";
import ListaProyectos from "./ListaProyectos.jsx";

export default function PanelProyectos(props) {
  //Administro proyectos: listado, detalle, tareas y usuarios asignados
  const proyectos = props.proyectos;
  const proyectoActivo = props.proyectoActivo;
  const tabProyecto = props.tabProyecto;
  const usuarios = props.usuarios;
  const tareas = props.tareas;
  const asignaciones = props.asignaciones;
  const nombreProyecto = props.nombreProyecto;
  const descripcionProyecto = props.descripcionProyecto;
  const mensaje = props.mensaje;
  const error = props.error;
  const onNombreProyecto = props.onNombreProyecto;
  const onDescripcionProyecto = props.onDescripcionProyecto;
  const onCrearProyecto = props.onCrearProyecto;
  const onEliminarProyecto = props.onEliminarProyecto;
  const onRenombrarProyecto = props.onRenombrarProyecto;
  const onClearAlerts = props.onClearAlerts;
  const onSeleccionarProyecto = props.onSeleccionarProyecto;
  const onAsignarUsuario = props.onAsignarUsuario;
  const onDesasignarUsuario = props.onDesasignarUsuario;
  const onSetTabProyecto = props.onSetTabProyecto;
  const onActualizarTarea = props.onActualizarTarea;
  const onShowModalTarea = props.onShowModalTarea;
  const nuevaTarea = props.nuevaTarea;
  const showModalTarea = props.showModalTarea;
  const onCrearTarea = props.onCrearTarea;
  const onEliminarTarea = props.onEliminarTarea;
  const onShowModalEditarTarea = props.onShowModalEditarTarea;
  const onSetTareaEditando = props.onSetTareaEditando;
  const showModalEditarTarea = props.showModalEditarTarea;
  const tareaEditando = props.tareaEditando;

  const tareasProyecto = proyectoActivo ? tareas[proyectoActivo.id] || [] : [];
  const usuariosAsignados = proyectoActivo
    ? asignaciones[proyectoActivo.id] || []
    : [];

  return (
    <div className="d-flex flex-column gap-3">
      <FormProyectoNuevo
        nombreProyecto={nombreProyecto}
        descripcionProyecto={descripcionProyecto}
        mensaje={mensaje}
        error={error}
        onNombreProyecto={onNombreProyecto}
        onDescripcionProyecto={onDescripcionProyecto}
        onCrearProyecto={onCrearProyecto}
        onClearAlerts={onClearAlerts}
      />

      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Proyectos</h5>
          <div className="text-muted small">{proyectos.length} proyecto(s)</div>
        </div>
        <Row className="g-3">
          <Col md={5}>
            <ListaProyectos
              proyectos={proyectos}
              proyectoActivo={proyectoActivo}
              tareas={tareas}
              onSeleccionarProyecto={onSeleccionarProyecto}
            />
          </Col>

          <Col md={7}>
            {!proyectoActivo && (
              <div className="text-muted">Selecciona un proyecto para administrar.</div>
            )}

            {proyectoActivo && (
              <Card className="p-3 h-100 shadow-sm">
                <Accordion
                  activeKey={tabProyecto}
                  onSelect={(key) => onSetTabProyecto(key || "tareas")}
                  className="mb-3"
                >
                  <Accordion.Item eventKey="tareas">
                    <Accordion.Header>Tareas</Accordion.Header>
                    <Accordion.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold">Tareas del proyecto</div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            onShowModalTarea(true);
                          }}
                        >
                          Crear tarea
                        </Button>
                      </div>
                      {tareasProyecto.length === 0 ? (
                        <div className="text-muted">No hay tareas en este proyecto.</div>
                      ) : (
                        <TareasProyecto
                          tareasProyecto={tareasProyecto}
                          asignaciones={asignaciones}
                          proyectoActivo={proyectoActivo}
                          onSetTareaEditando={onSetTareaEditando}
                          onShowModalEditarTarea={onShowModalEditarTarea}
                          onEliminarTarea={onEliminarTarea}
                        />
                      )}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="usuarios">
                    <Accordion.Header>Usuarios del proyecto</Accordion.Header>
                    <Accordion.Body>
                      <UsuariosProyecto
                        usuariosAsignados={usuariosAsignados}
                        usuarios={usuarios}
                        proyectoActivo={proyectoActivo}
                        onDesasignarUsuario={onDesasignarUsuario}
                        onAsignarUsuario={onAsignarUsuario}
                      />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="config">
                    <Accordion.Header>Configuracion</Accordion.Header>
                    <Accordion.Body>
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="outline-secondary"
                          onClick={() =>
                            onRenombrarProyecto(proyectoActivo.id, proyectoActivo.nombre)
                          }
                        >
                          Renombrar proyecto
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => onEliminarProyecto(proyectoActivo.id)}
                        >
                          Eliminar proyecto
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      <ModalTarea
        key={proyectoActivo?.id || "crear-tarea"}
        show={showModalTarea}
        titulo="Nueva tarea"
        tareaInicial={nuevaTarea}
        usuariosAsignados={asignaciones[proyectoActivo?.id] || []}
        usuarios={usuarios}
        onClose={() => onShowModalTarea(false)}
        onSave={(data) => {
          onCrearTarea(data);
          onShowModalTarea(false);
        }}
      />

      <ModalTarea
        key={tareaEditando?.id || "editar-tarea"}
        show={showModalEditarTarea}
        titulo="Modificar tarea"
        tareaInicial={tareaEditando}
        usuariosAsignados={asignaciones[proyectoActivo?.id] || []}
        usuarios={usuarios}
        onClose={() => {
          onShowModalEditarTarea(false);
          onSetTareaEditando(null);
        }}
        onSave={(data) => {
          if (!tareaEditando || !proyectoActivo) return;
          onActualizarTarea(proyectoActivo.id, tareaEditando.id, data);
          onShowModalEditarTarea(false);
          onSetTareaEditando(null);
        }}
      />
    </div>
  );
}
