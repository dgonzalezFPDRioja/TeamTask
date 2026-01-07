//Piezas visuales
import { Card, Row, Col, ListGroup, ProgressBar, Stack } from "react-bootstrap";

export default function PanelEstadisticas(props) {
  //Compongo las tarjetas de metricas y actividad reciente
  const stats = props.stats;
  const proyectos = props.proyectos;
  const tareas = props.tareas || {};
  return (
    <div className="d-flex flex-column gap-3">
      <Row className="g-3">
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            {/*Cantidad total de proyectos*/}
            <div className="text-muted small">Proyectos</div>
            <div className="fw-bold fs-4">{stats.totalProyectos}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            {/*Cantidad total de usuarios*/}
            <div className="text-muted small">Usuarios</div>
            <div className="fw-bold fs-4">{stats.totalUsuarios}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            {/*Tareas abiertas*/}
            <div className="text-muted small">Tareas abiertas</div>
            <div className="fw-bold fs-4">{stats.tareasAbiertas}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            {/*Porcentaje global de tareas completadas*/}
            <div className="text-muted small">% tareas completadas</div>
            <div className="fw-bold fs-4">
              {stats.porcentajeTareasCompletadas}%
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="p-4 shadow-sm">
        {/*Lista corta de proyectos con tareas abiertas*/}
        <h5 className="mb-3">Tareas por completar</h5>
        <ListGroup>
          {proyectos.slice(0, 5).map((p) => {
            const tareasProyecto = tareas[p.id] || [];
            const abiertas = tareasProyecto.filter(
              (t) => (t.estado || "").toLowerCase() !== "completada"
            ).length;
            return (
              <ListGroup.Item key={p.id}>
                <div className="fw-bold">{p.nombre}</div>
                <div className="text-muted small">
                  {abiertas} tareas abiertas
                </div>
              </ListGroup.Item>
            );
          })}
          {/*Mensaje si no hay proyectos*/}
          {proyectos.length === 0 && (
            <ListGroup.Item className="text-muted">
              Sin datos de proyectos.
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>
    </div>
  );
}
