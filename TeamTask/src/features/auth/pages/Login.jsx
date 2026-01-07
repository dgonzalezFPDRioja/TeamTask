//Herramientas para manejar estado
import { useState } from "react";
//Piezas de la pantalla
import { Form, Button, Card, Alert, Container, Stack } from "react-bootstrap";
//Llamada al login del backend
import { loginRequest } from "../../../services/api.jsx";
//Logo
import teamtaskLogo from "../../../assets/appnofondo.png";

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

      //Llevo al panel segun el rol
      const rol = (data.usuario?.rol ?? "")
        .toString()
        .trim()
        .toUpperCase();
      if (rol === "ADMIN") {
        window.location.href = "/admin";
      } else if (rol === "MANAGER") {
        window.location.href = "/manager";
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
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card className="custom-card" style={{ width: "100%", maxWidth: "420px" }}>
        <Card.Body>
          {/*Logo del login*/}
          <img
            src={teamtaskLogo}
            alt="TeamTask"
            className="login-hero-image"
          />
          {/*Titulo*/}
          <Card.Title className="text-center mb-4">Iniciar sesión</Card.Title>

          {/*Mensaje si hay error*/}
          {error && <Alert variant="danger">{error}</Alert>}

          {/*Formulario de acceso*/}
          <Form onSubmit={handleSubmit}>
            <Stack gap={3}>
              <Form.Group>
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </Form.Group>

              {/*Boton principal*/}
              <Button type="submit" className="w-100" disabled={cargando}>
                {cargando ? "Entrando..." : "Entrar"}
              </Button>
            </Stack>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
