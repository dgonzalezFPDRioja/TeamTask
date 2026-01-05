<?php
//API para la autenticacion del usuario con el token

function getUsuarioDeToken(PDO $conn){
    //Funcion para validar el token y devolver el usuario
    //Consigo los headers de la peticion
    $headers = getallheaders();

    //Busco el header del token, lo pongo como nulo si no encuentra
    $aut = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    //Si no está mando error
    if (!$aut || !preg_match('/Bearer\s+(.+)/i', $aut, $tk)) {
        http_response_code(401);
        echo json_encode(["mensaje" => "Falta el token"]);
        exit;
    }

    //Limpio el string del token
    $token = trim($tk[1]);

    //Busco el usuario segun el token que tengo
    $sentSQL = $conn->prepare("SELECT id,nombre,correo,rol FROM usuarios WHERE token = ?");
    $sentSQL->execute([$token]);
    $usuario = $sentSQL->fetch(PDO::FETCH_ASSOC);

    //Si no encuentro el token devuelvo error
    if (!$usuario) {
        http_response_code(401);
        echo json_encode(["mensaje" => "Token inválido"]);
        exit;
    }

    //Devuelvo el usuario
    return $usuario;
}
