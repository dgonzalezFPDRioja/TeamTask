//Piezas visuales basicas
import { Card, Button, Spinner } from "react-bootstrap";

export default function MisProyectos(props) {
  //Listo y selecciono los proyectos del usuario
  const proyectos = props.proyectos || [];
  const cargandoProyectos = props.cargandoProyectos;
  const proyectoSeleccionado = props.proyectoSeleccionado;
  const onSeleccionarProyecto = props.onSeleccionarProyecto;

  return (
    <Card className="custom-card">
      <Card.Body>
        {/*Titulo de la caja*/}
        <Card.Title className="mb-3">Mis proyectos</Card.Title>

        {cargandoProyectos ? (
          //Muestro un cargador mientras llega la lista
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        ) : proyectos.length === 0 ? (
          //Mensaje si no hay proyectos
          <p className="text-muted">No tienes proyectos asignados todavia.</p>
        ) : (
          //Lista de proyectos disponibles
          <div className="d-flex flex-column gap-2">
            {proyectos.map((p) => (
              <Button
                key={p.id}
                //Pinto el boton segun el seleccionado
                variant={
                  proyectoSeleccionado && proyectoSeleccionado.id === p.id
                    ? "primary"
                    : "outline-primary"
                }
                className="text-start"
                onClick={() => onSeleccionarProyecto(p)}
              >
                {/*Nombre y descripcion*/}
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
