import { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { loginRequest } from "../../../services/api.jsx";

function Login() {
  //Manejo los campos y feedback del login
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    //Hago login, guardo token/usuario y redirijo segun rol
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await loginRequest(correo, contrasena);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

      const rol = (data.usuario.rol || "").toUpperCase();
      if (rol === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="custom-card"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <Card.Body>
          <Card.Title className="text-center mb-4">Iniciar sesion</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contrasena</Form.Label>
              <Form.Control
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={cargando}>
              {cargando ? "Entrando..." : "Entrar"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
