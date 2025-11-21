<?php
//API para los usuarios de la base de datos

require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';

//Pillo el metodo utilizado
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//*****METODO GET | Si paso un ID devuelve el usuario concreto, si no pasa la lista de usuarios*/
if ($metodo === 'GET') {
    //Comprueba si la query tiene un id
    if (isset($_GET['id'])) {
        //Añade el id a la variable
        $id = $_GET['id'];
        //Sentencia SQL
        $sentSQL = $conn->prepare("SELECT * FROM usuarios WHERE id = ?");
        //Paso el parametro id
        $sentSQL->execute([$id]);
        $usuario = $sentSQL->fetch(PDO::FETCH_ASSOC);

        //Si existe el usuario lo devuelve en JSON, si no error 404
        if ($usuario) {
            echo json_encode($usuario);
        } else {
            http_response_code(404);
            echo json_encode(["mensaje" => "Usuario no encontrado"]);
        }
    } else {
        //Si la query no tiene ID devuelve toda la lsita de usuarios
        $sentSQL = $conn->query("SELECT * FROM usuarios ORDER BY id DESC");
        $usuarios = $sentSQL->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($usuarios);
    }
    exit;
}

//*****METODO POST | Creacion de usuarios*/
if ($method === 'POST') {
    //El campo nombre o correo esta vacio manda un error 400
    if (empty($input['nombre']) || empty($input['correo'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Faltan campos obligatorios"]);
        exit;
    }

    //Pongo en variables el nombre y correo
    $nombre = trim($input['nombre']);
    $correo = trim($input['correo']);

    //Sentencia SQL
    $sentSQL = $conn->prepare("INSERT INTO usuarios (nombre, correo) VALUES (?, ?)");
    $sentSQL->execute([$nombre, $correo]);

    //Pillo el ID asignado
    $id = $conn->lastInsertId();

    //Validacion de creacion 
    http_response_code(201);
    echo json_encode([
        "id" => $id,
        "nombre" => $nombre,
        "correo" => $correo
    ]);
    exit;
}
//Para cualquier metodo raro
http_response_code(405);
echo json_encode(["mensaje" => "Método no permitido"]);