//Herramientas para estado y efectos
import { useEffect, useState } from "react";
//Piezas visuales
import { Card, Row, Col, ListGroup, Badge } from "react-bootstrap";
//Form y detalle del usuario
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
  const onResetUsuarioContrasena = props.onResetUsuarioContrasena;
  const nuevoUsuario = props.nuevoUsuario;
  const onNuevoUsuarioChange = props.onNuevoUsuarioChange;
  const onCrearUsuario = props.onCrearUsuario;
  const onClearErrorUsuario = props.onClearErrorUsuario;
  const [draft, setDraft] = useState(null);
  const [mensajeEdicion, setMensajeEdicion] = useState("");

  useEffect(() => {
    //Sincronizo el borrador cuando cambia la seleccion
    setDraft(usuarioSeleccionado || null);
    setMensajeEdicion("");
  }, [usuarioSeleccionado]);

  const handleGuardar = async () => {
    //Guardo los cambios del usuario actual
    if (!draft || !usuarioSeleccionado) return;
    setMensajeEdicion("");
    const cambioNombre = draft.nombre !== usuarioSeleccionado.nombre;
    const cambioCorreo = draft.correo !== usuarioSeleccionado.correo;
    const cambioRol = draft.rol !== usuarioSeleccionado.rol;
    if (!cambioNombre && !cambioCorreo && !cambioRol) {
      setMensajeEdicion("No hay cambios para guardar.");
      return;
    }
    if (cambioNombre) {
      const ok = await onActualizarUsuario("nombre", draft.nombre);
      if (!ok) return;
    }
    if (cambioRol) {
      const ok = await onActualizarUsuario("rol", draft.rol);
      if (!ok) return;
    }
    if (cambioCorreo) {
      const ok = await onActualizarUsuario("correo", draft.correo);
      if (!ok) return;
    }
    setMensajeEdicion("Cambios guardados correctamente.");
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/*Formulario para crear usuario*/}
      <FormNuevoUsuario
        nuevoUsuario={nuevoUsuario}
        onNuevoUsuarioChange={onNuevoUsuarioChange}
        onCrearUsuario={onCrearUsuario}
        errorUsuario={errorUsuario}
        onClearError={onClearErrorUsuario}
      />

      <Card className="p-4 shadow-sm">
        <h5 className="mb-3">Usuarios</h5>
          <Row className="g-3 align-items-stretch">
            <Col md={5}>
              {/*Lista de usuarios*/}
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
                  {/*Rol en una etiqueta*/}
                  <Badge
                    bg={
                      (u.rol || "").toUpperCase() === "ADMIN"
                        ? "primary"
                        : (u.rol || "").toUpperCase() === "MANAGER"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {(u.rol || "").toUpperCase() === "ADMIN"
                      ? "Admin"
                      : (u.rol || "").toUpperCase() === "MANAGER"
                      ? "Manager"
                      : "Usuario"}
                  </Badge>
                </ListGroup.Item>
              ))}
              {/*Mensaje si no hay usuarios*/}
              {usuarios.length === 0 && (
                <ListGroup.Item className="text-muted">
                  No hay usuarios todavía.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>

          <Col md={7}>
            {/*Detalle del usuario seleccionado*/}
            <DetalleUsuario
              draft={draft}
              setDraft={setDraft}
              usuarioSeleccionado={usuarioSeleccionado}
              onEliminarUsuario={onEliminarUsuario}
              onGuardar={handleGuardar}
              onResetUsuarioContrasena={onResetUsuarioContrasena}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
