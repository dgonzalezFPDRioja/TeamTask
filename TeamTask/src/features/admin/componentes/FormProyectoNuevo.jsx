//Piezas visuales
import { Card, Alert, Form, Row, Col, FloatingLabel, Button } from "react-bootstrap";

export default function FormProyectoNuevo(props) {
  //Recibo datos del nuevo proyecto y manejo mensajes
  const nombreProyecto = props.nombreProyecto;
  const descripcionProyecto = props.descripcionProyecto;
  const mensaje = props.mensaje;
  const error = props.error;
  const onNombreProyecto = props.onNombreProyecto;
  const onDescripcionProyecto = props.onDescripcionProyecto;
  const onCrearProyecto = props.onCrearProyecto;
  const onClearAlerts = props.onClearAlerts;

  return (
    <Card className="p-4 shadow-sm">
      <h5 className="mb-3">Crear nuevo proyecto</h5>
      {/*Mensaje de exito*/}
      {mensaje && (
        <Alert variant="success" onClose={onClearAlerts} dismissible>
          {mensaje}
        </Alert>
      )}
      {/*Mensaje de error*/}
      {error && (
        <Alert variant="danger" onClose={onClearAlerts} dismissible>
          {error}
        </Alert>
      )}
      {/*Formulario principal*/}
      <Form onSubmit={onCrearProyecto}>
        <Row className="g-3">
          <Col md={6}>
            {/*Nombre del proyecto*/}
            <FloatingLabel label="Nombre">
              <Form.Control
                value={nombreProyecto}
                onChange={(e) => onNombreProyecto(e.target.value)}
                placeholder="Nuevo proyecto"
                required
              />
            </FloatingLabel>
          </Col>
          <Col md={6}>
            {/*Descripcion opcional*/}
            <FloatingLabel label="Descripción">
              <Form.Control
                value={descripcionProyecto}
                onChange={(e) => onDescripcionProyecto(e.target.value)}
                placeholder="Opcional"
              />
            </FloatingLabel>
          </Col>
        </Row>
        {/*Boton para crear*/}
        <div className="mt-3 d-flex justify-content-end">
          <Button type="submit">Crear</Button>
        </div>
      </Form>
    </Card>
  );
}
