<?php
//API para los usuarios de la base de datos

require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';

//Pillo el metodo utilizado
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//*****METODO GET | Si paso un ID devuelve el usuario concreto, si no pasa la lista de usuarios
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

//*****METODO POST | Creacion de usuarios
if ($metodo === 'POST') {
    //El campo nombre o correo esta vacio manda un error 400
    if (empty($input['nombre']) || empty($input['correo']) || empty($input['contrasena']) || empty($input['rol'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Faltan campos obligatorios"]);
        exit;
    }
    //Pongo en variables el nombre y correo
    $nombre = trim($input['nombre']);
    $correo = trim($input['correo']);
    $contrasena_hash = password_hash($input['contrasena'], PASSWORD_BCRYPT);
    $rol = trim($input['rol']);
    //Sentencia SQL
    $sentSQL = $conn->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)");
    try{
        $sentSQL->execute([$nombre, $correo, $contrasena_hash, $rol]);
        //Pillo el ID asignado
        $id = $conn->lastInsertId();

        //Validacion de creacion 
        http_response_code(201);
        echo json_encode([
            "id" => $id,
            "nombre" => $nombre,
            "correo" => $correo,
            "rol" => $rol
        ]);
        exit;
    } catch (PDOException $e) {
    //Si la respuesta tiene un codigo 23000 significa que el correo esta duplicado
    if ($e->getCode() == '23000') {
        http_response_code(409);
        echo json_encode(["mensaje" => "El correo ya esta registrado"]);
        exit;
    }
    //Si recibo error 500 saco error de BBDD
    http_response_code(500);
    echo json_encode(["mensaje" => "Error en la base de datos"]);
    exit;
    }
}

//*****METODO PUT | Modificacion de usuarios
if ($metodo === 'PUT') {
    //El campo nombre o correo esta vacio manda un error 400
    if (empty($input['correo'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el correo"]);
        exit;
    }
    $correo = $input['correo'];
    //Si no se manda correo nuevo, se queda el mismo
    $nuevoCorreo = $input['nuevo_correo'] ?? $correo;
    $nombre = $input['nombre'] ?? null;
    $contra = $input['contrasena_hash'] ?? null;
    $rol = $input['rol'] ?? null;
    //Comprobacion que existe el usuario
    $sentSQL = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
    $sentSQL->execute([$correo]);
    //Mando error si no se encuentra el usuario
    if (!$sentSQL->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(["mensaje" => "Usuario no encontrado"]);
        exit;
    }
    //Creo un array con los campos que se tienen que actualizar
    $campos = [];
    $valores = [];
    //Voy añadiendo al array los campos que se actualizan
    if ($nuevoCorreo !== null) {
        $campos[] = "correo = ?";
        $valores[] = $nuevoCorreo;
    }
    if ($nombre !== null) {
        $campos[] = "nombre = ?";
        $valores[] = $nombre;
    }
    if ($contra !== null) {
        $campos[] = "contrasena_hash = ?";
        $valores[] = $contra;
    }
    if ($rol !== null) {
        $campos[] = "rol = ?";
        $valores[] = $rol;
    }
    //Cuento los campos del array para saber si no hay nada que actualizar
    if (count($campos) === 0) {
        http_response_code(400);
        echo json_encode(["mensaje" => "No se ha enviado ningún campo para actualizar"]);
        exit;
    }
    $valores[] = $correo;
    //Ejecuto el update
    $sentSQL = "UPDATE usuarios SET " . implode(", ", $campos) . " WHERE correo = ?";
    $update = $conn->prepare($sentSQL);
    $update->execute($valores);
    //Hago un select para saber como ha quedado el usuario
    $sentSQL = $conn->prepare("SELECT id, nombre, correo, rol FROM usuarios WHERE correo = ?");
    $sentSQL->execute([$nuevoCorreo]);
    $usuarioFinal = $sentSQL->fetch(PDO::FETCH_ASSOC);
    //Mensaje de confirmacion y como ha queado el usuario
    echo json_encode([
        "mensaje" => "Usuario actualizado correctamente",
        "usuario" => $usuarioFinal
    ]);
    exit;
}

//*****METODO DELETE | Paso un correo para eliminar el usuario
if ($metodo === 'DELETE') {
    //Compruebo si si ha passado un correo
    if (empty($input['correo'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el correo"]);
        exit;
    }
    $correo = $input['correo'];
    try {
        //Compruebo que el usuario existe
        $sentSQL = $conn->prepare("SELECT id, nombre, correo, rol FROM usuarios WHERE correo = ?");
        $sentSQL->execute([$correo]);
        $usuario = $sentSQL->fetch(PDO::FETCH_ASSOC);
        //Si la respuesta esta vacia no se ha encontrado el usuario
        if (!$usuario) {
            http_response_code(404);
            echo json_encode(["mensaje" => "Usuario no encontrado"]);
            exit;
        }
        //Ejecuto el borrado
        $delSQL = $conn->prepare("DELETE FROM usuarios WHERE correo = ?");
        $delSQL->execute([$correo]);
        //Si la sentencia no esta vacia es que el usuario se ha borrado
        if ($delSQL->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                "mensaje" => "Usuario eliminado",
            ]);
        } else {
            //Si esta vacia es que ha salido mal
            http_response_code(500);
            echo json_encode([
                "mensaje" => "Error al eliminar el usuario"
            ]);
        }
        exit;
    } catch (PDOException $e) {
        //Si recibo error 500 saco error de BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error en la base de datos al eliminar el usuario",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//Para cualquier metodo raro
http_response_code(405);
echo json_encode(["mensaje" => "Método no permitido"]);