<?php
// api/tareas.php
require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// --------- GET (listar / detalle) ----------
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        // una sola tarea
        $id = $_GET['id'];
        $stmt = $conn->prepare("SELECT * FROM tareas WHERE id = ?");
        $stmt->execute([$id]);
        $tarea = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($tarea) {
            echo json_encode($tarea);
        } else {
            http_response_code(404);
            echo json_encode(["mensaje" => "Tarea no encontrada"]);
        }
    } else {
        // todas las tareas
        $stmt = $conn->query("SELECT * FROM tareas ORDER BY id DESC");
        $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tareas);
    }
    exit;
}

// --------- POST (crear) ----------
if ($method === 'POST') {
    if (!isset($input['titulo']) || !isset($input['descripcion']) || !isset($input['estado'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Faltan campos obligatorios"]);
        exit;
    }

    $titulo = $input['titulo'];
    $descripcion = $input['descripcion'];
    $estado = $input['estado'];

    $stmt = $conn->prepare("INSERT INTO tareas (titulo, descripcion, estado) VALUES (?, ?, ?)");
    $stmt->execute([$titulo, $descripcion, $estado]);

    $id = $conn->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "id" => $id,
        "titulo" => $titulo,
        "descripcion" => $descripcion,
        "estado" => $estado
    ]);
    exit;
}

// --------- PUT (actualizar) ----------
if ($method === 'PUT') {
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el id de la tarea"]);
        exit;
    }

    $id = $input['id'];
    $titulo = $input['titulo'] ?? null;
    $descripcion = $input['descripcion'] ?? null;
    $estado = $input['estado'] ?? null;

    // comprobar que existe
    $stmt = $conn->prepare("SELECT * FROM tareas WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(["mensaje" => "Tarea no encontrada"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE tareas SET titulo = ?, descripcion = ?, estado = ? WHERE id = ?");
    $stmt->execute([$titulo, $descripcion, $estado, $id]);

    echo json_encode([
        "id" => $id,
        "titulo" => $titulo,
        "descripcion" => $descripcion,
        "estado" => $estado
    ]);
    exit;
}

// --------- DELETE (borrar) ----------
if ($method === 'DELETE') {
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el id de la tarea"]);
        exit;
    }

    $id = $input['id'];

    $stmt = $conn->prepare("DELETE FROM tareas WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["mensaje" => "Tarea no encontrada"]);
    } else {
        echo json_encode(["mensaje" => "Tarea eliminada correctamente"]);
    }
    exit;
}

// --------- Método no permitido ----------
http_response_code(405);
echo json_encode(["mensaje" => "Método no permitido"]);
