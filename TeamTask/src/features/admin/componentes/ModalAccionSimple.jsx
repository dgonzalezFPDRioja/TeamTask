import { Modal, Form, Button } from "react-bootstrap";

export default function ModalAccionSimple(props) {
  //Confirmar acciones o pedir nombre
  const show = props.show;
  const titulo = props.titulo;
  const descripcion = props.descripcion;
  const confirmLabel = props.confirmLabel || "Confirmar";
  const confirmVariant = props.confirmVariant || "primary";
  const onConfirm = props.onConfirm;
  const onClose = props.onClose;
  const inputLabel = props.inputLabel;
  const inputPlaceholder = props.inputPlaceholder;
  const inputValue = props.inputValue || "";
  const onInputChange = props.onInputChange;
  const inputAs = props.inputAs || "input";
  const confirmDisabled = props.confirmDisabled;

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (confirmDisabled) return;
    onConfirm(inputValue);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={manejarSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          {descripcion && <div>{descripcion}</div>}
          {inputLabel && (
            <Form.Group>
              <Form.Label>{inputLabel}</Form.Label>
              <Form.Control
                as={inputAs}
                rows={inputAs === "textarea" ? 3 : undefined}
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={confirmVariant}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
