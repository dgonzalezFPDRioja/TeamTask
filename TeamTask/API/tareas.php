<?php
//API para las tareas de la base de datos

//Incluyo archivos php cabeceras/conexion/autenticación
require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/autenticacion.php';

//Consigo los datos del usuario logueado
$usuarioLogueado = getUsuarioDeToken($conn);
$rol = $usuarioLogueado['rol'];

//Leo el metodo utilizado de peticion, leo la peticion y lo convierto en array
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//*****GET | Listar las tareas de un usuario
if ($metodo === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'mis') {
    try {
        //Snetencia SQL
        $sentSQL = $conn->prepare("SELECT t.* FROM tareas t 
        INNER JOIN tareas_asignadas ta ON t.id = ta.tarea_id 
        WHERE ta.usuario_id = ? ORDER BY t.fecha_creacion DESC");
        $sentSQL->execute([$usuarioLogueado['id']]);
        $tareas = $sentSQL->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($tareas);
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error obteniendo las tareas",
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****GET | Tareas asignadas al usuario en proyecto
if ($metodo === 'GET' && isset($_GET['proyecto_id'])) {
    //id del proyecto pasado
    $proyectoId = $_GET['proyecto_id'];
    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("SELECT t.* FROM tareas t
        INNER JOIN tareas_asignadas ta ON t.id = ta.tarea_id
        WHERE t.proyecto_id = ? AND ta.usuario_id = ? ORDER BY t.id DESC");
        $sentSQL->execute([$proyectoId, $usuarioLogueado['id']]);
        $tareas = $sentSQL->fetchAll(PDO::FETCH_ASSOC);
        //Paso las tareas
        echo json_encode($tareas);
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error obteniendo las tareas",
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****GET | Informacion de la tarea por ID
if ($metodo === 'GET' && isset($_GET['id'])) {
    //Id de la tarea pasada
    $tareaId = $_GET['id'];
    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("SELECT * FROM tareas WHERE id = ?");
        $sentSQL->execute([$tareaId]);
        $tarea = $sentSQL->fetch(PDO::FETCH_ASSOC);
        //Paso la tarea, si no encuentro mando un error
        if ($tarea) {
            echo json_encode($tarea);
        } else {
            http_response_code(404);
            echo json_encode(["mensaje" => "Tarea no encontrada"]);
        }
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error obteniendo las tareas",
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****POST | Asignar una tarea a un usuario
if ($metodo === 'POST' && isset($_GET['accion']) && $_GET['accion'] === 'asignar') {

    //Asigno ID tarea y usuario
    $tarea_id   = $input['tarea_id']   ?? null;
    $usuario_id = $input['usuario_id'] ?? null;

    //Compruebo que me llegan ID de tarea y usuario
    if ($tarea_id === null || $usuario_id === null) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el ID de tarea o usuario"]);
        exit;
    }

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
    //Compruebo si se pasa el titulo
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
        $sentSQL->execute([$proyecto_id, $titulo, $descripcion, $estado, $prioridad, $fecha_limite, $usuarioLogueado['id']]);
        $tarea_id = $conn->lastInsertId();
        //Mensaje para la creacion correcta de la tarea
        http_response_code(201);
        echo json_encode([
            "mensaje" => "Tarea creada correctamente",
            "tarea" => [
                "proyecto_id" => $proyecto_id,
                "titulo" => $titulo,
                "descripcion" => $descripcion,
                "estado" => $estado,
                "prioridad" => $prioridad,
                "fecha_limite" => $fecha_limite,
                "creador_id" => $usuarioLogueado['id']
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

//*****PUT  | Modificar tarea
if ($metodo === 'PUT') {
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el id de la tarea"]);
        exit;
    }

    $id = $input['id'];


    try {

        //Hago un select para saber los datos de la tarea actual que voy a modificar
        $sentSQL = $conn->prepare("SELECT * FROM tareas WHERE id = ?");
        $sentSQL->execute([$id]);
        $tareaActual = $sentSQL->fetch(PDO::FETCH_ASSOC);

        //Si esta vacio mando error
        if (!$tareaActual) {
            http_response_code(404);
            echo json_encode(["mensaje" => "Tarea no encontrada"]);
            exit;
        }

        //Si el input del usuario esta vacio devuelvo los datos actuales
        $titulo = $input['titulo'] ?? $tareaActual['titulo'];
        $descripcion = $input['descripcion'] ?? $tareaActual['descripcion'];
        $estado = $input['estado'] ?? $tareaActual['estado'];

        //Update de la tarea
        $sentSQL = $conn->prepare("UPDATE tareas SET titulo = ?, descripcion = ?, estado = ? WHERE id = ?");
        $sentSQL->execute([$titulo, $descripcion, $estado, $id]);

        echo json_encode([
            "id" => $id,
            "titulo" => $titulo,
            "descripcion" => $descripcion,
            "estado" => $estado
        ]);
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error modificando las tareas",
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****DELETE | Borrar asignacion de tarea
if ($metodo === 'DELETE' && isset($_GET['accion']) && $_GET['accion'] === 'desasignar') {
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
    //Compruebo que me llega ID de tarea
    if (!isset($input['tarea_id'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta Id de tarea"]);
        exit;
    }
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
