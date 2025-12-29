import { Card, Form, FloatingLabel, ButtonGroup, Button } from "react-bootstrap";

export default function DetalleUsuario(props) {
  //Mantengo un borrador editable del usuario seleccionado
  const draft = props.draft;
  const setDraft = props.setDraft;
  const usuarioSeleccionado = props.usuarioSeleccionado;
  const onEliminarUsuario = props.onEliminarUsuario;
  const onGuardar = props.onGuardar;

  if (!usuarioSeleccionado) {
    //Si no hay usuario, muestro un placeholder
    return (
      <div className="text-muted">
        Selecciona un usuario para ver su detalle.
      </div>
    );
  }

  return (
    <Card className="p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div className="fw-bold">{draft?.nombre || ""}</div>
          <div className="text-muted small">ID: {usuarioSeleccionado.id}</div>
        </div>
      </div>

      {/*//Edito nombre, correo y rol desde este formulario*/}
      <Form>
        <FloatingLabel label="Nombre" className="mb-3">
          <Form.Control
            value={draft?.nombre || ""}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Nombre"
          />
        </FloatingLabel>

        <FloatingLabel label="Correo" className="mb-3">
          <Form.Control
            type="email"
            value={draft?.correo || ""}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, correo: e.target.value }))
            }
            placeholder="correo@correo.com"
          />
        </FloatingLabel>

        <FloatingLabel label="Rol" className="mb-3">
          <Form.Select
            value={draft?.rol || "USER"}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, rol: e.target.value }))
            }
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Admin</option>
          </Form.Select>
        </FloatingLabel>

        <ButtonGroup className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-danger"
            onClick={() => onEliminarUsuario(usuarioSeleccionado.id)}
          >
            Eliminar
          </Button>
          <Button variant="primary" onClick={onGuardar}>
            Guardar
          </Button>
        </ButtonGroup>

        <p className="text-muted small mb-0 mt-2">
          Acciones futuras: resetear contrasena, bloquear acceso,
          ver actividad reciente.
        </p>
      </Form>
    </Card>
  );
}
