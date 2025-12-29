import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  ListGroup,
  Badge,
} from "react-bootstrap";
import FormNuevoUsuario from "./FormNuevoUsuario.jsx";
import DetalleUsuario from "./DetalleUsuario.jsx";

export default function PanelUsuarios(props) {
  //Gestiono el listado y edicion de usuarios desde el panel
  const usuarios = props.usuarios;
  const errorUsuario = props.errorUsuario;
  const usuarioSeleccionado = props.usuarioSeleccionado;
  const onSeleccionarUsuario = props.onSeleccionarUsuario;
  const onEliminarUsuario = props.onEliminarUsuario;
  const onActualizarUsuario = props.onActualizarUsuario;
  const nuevoUsuario = props.nuevoUsuario;
  const onNuevoUsuarioChange = props.onNuevoUsuarioChange;
  const onCrearUsuario = props.onCrearUsuario;
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    //Sincronizo el borrador cuando cambia la seleccion
    setDraft(usuarioSeleccionado || null);
  }, [usuarioSeleccionado]);

  const handleGuardar = () => {
    if (!draft) return;
    onActualizarUsuario("nombre", draft.nombre);
    onActualizarUsuario("correo", draft.correo);
    onActualizarUsuario("rol", draft.rol);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <FormNuevoUsuario
        nuevoUsuario={nuevoUsuario}
        onNuevoUsuarioChange={onNuevoUsuarioChange}
        onCrearUsuario={onCrearUsuario}
        errorUsuario={errorUsuario}
      />

      <Card className="p-4 shadow-sm">
        <h5 className="mb-3">Usuarios</h5>
          <Row className="g-3 align-items-stretch">
            <Col md={5}>
              <ListGroup>
                {usuarios.map((u) => (
                  <ListGroup.Item
                    key={u.id}
                  action
                  active={usuarioSeleccionado?.id === u.id}
                  className="d-flex justify-content-between align-items-center"
                  onClick={() => onSeleccionarUsuario(u)}
                >
                  <div>
                    <div className="fw-bold">{u.nombre}</div>
                    <div className="text-muted small">{u.correo}</div>
                  </div>
                  <Badge
                    bg={(u.rol || "").toUpperCase() === "ADMIN" ? "primary" : "secondary"}
                  >
                    {(u.rol || "").toUpperCase() === "ADMIN" ? "Admin" : "Usuario"}
                  </Badge>
                </ListGroup.Item>
              ))}
              {usuarios.length === 0 && (
                <ListGroup.Item className="text-muted">
                  No hay usuarios todavia.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>

          <Col md={7}>
            <DetalleUsuario
              draft={draft}
              setDraft={setDraft}
              usuarioSeleccionado={usuarioSeleccionado}
              onEliminarUsuario={onEliminarUsuario}
              onGuardar={handleGuardar}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
