import { ListGroup, Badge, ButtonGroup, Button } from "react-bootstrap";

export default function TareasProyecto(props) {
  //Listo tareas del proyecto y permito editar o eliminar
  const tareasProyecto = props.tareasProyecto || [];
  const asignaciones = props.asignaciones || {};
  const proyectoActivo = props.proyectoActivo;
  const onSetTareaEditando = props.onSetTareaEditando;
  const onShowModalEditarTarea = props.onShowModalEditarTarea;
  const onEliminarTarea = props.onEliminarTarea;

  return (
    <ListGroup>
      {tareasProyecto.map((t) => {
        const asignadosProyecto = asignaciones[proyectoActivo.id] || [];
        const idsTarea = (t.usuarioIds || []).filter((id) =>
          asignadosProyecto.includes(id)
        );
        const descripcionCorta = t.descripcion
          ? t.descripcion.length > 40
            ? `${t.descripcion.slice(0, 37)}...`
            : t.descripcion
          : "";
        const prioridadVariant =
          (t.prioridad || "").toLowerCase() === "alta"
            ? "danger"
            : (t.prioridad || "").toLowerCase() === "media"
            ? "warning"
            : "primary";
        const estadoVariant =
          (t.estado || "").toLowerCase() === "pendiente"
            ? "danger"
            : (t.estado || "").toLowerCase() === "en progreso"
            ? "warning"
            : (t.estado || "").toLowerCase() === "completada"
            ? "success"
            : "secondary";
        const mostrarEstado = (t.estado || "").toLowerCase() !== "en revision";
        return (
          <ListGroup.Item
            key={t.id}
            className="d-flex align-items-center gap-3 flex-wrap"
          >
            <div className="d-flex flex-column gap-1 flex-grow-1 min-width-0">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="fw-bold text-truncate">{t.titulo}</div>
                {t.descripcion && (
                  <div className="text-muted small text-truncate">
                    {descripcionCorta}
                  </div>
                )}
              </div>
            </div>
            <div
              className="d-flex align-items-center gap-2"
              style={{ minWidth: "150px" }}
            >
              <Badge bg={prioridadVariant}>{t.prioridad}</Badge>
              {mostrarEstado && <Badge bg={estadoVariant}>{t.estado}</Badge>}
            </div>
            <ButtonGroup size="sm">
              <Button
                variant="outline-primary"
                onClick={() => {
                  onSetTareaEditando({
                    ...t,
                    usuarioIds: idsTarea,
                  });
                  onShowModalEditarTarea(true);
                }}
              >
                Modificar
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => onEliminarTarea(proyectoActivo.id, t.id)}
              >
                X
              </Button>
            </ButtonGroup>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
