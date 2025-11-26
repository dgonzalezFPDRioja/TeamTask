<?php
//API para las tareas de la base de datos

require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';
//require_once 'auth_middleware.php';
$creador_id = 1;
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//*****GET | Listar las tareas de un usuario
if ($metodo === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'mis') {
    try {
        //Usuario autenticado
        $usuario_id = $creador_id; //getUserIdFromToken($conn);

        //Snetencia SQL
        $sentSQL = $conn->prepare("SELECT t.* FROM tareas t INNER JOIN tareas_asignadas ta ON t.id = ta.tarea_id WHERE ta.usuario_id = ? ORDER BY t.fecha_creacion DESC");

        $sentSQL->execute([$usuario_id]);
        $tareas = $sentSQL->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($tareas);
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error obteniendo las tareas",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****GET | Listar las tareas con id concreto
if ($metodo === 'GET') {
    if (isset($_GET['id'])) {
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

//*****POST | Asignar una tarea a un usuario
if ($metodo === 'POST' && isset($_GET['accion']) && $_GET['accion'] === 'asignar') {

    //Usuario autenticado
    $usuario_id = $creador_id; //getUserIdFromToken($conn);

    $tarea_id   = $input['tarea_id']   ?? null;
    $usuario_id = $input['usuario_id'] ?? null;

    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("INSERT INTO tareas_asignadas (tarea_id, usuario_id) VALUES (?, ?)");
        $sentSQL->execute([$tarea_id, $usuario_id]);
        //Mensaje de asignacion correcta
        http_response_code(201);
        echo json_encode([
            "mensaje" => "Usuario asignado a la tarea",
            "asignacion" => [
                "tarea_id"   => (int)$tarea_id,
                "usuario_id" => (int)$usuario_id
            ]
        ]);
        exit;

    } catch (PDOException $e) {
        //Mensaje de error
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error asignando la tarea",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****POST | Crear una tarea
if ($metodo === 'POST') {
    //Usuario autenticado
    $usuario_id = $creador_id; //getUserIdFromToken($conn);

    if (empty($input['titulo'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el nombre"]);
        exit;
    }

    $proyecto_id   = $input['proyecto_id'] ?? null;
    $titulo        = isset($input['titulo']) ? trim($input['titulo']) : null;
    $descripcion   = isset($input['descripcion']) ? trim($input['descripcion']) : null;
    //Se pone estado como pendiente
    $estado        = $input['estado'] ?? 'pendiente';
    //Si no tiene prioridad asignada se pone como media
    $prioridad     = $input['prioridad'] ?? 'media';
    $fecha_limite  = $input['fecha_limite'] ?? null;

    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado, prioridad, fecha_limite, creador_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $sentSQL->execute([$proyecto_id,$titulo,$descripcion,$estado,$prioridad,$fecha_limite,$creador_id]);
        $tarea_id = $conn->lastInsertId();
        //Mensaje para la creacion correcta de la tarea
        http_response_code(201);
        echo json_encode([
            "mensaje" => "Tarea creada correctamente",
            "tarea" => [
                "proyecto_id"=> $proyecto_id,
                "titulo"=> $titulo,
                "descripcion"=> $descripcion,
                "estado"=> $estado,
                "prioridad"=> $prioridad,
                "fecha_limite"=> $fecha_limite,
                "creador_id"=> $creador_id
            ]
        ]);
        exit;
    } catch (PDOException $e) {
        //Mensaje de error
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error creando la tarea",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}


//*****PUT
if ($metodo === 'PUT') {
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el id de la tarea"]);
        exit;
    }

    $id = $input['id'];
    $titulo = $input['titulo'] ?? null;
    $descripcion = $input['descripcion'] ?? null;
    $estado = $input['estado'] ?? null;

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

//*****DELETE | Borrar asignacion de tarea
if ($metodo === 'DELETE' && isset($_GET['accion']) && $_GET['accion'] === 'desasignar') {
    //Usuario autenticado
    $usuario_id = $creador_id; //getUserIdFromToken($conn);

    //Pillo tarea y usuario
    $tarea_id = $input['tarea_id'];
    $usuario_id = $input['usuario_id'];

    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("DELETE FROM tareas_asignadas WHERE tarea_id = ? AND usuario_id = ?");
        $sentSQL->execute([$tarea_id, $usuario_id]);

        //Mensaje de eliminacion correcta
        http_response_code(200);
        echo json_encode([
            "mensaje" => "Asignación eliminada correctamente",
            "tarea_id" => $tarea_id,
            "usuario_id" => $usuario_id
        ]);
        exit;
        
    } catch (PDOException $e) {
        //Mensaje de error
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error eliminando la asignacion",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}


//*****DELETE | Borrar tarea
if ($metodo === 'DELETE') {
    $tarea_id = $input['tarea_id'];

    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("DELETE FROM tareas WHERE id = ?");
        $sentSQL->execute([$tarea_id]);

        //Mensaje de eliminacion correcta
        http_response_code(200);
        echo json_encode([
            "mensaje" => "Tarea eliminada correctamente",
            "tarea_id" => $tarea_id,
        ]);
        exit;
    } catch (PDOException $e) {
        //Mensaje de error
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error eliminando la tarea",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****Método no permitido
http_response_code(405);
echo json_encode(["mensaje" => "Método no permitido"]);
