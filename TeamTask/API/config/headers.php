<?php
//Defino que todo salga en JSON
header("Content-Type: application/json; charset=UTF-8");
//Permito llamadas desde cualquier origen
header("Access-Control-Allow-Origin: *");
//Metodos que acepto en la API
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
//Headers que acepto en las peticiones
header("Access-Control-Allow-Headers: Content-Type, Authorization");

//Si es preflight, respondo y corto aqui
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
