//Piezas visuales
import { Card, ListGroup, Badge } from "react-bootstrap";

export default function ListaProyectos(props) {
  //Muestro proyectos disponibles y permito seleccionar uno
  const proyectos = props.proyectos || [];
  const proyectoActivo = props.proyectoActivo;
  const tareas = props.tareas || {};
  const onSeleccionarProyecto = props.onSeleccionarProyecto;

  if (proyectos.length === 0) {
    //Mensaje si no hay proyectos
    return (
      <Card className="p-3">
        <div className="text-muted">No hay proyectos todavia.</div>
      </Card>
    );
  }

  return (
    <ListGroup>
      {proyectos.map((p) => {
        //Calculo tareas abiertas por proyecto
        const abiertas = (tareas[p.id] || []).filter(
          (t) => (t.estado || "").toLowerCase() !== "completada"
        ).length;
        return (
          <ListGroup.Item
            key={p.id}
            action
            active={proyectoActivo?.id === p.id}
            onClick={() => onSeleccionarProyecto(p)}
            className="d-flex justify-content-between align-items-start gap-2"
          >
            <div className="me-auto">
              {/*Nombre y descripcion*/}
              <div className="fw-bold">{p.nombre}</div>
              <div className="text-muted small">
                {p.descripcion || "Sin descripcion"}
              </div>
            </div>
            {/*Contador simple*/}
            <Badge bg="secondary">{abiertas} abiertas</Badge>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
