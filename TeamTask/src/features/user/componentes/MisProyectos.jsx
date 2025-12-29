import { Card, Button, Spinner } from "react-bootstrap";

export default function MisProyectos(props) {
  //Listo y selecciono los proyectos del usuario
  const proyectos = props.proyectos || [];
  const cargandoProyectos = props.cargandoProyectos;
  const proyectoSeleccionado = props.proyectoSeleccionado;
  const onSeleccionarProyecto = props.onSeleccionarProyecto;

  return (
    <Card className="custom-card h-100">
      <Card.Body>
        <Card.Title className="mb-3">Mis proyectos</Card.Title>

        {cargandoProyectos ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        ) : proyectos.length === 0 ? (
          <p className="text-muted">No tienes proyectos asignados todavia.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {proyectos.map((p) => (
              <Button
                key={p.id}
                variant={
                  proyectoSeleccionado && proyectoSeleccionado.id === p.id
                    ? "primary"
                    : "outline-primary"
                }
                className="text-start"
                onClick={() => onSeleccionarProyecto(p)}
              >
                <div className="fw-bold">{p.nombre}</div>
                {p.descripcion && (
                  <div className="small text-muted">{p.descripcion}</div>
                )}
              </Button>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
