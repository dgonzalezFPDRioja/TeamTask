import { Card, Row, Col, ListGroup, ProgressBar, Stack } from "react-bootstrap";

export default function PanelEstadisticas(props) {
  //Compongo las tarjetas de metricas y actividad reciente
  const stats = props.stats;
  const proyectos = props.proyectos;
  return (
    <div className="d-flex flex-column gap-3">
      <Row className="g-3">
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Proyectos</div>
            <div className="fw-bold fs-4">{stats.totalProyectos}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Usuarios</div>
            <div className="fw-bold fs-4">{stats.totalUsuarios}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Tareas abiertas</div>
            <div className="fw-bold fs-4">{stats.tareasAbiertas}</div>
            <ProgressBar
              now={stats.tareasAbiertas}
              max={Math.max(stats.tareasAbiertas, 1)}
              variant="warning"
              className="mt-2"
            />
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Usuarios por proyecto</div>
            <div className="fw-bold fs-4">{stats.usuariosPorProyecto}</div>
          </Card>
        </Col>
      </Row>

      <Card className="p-4 shadow-sm">
        <h5 className="mb-3">Actividad reciente</h5>
        <ListGroup>
          {proyectos.slice(0, 5).map((p) => (
            <ListGroup.Item key={p.id}>
              <div className="fw-bold">{p.nombre}</div>
              <div className="text-muted small">
                {(p.tareasAbiertas ?? 0) || 0} tareas abiertas / ultima actualizacion hoy
              </div>
            </ListGroup.Item>
          ))}
          {proyectos.length === 0 && (
            <ListGroup.Item className="text-muted">
              Sin datos de proyectos.
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      <Card className="p-4 shadow-sm">
        <h5 className="mb-2">Ideas de proximas metricas</h5>
        <Stack gap={2} className="mb-0">
          <div>• Tiempo medio de cierre de tareas.</div>
          <div>• Usuarios activos por semana.</div>
          <div>• Proyectos con mas actividad.</div>
          <div>• Tareas bloqueadas o con retraso.</div>
        </Stack>
      </Card>
    </div>
  );
}
