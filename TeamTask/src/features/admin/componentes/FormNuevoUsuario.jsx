//Piezas visuales
import { Card, Alert, Form, Row, Col, Button, FloatingLabel } from "react-bootstrap";
//Lista de roles disponibles
import { OPCIONES_ROL } from "../../../services/formateos.js";

export default function FormNuevoUsuario(props) {
  //Creo usuarios nuevos con validaciones minimas
  const nuevoUsuario = props.nuevoUsuario;
  const onNuevoUsuarioChange = props.onNuevoUsuarioChange;
  const onCrearUsuario = props.onCrearUsuario;
  const errorUsuario = props.errorUsuario;

  return (
    <Card className="p-4 shadow-sm">
      <h5 className="mb-3">Crear usuario</h5>
      {/*Mensaje de error*/}
      {errorUsuario && (
        <Alert variant="danger" className="mb-3">
          {errorUsuario}
        </Alert>
      )}
      {/*Formulario para crear usuario*/}
      <Form onSubmit={onCrearUsuario}>
        <Row className="g-3">
          <Col md={3}>
            {/*Nombre*/}
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
            {/*Correo*/}
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
            {/*Contraseña*/}
            <FloatingLabel label="Contraseña">
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
                placeholder="Contraseña"
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            {/*Rol*/}
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
                {OPCIONES_ROL.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
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




