//Piezas visuales
import { ListGroup, Badge, Button, Form } from "react-bootstrap";

export default function UsuariosProyecto(props) {
  //Muestro usuarios asignados y gestiono asignaciones nuevas
  const usuariosAsignados = props.usuariosAsignados || [];
  const usuarios = props.usuarios || [];
  const proyectoActivo = props.proyectoActivo;
  const onDesasignarUsuario = props.onDesasignarUsuario;
  const onAsignarUsuario = props.onAsignarUsuario;

  return (
    <>
      {/*Mensaje si no hay usuarios asignados*/}
      {usuariosAsignados.length === 0 && (
        <div className="text-muted">No hay usuarios asignados a este proyecto.</div>
      )}
      {/*Lista de usuarios asignados*/}
      {usuariosAsignados.length > 0 && (
        <ListGroup>
          {usuariosAsignados.map((id) => {
            const u = usuarios.find((usr) => usr.id === id);
            if (!u) return null;
            return (
              <ListGroup.Item
                key={id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{u.nombre}</div>
                  <div className="text-muted small">{u.correo}</div>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  {/*Rol en etiqueta*/}
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
                  {/*Boton para quitar*/}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onDesasignarUsuario(proyectoActivo.id, id)}
                  >
                    Desasignar
                  </Button>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}

      {/*Formulario para asignar usuario*/}
      <Form
        className="mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          const id = Number(e.target.usuarioId.value);
          if (!id) return;
          onAsignarUsuario(proyectoActivo.id, id);
          e.target.usuarioId.value = "";
        }}
      >
        <div className="d-flex gap-2">
          {/*Selector de usuario*/}
          <Form.Select name="usuarioId" defaultValue="">
            <option value="">Asignar usuario...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.rol})
              </option>
            ))}
          </Form.Select>
          {/*Boton para asignar*/}
          <Button type="submit" variant="primary">
            Asignar
          </Button>
        </div>
      </Form>
    </>
  );
}
