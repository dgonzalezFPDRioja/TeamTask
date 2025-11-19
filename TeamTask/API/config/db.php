<?php

$host = "srv1688.hstgr.io";
$db_name = "u339788083_TeamTask";
$username = "u339788083_TeamTask";
$password = "T€amT@skDAW2025";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["mensaje" => "Error de conexión a la base de datos"]);
    exit;
}