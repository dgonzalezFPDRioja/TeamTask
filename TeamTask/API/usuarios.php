<?php
// api/usuarios.php
require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $stmt = $conn->prepare("SELECT id, nombre, email FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            echo json_encode($usuario);
        } else {
            http_response_code(404);
            echo json_encode(["mensaje" => "Usuario no encontrado"]);
        }
    } else {
        $stmt = $conn->query("SELECT id, nombre, email FROM usuarios ORDER BY id DESC");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($usuarios);
    }
    exit;
}

// Para DAW, puedes limitarte a GET y POST.
// Si quieres, añadimos POST/PUT/DELETE como en tareas.php.
http_response_code(405);
echo json_encode(["mensaje" => "Método no permitido"]);
