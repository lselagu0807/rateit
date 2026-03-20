<?php
// ============================================
// RATEIT - Configuración de base de datos
// ============================================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // Cambia si tienes usuario distinto en XAMPP
define('DB_PASS', '');           // Cambia si tienes contraseña en XAMPP
define('DB_NAME', 'rateit');
define('DB_CHARSET', 'utf8mb4');

function getConnection(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    try {
      $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
      exit;
    }
  }
  return $pdo;
}

// Headers CORS para Angular en desarrollo
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
