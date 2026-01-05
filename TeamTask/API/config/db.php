<?php

//Busco la raiz del servidor
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? null;
if (!$documentRoot) {
    http_response_code(500);
    echo json_encode(["mensaje" => "No se puede determinar DOCUMENT_ROOT"]);
    exit;
}

//Ruta donde viven las credenciales
$secretsPath = dirname($documentRoot) . '/config/secrets.php';

if (!file_exists($secretsPath)) {
    http_response_code(500);
    echo json_encode(["mensaje" => "No se encuentra el archivo de credenciales"]);
    exit;
}

//Leo el archivo de claves
$secrets = require $secretsPath;
$host = $secrets['DB_HOST'] ?? null;
$db_name = $secrets['DB_NAME'] ?? null;
$username = $secrets['DB_USER'] ?? null;
$password = $secrets['DB_PASS'] ?? null;

//Compruebo que no falte nada
if (!$host || !$db_name || !$username || !$password) {
    http_response_code(500);
    echo json_encode(["mensaje" => "Credenciales incompletas"]);
    exit;
}

try {
    //Abro la conexion a la base de datos
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    //Si falla, aviso
    http_response_code(500);
    echo json_encode(["mensaje" => "Error de conexion a la base de datos"]);
    exit;
}
