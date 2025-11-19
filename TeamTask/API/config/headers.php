<?php
// api/config/headers.php

header("Content-Type: application/json; charset=UTF-8");

// Permitir peticiones desde tu frontend
header("Access-Control-Allow-Origin: *");
// Si quieres restringir:
// header("Access-Control-Allow-Origin: http://localhost:5173");

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
