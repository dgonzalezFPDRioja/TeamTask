import { Card, Spinner, Alert, Button, ListGroup, Badge } from "react-bootstrap";

export default function TareasProyectoTabla(props) {
  //Listo tareas del proyecto seleccionado y permito cambiar estado/comentarlas
  const proyectoSeleccionado = props.proyectoSeleccionado;
  const tareas = props.tareas || [];
  const cargandoTareas = props.cargandoTareas;
  const error = props.error;
  const onCambiarEstado = props.onCambiarEstado;
  const onSeleccionarTarea = props.onSeleccionarTarea;

  const ordenarTareas = (lista) => {
    const prioridadPeso = (p) => {
      const v = (p || "").toLowerCase();
      if (v === "alta") return 0;
      if (v === "media") return 1;
      //Considero cualquier otra prioridad como baja
      return 2;
    };
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
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">
            {proyectoSeleccionado
              ? `Tareas de: ${proyectoSeleccionado.nombre}`
              : "Selecciona un proyecto"}
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {cargandoTareas && proyectoSeleccionado && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}

        {!proyectoSeleccionado && (
          <p className="text-muted mb-0">Elige un proyecto de la lista de la izquierda.</p>
        )}

        {proyectoSeleccionado && !cargandoTareas && tareas.length === 0 && (
          <p className="text-muted mb-0">Este proyecto todavia no tiene tareas.</p>
        )}

        {proyectoSeleccionado && tareas.length > 0 && !cargandoTareas && (
          <ListGroup>
            {ordenarTareas(tareas).map((t) => {
              const prioridadVariant =
                (t.prioridad || "").toLowerCase() === "alta"
                  ? "danger"
                  : (t.prioridad || "").toLowerCase() === "media"
                  ? "warning"
                  : "primary";
              const estadoLower = (t.estado || "").toLowerCase();
              const estadoVariant =
                estadoLower === "completada"
                  ? "success"
                  : estadoLower === "en progreso" || estadoLower === "en_progreso"
                  ? "warning"
                  : "danger";
              const esCompletada = (t.estado || "").toLowerCase() === "completada";
              const estadoTexto = () => {
                const e = (t.estado || "").toLowerCase();
                if (e === "en progreso" || e === "en_progreso") return "En progreso";
                if (e === "completada") return "Completada";
                return "Pendiente";
              };
              const prioridadTexto = () => {
                const p = (t.prioridad || "").toLowerCase();
                if (p === "alta") return "Alta";
                if (p === "media") return "Media";
                return "Baja";
              };
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
                  onClick={() => onSeleccionarTarea && onSeleccionarTarea(t)}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="me-auto">
                      <div className="fw-bold">{t.titulo}</div>
                      {t.descripcion && (
                        <div className="text-muted small">{t.descripcion}</div>
                      )}
                      {t.fecha_limite && (
                        <div className="text-muted small">Fecha límite: {t.fecha_limite}</div>
                      )}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge bg={prioridadVariant}>{prioridadTexto()}</Badge>
                      <Badge bg={estadoVariant}>{estadoTexto()}</Badge>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {(() => {
                      const estadoLower = (t.estado || "").toLowerCase();
                      const estaCompletada = estadoLower === "completada";
                      const estaEnProgreso = estadoLower === "en progreso" || estadoLower === "en_progreso";
                      const nextEstado = estaEnProgreso ? "Completada" : "En progreso";
                      const label = estaCompletada
                        ? "Completada"
                        : estaEnProgreso
                        ? "Marcar completada"
                        : "Marcar en progreso";
                      const variant = estaCompletada
                        ? "success"
                        : estaEnProgreso
                        ? "warning"
                        : "primary";
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
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}
