//Herramientas para estado
import { useState } from "react";
//Piezas visuales
import { Card, Form, FloatingLabel, ButtonGroup, Button } from "react-bootstrap";
//Lista de roles
import { OPCIONES_ROL } from "../../../services/formateos.js";

export default function DetalleUsuario(props) {
  //Mantengo un borrador editable del usuario seleccionado
  const draft = props.draft;
  const setDraft = props.setDraft;
  const usuarioSeleccionado = props.usuarioSeleccionado;
  const onEliminarUsuario = props.onEliminarUsuario;
  const onGuardar = props.onGuardar;
  const onResetUsuarioContrasena = props.onResetUsuarioContrasena;
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  if (!usuarioSeleccionado) {
    //Si no hay usuario, muestro un placeholder
    return (
      <div className="text-muted">
        Selecciona un usuario para ver su detalle.
      </div>
    );
  }

  const handleResetContrasena = async () => {
    //Cambio la contraseña con el texto nuevo
    if (!usuarioSeleccionado || !onResetUsuarioContrasena) return;
    const nueva = nuevaContrasena.trim();
    if (!nueva) return;
    await onResetUsuarioContrasena(usuarioSeleccionado.correo, nueva);
    setNuevaContrasena("");
  };

  return (
    <Card className="p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          {/*Nombre e id*/}
          <div className="fw-bold">{draft?.nombre || ""}</div>
          <div className="text-muted small">ID: {usuarioSeleccionado.id}</div>
        </div>
      </div>

      {/*Edito nombre, correo y rol desde este formulario*/}
      <Form>
        {/*Nombre*/}
        <FloatingLabel label="Nombre" className="mb-3">
          <Form.Control
            value={draft?.nombre || ""}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Nombre"
          />
        </FloatingLabel>

        {/*Correo*/}
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

        {/*Rol*/}
        <FloatingLabel label="Rol" className="mb-3">
          <Form.Select
            value={draft?.rol || "USUARIO"}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, rol: e.target.value }))
            }
          >
            {OPCIONES_ROL.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </FloatingLabel>

        {/*Nueva contraseña*/}
        <FloatingLabel label="Nueva contraseña" className="mb-3">
          <Form.Control
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            placeholder="Nueva contraseña"
          />
        </FloatingLabel>

        {/*Boton para resetear*/}
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="outline-warning"
            onClick={handleResetContrasena}
            disabled={!nuevaContrasena.trim()}
          >
            Resetear contraseña
          </Button>
        </div>

        {/*Acciones finales*/}
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
      </Form>
    </Card>
  );
}





