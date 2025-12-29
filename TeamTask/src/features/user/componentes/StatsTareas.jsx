import { Card, Row, Col } from "react-bootstrap";

export default function StatsTareas(props) {
  //Resumo las metricas basicas de las tareas del usuario
  const stats = props.stats || { pendientes: 0, enProgreso: 0, completadasSemana: 0 };
  return (
    <Row className="g-3 mb-3">
      <Col md={4}>
        <Card className="p-3 shadow-sm">
          <div className="text-muted small">Pendientes</div>
          <div className="fw-bold fs-4">{stats.pendientes}</div>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="p-3 shadow-sm">
          <div className="text-muted small">En progreso</div>
          <div className="fw-bold fs-4">{stats.enProgreso}</div>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="p-3 shadow-sm">
          <div className="text-muted small">Completadas (ultima semana)</div>
          <div className="fw-bold fs-4">{stats.completadasSemana}</div>
        </Card>
      </Col>
    </Row>
  );
}
