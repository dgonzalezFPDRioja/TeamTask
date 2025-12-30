<?php

$host = getenv('DB_HOST');
$db_name = getenv('DB_NAME');
$username = getenv('DB_USER');
$password = getenv('DB_PASS');

if (!$host || !$db_name || !$username || !$password) {
    http_response_code(500);
    echo json_encode(["mensaje" => "Faltan credenciales de base de datos"]);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["mensaje" => "Error de conexión a la base de datos"]);
    exit;
}
