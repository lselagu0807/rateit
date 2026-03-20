<?php
// ============================================
// RATEIT - API Auth
// POST /api/auth/?action=login    → login
// POST /api/auth/?action=register → registro
// GET  /api/auth/?action=me&id=X  → datos usuario
// ============================================

require_once '../../config/db.php';

$pdo    = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

  // ── LOGIN ────────────────────────────────
  case 'login':
    if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Método no permitido']); exit; }

    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (!$email || !$password) {
      http_response_code(400);
      echo json_encode(['error' => 'Email y contraseña son obligatorios']);
      exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
      http_response_code(401);
      echo json_encode(['error' => 'Email o contraseña incorrectos']);
      exit;
    }

    unset($user['password']);
    echo json_encode(['user' => $user, 'message' => 'Login correcto']);
    break;

  // ── REGISTER ─────────────────────────────
  case 'register':
    if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Método no permitido']); exit; }

    $nombre   = trim($body['nombre'] ?? '');
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $ciudad   = trim($body['ciudad'] ?? '');

    if (!$nombre || !$email || !$password) {
      http_response_code(400);
      echo json_encode(['error' => 'Nombre, email y contraseña son obligatorios']);
      exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      echo json_encode(['error' => 'Email no válido']);
      exit;
    }

    if (strlen($password) < 6) {
      http_response_code(400);
      echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres']);
      exit;
    }

    // Comprobar email duplicado
    $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
      http_response_code(409);
      echo json_encode(['error' => 'Este email ya está registrado']);
      exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare(
      "INSERT INTO usuarios (nombre, email, password, ciudad, rol, verificado) VALUES (?, ?, ?, ?, 'usuario', 1)"
    );
    $stmt->execute([htmlspecialchars($nombre), $email, $hash, htmlspecialchars($ciudad)]);
    $newId = (int)$pdo->lastInsertId();

    $stmt2 = $pdo->prepare("SELECT id, nombre, email, ciudad, rol, verificado, created_at FROM usuarios WHERE id = ?");
    $stmt2->execute([$newId]);
    $newUser = $stmt2->fetch();

    http_response_code(201);
    echo json_encode(['user' => $newUser, 'message' => 'Cuenta creada correctamente']);
    break;

  // ── ME (datos del usuario) ───────────────
  case 'me':
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); exit; }

    $stmt = $pdo->prepare("SELECT id, nombre, email, ciudad, rol, verificado, created_at FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) { http_response_code(404); echo json_encode(['error' => 'Usuario no encontrado']); exit; }

    echo json_encode($user);
    break;

  // ── UPDATE PERFIL ────────────────────────
  case 'update':
    if ($method !== 'PUT') { http_response_code(405); echo json_encode(['error' => 'Método no permitido']); exit; }
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); exit; }

    $fields = [];
    $params = [];

    if (!empty($body['nombre'])) { $fields[] = 'nombre = ?'; $params[] = htmlspecialchars($body['nombre']); }
    if (!empty($body['ciudad'])) { $fields[] = 'ciudad = ?'; $params[] = htmlspecialchars($body['ciudad']); }
    if (!empty($body['password'])) {
      if (strlen($body['password']) < 6) { http_response_code(400); echo json_encode(['error' => 'Mínimo 6 caracteres']); exit; }
      $fields[] = 'password = ?';
      $params[] = password_hash($body['password'], PASSWORD_BCRYPT);
    }

    if (empty($fields)) { echo json_encode(['message' => 'Sin cambios']); exit; }

    $params[] = $id;
    $stmt = $pdo->prepare("UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($params);

    $stmt2 = $pdo->prepare("SELECT id, nombre, email, ciudad, rol, verificado FROM usuarios WHERE id = ?");
    $stmt2->execute([$id]);
    echo json_encode(['user' => $stmt2->fetch(), 'message' => 'Perfil actualizado']);
    break;

  default:
    http_response_code(400);
    echo json_encode(['error' => 'Acción no válida']);
}
