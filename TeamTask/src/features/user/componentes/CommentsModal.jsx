import { useEffect, useState } from "react";
import { Modal, Button, ListGroup, Form, Spinner, Alert } from "react-bootstrap";
import { getComentariosTarea, crearComentarioTarea } from "../../../services/api.jsx";

export default function CommentsModal(props) {
  //Controlo este modal desde props para visibilidad, tarea y callbacks
  const show = props.show;
  const onClose = props.onClose;
  const tarea = props.tarea || null;
  const usuario = props.usuario || {};

  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    //Cada vez que se abre el modal o cambia la tarea, pido los comentarios
    const fetchComentarios = async () => {
      if (!tarea) return;
      try {
        setError("");
        setCargando(true);
        const data = await getComentariosTarea(tarea.id);
        setComentarios(data || []);
      } catch (e) {
        setError(e.message || "No se pudieron cargar los comentarios");
      } finally {
        setCargando(false);
      }
    };
    if (show) fetchComentarios();
  }, [tarea?.id, show]);

  //Envio un comentario nuevo y lo agrego al listado local
  const handleAdd = async () => {
    if (!texto.trim() || !tarea) return;
    try {
      setError("");
      const res = await crearComentarioTarea(tarea.id, texto.trim());
      const nuevo = res?.comentario || {
        autor: usuario.nombre || "Yo",
        texto: texto.trim(),
        fecha_creacion: new Date().toISOString(),
      };
      setComentarios((prev) => [...prev, nuevo]);
      setTexto("");
    } catch (e) {
      setError(e.message || "No se pudo agregar el comentario");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Comentarios</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column gap-3">
        {error && <Alert variant="danger">{error}</Alert>}
        {cargando && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}
        {comentarios.length === 0 && <div className="text-muted">Sin comentarios.</div>}
        {comentarios.length > 0 && (
          <ListGroup>
            {comentarios.map((c, idx) => (
              <ListGroup.Item key={idx}>
                <div className="fw-bold">{c.autor || c.author || "Anonimo"}</div>
                <div className="text-muted small">{c.texto || c.contenido || c.comentario || c.text || ""}</div>
                {c.fecha_creacion && (
                  <div className="text-muted small">{c.fecha_creacion}</div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <Form>
          <Form.Group>
            <Form.Label>Escribe un comentario</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Deja tu comentario aqui"
            />
          </Form.Group>
          <div className="d-flex justify-content-end mt-2">
            <Button variant="primary" onClick={handleAdd} disabled={!texto.trim()}>
              Enviar
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
