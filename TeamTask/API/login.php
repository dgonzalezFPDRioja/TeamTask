<?php
//API para login de usuarios en la web (Creacion de token)

//Incluyo archivos php cabeceras/conexion/autenticación
require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';

//Leo el metodo utilizado de peticion y la peticion
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//Compruebo si han llegado usuario y contraseña
if (empty($input['correo']) || empty($input['contrasena'])) {
    http_response_code(400);
    echo json_encode(["mensaje" => "Faltan correo o contraseña"]);
    exit;
}

$correo = $input['correo'];
$contrasena = $input['contrasena'];

try {
    //Busco el usuario con su correo y pillo sus datos
    $sentSQL = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
    $sentSQL->execute([$correo]);
    $usuario = $sentSQL->fetch(PDO::FETCH_ASSOC);

    //Compruebo si he recibido usuario y si la contraseña es correcta
    if (!$usuario || !password_verify($contrasena, $usuario['contrasena_hash'])) {
        http_response_code(401);
        echo json_encode(["mensaje" => "Login incorrecto"]);
        exit;
    }

    //Creo un token aleatorio para el usuario
    $token = bin2hex(random_bytes(16));

    //Guardo el token con el usuario en la bbdd
    $update = $conn->prepare("UPDATE usuarios SET token = ? WHERE id = ?");
    $update->execute([$token, $usuario['id']]);

    //Devuelvo el login correcto
    echo json_encode([
        "mensaje" => "Login correcto",
        "token" => $token,
        "usuario" => [
            "id" => $usuario['id'],
            "nombre" => $usuario['nombre'],
            "correo" => $usuario['correo'],
            "rol" => $usuario['rol'],
        ]
    ]);

} catch (PDOException $e) {
    //Error de BBDD
    http_response_code(500);
    echo json_encode(["mensaje" => "Error en el servidor"]);
}
