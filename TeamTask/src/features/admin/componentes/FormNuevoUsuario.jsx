import { Card, Alert, Form, Row, Col, Button, FloatingLabel } from "react-bootstrap";

export default function FormNuevoUsuario(props) {
  //Creo usuarios nuevos con validaciones minimas
  const nuevoUsuario = props.nuevoUsuario;
  const onNuevoUsuarioChange = props.onNuevoUsuarioChange;
  const onCrearUsuario = props.onCrearUsuario;
  const errorUsuario = props.errorUsuario;

  return (
    <Card className="p-4 shadow-sm">
      <h5 className="mb-3">Crear usuario</h5>
      {errorUsuario && (
        <Alert variant="danger" className="mb-3">
          {errorUsuario}
        </Alert>
      )}
      <Form onSubmit={onCrearUsuario}>
        <Row className="g-3">
          <Col md={3}>
            <FloatingLabel label="Nombre">
              <Form.Control
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  onNuevoUsuarioChange((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                required
                placeholder="Nombre"
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Correo">
              <Form.Control
                type="email"
                value={nuevoUsuario.correo}
                onChange={(e) =>
                  onNuevoUsuarioChange((prev) => ({
                    ...prev,
                    correo: e.target.value,
                  }))
                }
                required
                placeholder="correo@correo.com"
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Contrasena">
              <Form.Control
                type="password"
                value={nuevoUsuario.contrasena}
                onChange={(e) =>
                  onNuevoUsuarioChange((prev) => ({
                    ...prev,
                    contrasena: e.target.value,
                  }))
                }
                required
                placeholder="••••••"
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Rol">
              <Form.Select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  onNuevoUsuarioChange((prev) => ({
                    ...prev,
                    rol: e.target.value,
                  }))
                }
              >
                <option value="USER">Usuario</option>
                <option value="ADMIN">Admin</option>
              </Form.Select>
            </FloatingLabel>
          </Col>
        </Row>
        <div className="mt-3 d-flex justify-content-end">
          <Button type="submit">Crear</Button>
        </div>
      </Form>
    </Card>
  );
}
