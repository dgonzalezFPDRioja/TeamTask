<?php
//API para los proyectos de la base de datos

require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';
// require_once 'auth_middleware.php';
$creador_id = 1;

//Pillo el metodo utilizado
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//*****METODO GET | Si paso un ID devuelve el proyecto concreto, si no pasa la lista de proyectos
if ($metodo === 'GET') {
    //Comprueba si la query tiene un id
    if (isset($_GET['id'])) {
        //Añade el id a la variable
        $id = $_GET['id'];
        //Sentencia SQL
        $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE id = ?");
        //Paso el parametro id
        $sentSQL->execute([$id]);
        $proyecto = $sentSQL->fetch(PDO::FETCH_ASSOC);

        //Si existe el proyecto lo devuelve en JSON, si no error 404
        if ($proyecto) {
            echo json_encode($proyecto);
        } else {
            http_response_code(404);
            echo json_encode(["mensaje" => "Proyecto no encontrado"]);
        }
    } else {
        //Si la query no tiene ID devuelve toda la lsita de proyecto
        $sentSQL = $conn->query("SELECT * FROM usuarios ORDER BY id DESC");
        $proyectos = $sentSQL->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($proyectos);
    }
    exit;
}

//*****METODO POST | Creacion de proyectos
if ($metodo === 'POST') {
    //El campo nombre esta vacio manda un error 400
    if (empty($input['nombre'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "El nombre no puede estar vacio"]);
        exit;
    }
    //Pongo en variables el nombre y descripcion
    $nombre = trim($input['nombre']);
    $descripcion = trim($input['descripcion']);
    //Sentencia SQL
    $sentSQL = $conn->prepare("INSERT INTO proyectos (nombre, descripcion, creador_id) VALUES (?, ?, ?)");
    try{
        $sentSQL->execute([$nombre, $descripcion, $creador_id]);
        //Pillo el ID asignado
        $id = $conn->lastInsertId();

        //Validacion de creacion 
        http_response_code(201);
        echo json_encode([
            "id" => $id,
            "nombre" => $nombre,
            "descripcion" => $descripcion,
            "creador_id" => $creador_id
        ]);
        exit;
    } catch (PDOException $e) {
    //Devuelvo el error
    http_response_code(500);
    echo json_encode([
        "codigo" => $e->getCode(),
        "error"  => $e->getMessage()
    ]);
    exit;
    }
}

//*****METODO PUT | Modificacion de proyectos
if ($metodo === 'PUT') {
    //El campo nombre esta vacio manda un error 400
    if (empty($input['nombre'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el nombre"]);
        exit;
    }
    $nombre = $input['nombre'];
    //Si no se manda nombre nuevo, se queda el mismo
    $nuevoNombre = $input['nuevo_nombre'] ?? $nombre;
    $descripcion = $input['descripcion'] ?? null;
    //Comprobacion que existe el proyecto
    $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE nombre = ?");
    $sentSQL->execute([$nombre]);
    //Mando error si no se encuentra el usuario
    if (!$sentSQL->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(["mensaje" => "Proyecto no encontrado"]);
        exit;
    }
    //Creo un array con los campos que se tienen que actualizar
    $campos = [];
    $valores = [];
    //Voy añadiendo al array los campos que se actualizan
    if ($nuevoNombre !== null) {
        $campos[] = "nombre = ?";
        $valores[] = $nuevoNombre;
    }
    if ($descripcion !== null) {
        $campos[] = "descripcion = ?";
        $valores[] = $descripcion;
    }
    //Cuento los campos del array para saber si no hay nada que actualizar
    if (count($campos) === 0) {
        http_response_code(400);
        echo json_encode(["mensaje" => "No se ha enviado ningún campo para actualizar"]);
        exit;
    }
    $valores[] = $nombre;
    //Ejecuto el update
    $sentSQL = "UPDATE proyectos SET " . implode(", ", $campos) . " WHERE nombre = ?";
    $update = $conn->prepare($sentSQL);
    $update->execute($valores);
    //Hago un select para saber como ha quedado el usuario
    $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE nombre = ?");
    $sentSQL->execute([$nuevoNombre]);
    $proyectoFinal = $sentSQL->fetch(PDO::FETCH_ASSOC);
    //Mensaje de confirmacion y como ha queado el usuario
    echo json_encode([
        "mensaje" => "Proyecto actualizado correctamente",
        "usuario" => $proyectoFinal
    ]);
    exit;
}

//*****METODO DELETE | Paso un correo para eliminar el usuario
if ($metodo === 'DELETE') {
    //Compruebo si si ha passado un nombre
    if (empty($input['nombre'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el nombre"]);
        exit;
    }
    $nombre = $input['nombre'];
    try {
        //Compruebo que el proyecto existe
        $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE nombre = ?");
        $sentSQL->execute([$nombre]);
        $proyecto = $sentSQL->fetch(PDO::FETCH_ASSOC);
        //Si la respuesta esta vacia no se ha encontrado el proyecto
        if (!$proyecto) {
            http_response_code(404);
            echo json_encode(["mensaje" => "Proyecto no encontrado"]);
            exit;
        }
        //Ejecuto el borrado
        $delSQL = $conn->prepare("DELETE FROM proyectos WHERE nombre = ?");
        $delSQL->execute([$nombre]);
        //Si la sentencia no esta vacia es que el proyecto se ha borrado
        if ($delSQL->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                "mensaje" => "Proyecto eliminado",
            ]);
        } else {
            //Si esta vacia es que ha salido mal
            http_response_code(500);
            echo json_encode([
                "mensaje" => "Error al eliminar el proyecto"
            ]);
        }
        exit;
    } catch (PDOException $e) {
        //Si recibo error 500 saco error de BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error en la base de datos al eliminar el proyecto",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//Para cualquier metodo raro
http_response_code(405);
echo json_encode(["mensaje" => "Método no permitido"]);