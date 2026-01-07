//Herramientas para estado y efectos
import { useEffect, useState } from "react";
//Componentes para el modal y el formulario
import { Modal, Button, ListGroup, Form, Spinner, Alert } from "react-bootstrap";
//Llamadas al backend para comentarios
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
      {/*Cabecera del modal*/}
      <Modal.Header closeButton>
        <Modal.Title>Comentarios</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column gap-3">
        {/*Aviso si hay error*/}
        {error && <Alert variant="danger">{error}</Alert>}
        {/*Cargador mientras llegan los comentarios*/}
        {cargando && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}
        {/*Mensaje si no hay comentarios*/}
        {comentarios.length === 0 && <div className="text-muted">Sin comentarios.</div>}
        {/*Lista de comentarios*/}
        {comentarios.length > 0 && (
          <ListGroup>
            {comentarios.map((c, idx) => (
              <ListGroup.Item key={idx}>
                {/*Autor y contenido*/}
                <div className="fw-bold">{c.autor}</div>
                <div className="text-muted small">{c.texto}</div>
                {c.fecha_creacion && (
                  <div className="text-muted small">{c.fecha_creacion}</div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/*Formulario para escribir un comentario*/}
        <Form>
          <Form.Group>
            <Form.Label>Escribe un comentario</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Deja tu comentario aquí"
            />
          </Form.Group>
          {/*Boton para enviar*/}
          <div className="d-flex justify-content-end mt-2">
            <Button variant="primary" onClick={handleAdd} disabled={!texto.trim()}>
              Enviar
            </Button>
          </div>
        </Form>
      </Modal.Body>
      {/*Pie con cerrar*/}
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
