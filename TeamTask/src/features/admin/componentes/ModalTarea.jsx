//Herramientas para estado y efectos
import { useEffect, useState } from "react";
//Piezas del modal
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

export default function ModalTarea(props) {
  //Administro el formulario de crear/editar tarea dentro de un modal
  const show = props.show;
  const onClose = props.onClose;
  const onSave = props.onSave;
  const titulo = props.titulo || "Tarea";
  const tareaInicial = props.tareaInicial;
  const usuariosAsignados = props.usuariosAsignados || [];
  const usuarios = props.usuarios || [];
  const vacio = {
    titulo: "",
    descripcion: "",
    usuarioIds: [],
    prioridad: "Media",
    estado: "Pendiente",
    fecha_limite: "",
  };
  const [form, setForm] = useState(vacio);
  const [usuarioAAgregar, setUsuarioAAgregar] = useState("");
  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    //Sincronizo el formulario con la tarea inicial al abrir
    setForm(
      tareaInicial
        ? { ...vacio, ...tareaInicial, usuarioIds: tareaInicial.usuarioIds || [] }
        : vacio
    );
    setUsuarioAAgregar("");
  }, [tareaInicial, show]);

  const manejarEnvio = (e) => {
    //Envio el formulario y valido la fecha
    e.preventDefault();
    if (form.fecha_limite && form.fecha_limite < hoy) {
      return;
    }
    const usuarioIds = (form.usuarioIds || []).filter((id) =>
      usuariosAsignados.includes(id)
    );
    onSave({ ...form, usuarioIds });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={manejarEnvio}>
        {/*Cabecera*/}
        <Modal.Header closeButton>
          <Modal.Title>{titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          {/*Campo de titulo*/}
          <Form.Group>
            <Form.Label>Título</Form.Label>
            <Form.Control
              value={form.titulo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, titulo: e.target.value }))
              }
              required
            />
          </Form.Group>
          {/*Campo de descripcion*/}
          <Form.Group>
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.descripcion}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descripcion: e.target.value }))
              }
            />
          </Form.Group>
          {/*Asignaciones de usuarios*/}
          <Form.Group>
            <Form.Label>Usuarios asignados</Form.Label>
            <div className="d-flex flex-column gap-2">
              {(form.usuarioIds || []).length === 0 && (
                <div className="text-muted small">
                  La tarea no tiene usuarios asignados.
                </div>
              )}
              {(form.usuarioIds || [])
                .filter((id) => usuariosAsignados.includes(id))
                .map((id) => {
                  const u = usuarios.find((usr) => usr.id === id);
                  if (!u) return null;
                  return (
                    <div
                      key={id}
                      className="d-flex justify-content-between align-items-center border rounded px-2 py-1"
                    >
                      <div className="small fw-semibold">{u.nombre}</div>
                      {/*Boton para quitar usuario*/}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            usuarioIds: (prev.usuarioIds || []).filter(
                              (uid) => uid !== id
                            ),
                          }))
                        }
                      >
                        Eliminar
                      </Button>
                    </div>
                  );
                })}

              <div className="d-flex gap-2 align-items-center">
                {/*Selector para agregar usuario*/}
                <Form.Select
                  value={usuarioAAgregar}
                  onChange={(e) => setUsuarioAAgregar(e.target.value)}
                >
                  <option value="">Agregar usuario del proyecto...</option>
                  {usuariosAsignados
                    .filter(
                      (id) =>
                        !(form.usuarioIds || []).includes(id) &&
                        usuarios.some((usr) => usr.id === id)
                    )
                    .map((id) => {
                      const u = usuarios.find((usr) => usr.id === id);
                      if (!u) return null;
                      return (
                        <option key={id} value={id}>
                          {u.nombre}
                        </option>
                      );
                    })}
                </Form.Select>
                {/*Boton para agregar*/}
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={() => {
                    const id = Number(usuarioAAgregar);
                    if (!id || !usuariosAsignados.includes(id)) return;
                    setForm((prev) => {
                      const actual = new Set(prev.usuarioIds || []);
                      actual.add(id);
                      return { ...prev, usuarioIds: Array.from(actual) };
                    });
                    setUsuarioAAgregar("");
                  }}
                >
                  Añadir
                </Button>
              </div>
            </div>
          </Form.Group>
          <Row className="g-2">
            <Col>
              <Form.Group>
                <Form.Label>Prioridad</Form.Label>
                {/*Selector de prioridad*/}
                <Form.Select
                  value={form.prioridad}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, prioridad: e.target.value }))
                  }
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                {/*Selector de estado*/}
                <Form.Select
                  value={form.estado}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, estado: e.target.value }))
                  }
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completada">Completada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Fecha límite</Form.Label>
                {/*Selector de fecha*/}
                <Form.Control
                  type="date"
                  value={form.fecha_limite || ""}
                  min={hoy}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fecha_limite: e.target.value }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {/*Botones finales*/}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
