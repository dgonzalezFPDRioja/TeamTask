//Componentes de apoyo para la vista
import { Card, Spinner, Alert, Button, ListGroup, Badge } from "react-bootstrap";

export default function TareasProyectoTabla(props) {
  //Listo las tareas del proyecto y dejo cambiar su estado o ver comentarios
  const proyectoSeleccionado = props.proyectoSeleccionado;
  const tareas = props.tareas || [];
  const cargandoTareas = props.cargandoTareas;
  const error = props.error;
  const onCambiarEstado = props.onCambiarEstado;
  const onSeleccionarTarea = props.onSeleccionarTarea;
  const puedeCrear = props.puedeCrear;
  const onCrearTarea = props.onCrearTarea;
  const puedeEditar = props.puedeEditar;
  const onEditarTarea = props.onEditarTarea;

  const ordenarTareas = (lista) => {
    //Pongo un peso segun la prioridad para ordenar facil
    const prioridadPeso = (p) => {
      const v = (p || "").toLowerCase();
      if (v === "alta") return 0;
      if (v === "media") return 1;
      //Considero cualquier otra prioridad como baja
      return 2;
    };
    //Las completadas van al final
    const estadoPeso = (e) => ((e || "").toLowerCase() === "completada" ? 1 : 0);
    return [...lista].sort((a, b) => {
      const ea = estadoPeso(a.estado);
      const eb = estadoPeso(b.estado);
      //Ordeno incompletas primero y luego por prioridad
      if (ea !== eb) return ea - eb;
      return prioridadPeso(a.prioridad) - prioridadPeso(b.prioridad);
    });
  };

  return (
    <Card className="custom-card h-100">
      <Card.Body className="d-flex flex-column gap-3">
        {/*Cabecera con nombre del proyecto y boton de crear*/}
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">
            {proyectoSeleccionado
              ? `Tareas de: ${proyectoSeleccionado.nombre}`
              : "Selecciona un proyecto"}
          </div>
          {puedeCrear && proyectoSeleccionado && (
            <Button size="sm" onClick={onCrearTarea}>
              Crear tarea
            </Button>
          )}
        </div>

        {/*Aviso de error si algo falla*/}
        {error && <Alert variant="danger">{error}</Alert>}

        {/*Cargador mientras llega la lista*/}
        {cargandoTareas && proyectoSeleccionado && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}

        {/*Mensaje si no hay proyecto elegido*/}
        {!proyectoSeleccionado && (
          <p className="text-muted mb-0">
            Elige un proyecto de la lista de la izquierda.
          </p>
        )}

        {/*Mensaje si no hay tareas*/}
        {proyectoSeleccionado && !cargandoTareas && tareas.length === 0 && (
          <p className="text-muted mb-0">Este proyecto todavia no tiene tareas.</p>
        )}

        {/*Lista de tareas cuando ya hay datos*/}
        {proyectoSeleccionado && tareas.length > 0 && !cargandoTareas && (
          <>
            <div className="task-badge-labels d-flex justify-content-end gap-3 text-uppercase text-muted mb-1">
              <div className="task-badge-label">Prioridad</div>
              <div className="task-badge-label">Estado</div>
            </div>
            <ListGroup>
              {ordenarTareas(tareas).map((t) => {
              //Color y texto segun prioridad
              const prioridadVariant =
                (t.prioridad || "").toLowerCase() === "alta"
                  ? "danger"
                  : (t.prioridad || "").toLowerCase() === "media"
                  ? "warning"
                  : "primary";
              //Color y texto segun estado
              const estadoLower = (t.estado || "").toLowerCase();
              const estadoVariant =
                estadoLower === "completada"
                  ? "success"
                  : estadoLower === "en progreso" || estadoLower === "en_progreso"
                  ? "warning"
                  : "danger";
              const esCompletada = (t.estado || "").toLowerCase() === "completada";
              const estadoTexto = () => {
                //Texto bonito para mostrar
                const e = (t.estado || "").toLowerCase();
                if (e === "en progreso" || e === "en_progreso") return "En progreso";
                if (e === "completada") return "Completada";
                return "Pendiente";
              };
              const prioridadTexto = () => {
                //Texto bonito para prioridad
                const p = (t.prioridad || "").toLowerCase();
                if (p === "alta") return "Alta";
                if (p === "media") return "Media";
                return "Baja";
              };
              //Color suave de fondo segun estado
              const fondo =
                esCompletada
                  ? "bg-light text-muted"
                  : estadoLower === "en progreso" || estadoLower === "en_progreso"
                  ? "bg-warning-subtle"
                  : "bg-danger-subtle";
              return (
                <ListGroup.Item
                  key={t.id}
                  className={`d-flex flex-column gap-2 ${fondo}`}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="me-auto">
                      {/*Titulo y datos basicos*/}
                      <div className="fw-bold">{t.titulo}</div>
                      {t.descripcion && (
                        <div className="text-muted small">{t.descripcion}</div>
                      )}
                      {t.fecha_limite && (
                        <div className="text-muted small">
                          Fecha limite:{" "}
                          {new Date(t.fecha_limite).toLocaleDateString("es-ES")}
                        </div>
                      )}
                    </div>
                    <div className="task-badges d-flex gap-3 flex-wrap align-self-center">
                      {/*Etiquetas de prioridad y estado*/}
                      <Badge bg={prioridadVariant} className="task-badge">
                        {prioridadTexto()}
                      </Badge>
                      <Badge bg={estadoVariant} className="task-badge">
                        {estadoTexto()}
                      </Badge>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {(() => {
                      //Boton para pasar de pendiente a progreso o completada
                      const estadoLower = (t.estado || "").toLowerCase();
                      const estaCompletada = estadoLower === "completada";
                      const estaEnProgreso =
                        estadoLower === "en progreso" || estadoLower === "en_progreso";
                      const nextEstado = estaEnProgreso ? "Completada" : "En progreso";
                      const label = estaCompletada
                        ? "Completada"
                        : estaEnProgreso
                        ? "Marcar completada"
                        : "Marcar en progreso";
                      const variant = estaCompletada
                        ? "success"
                        : estaEnProgreso
                        ? "success"
                        : "warning";
                      return (
                        <Button
                          variant={`outline-${variant}`}
                          size="sm"
                          disabled={estaCompletada}
                          onClick={() => {
                            if (estaCompletada) return;
                            onCambiarEstado(t.id, nextEstado);
                          }}
                        >
                          {label}
                        </Button>
                      );
                    })()}
                    {/*Editar solo si se permite*/}
                    {puedeEditar && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEditarTarea && onEditarTarea(t)}
                      >
                        Editar
                      </Button>
                    )}
                    {/*Abrir comentarios*/}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onSeleccionarTarea && onSeleccionarTarea(t)}
                    >
                      Comentarios
                    </Button>
                  </div>
                </ListGroup.Item>
              );
            })}
            </ListGroup>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
