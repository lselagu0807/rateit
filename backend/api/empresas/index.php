<?php
// ============================================
// RATEIT - API Empresas (CRUD completo)
// Rutas:
//   GET    /api/empresas/          → listar todas
//   GET    /api/empresas/?id=X     → obtener una
//   GET    /api/empresas/?search=X → buscar por nombre
//   POST   /api/empresas/          → crear
//   PUT    /api/empresas/?id=X     → actualizar
//   DELETE /api/empresas/?id=X     → eliminar
// ============================================

require_once '../../config/db.php';

$pdo    = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$search = isset($_GET['search']) ? trim($_GET['search']) : null;
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($method) {

  // ── GET ──────────────────────────────────
  case 'GET':
    if ($id) {
      $stmt = $pdo->prepare("SELECT * FROM empresas WHERE id = ?");
      $stmt->execute([$id]);
      $empresa = $stmt->fetch();
      if (!$empresa) {
        http_response_code(404);
        echo json_encode(['error' => 'Empresa no encontrada']);
        break;
      }
      echo json_encode($empresa);
    } elseif ($search) {
      $stmt = $pdo->prepare(
        "SELECT * FROM empresas WHERE nombre LIKE ? OR categoria LIKE ?
         ORDER BY valoracion_media DESC LIMIT 20"
      );
      $like = "%{$search}%";
      $stmt->execute([$like, $like]);
      echo json_encode($stmt->fetchAll());
    } else {
      $sort  = in_array($_GET['sort'] ?? '', ['nombre','total_resenas','created_at']) ? $_GET['sort'] : 'valoracion_media';
      $order = ($_GET['order'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
      $stmt  = $pdo->query("SELECT * FROM empresas ORDER BY {$sort} {$order}");
      echo json_encode($stmt->fetchAll());
    }
    break;

  // ── POST ─────────────────────────────────
  case 'POST':
    $required = ['nombre', 'categoria'];
    foreach ($required as $field) {
      if (empty($body[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "El campo '{$field}' es obligatorio"]);
        exit;
      }
    }
    $stmt = $pdo->prepare(
      "INSERT INTO empresas (nombre, descripcion, categoria, website, logo_emoji, logo_color, verificada)
       VALUES (:nombre, :descripcion, :categoria, :website, :logo_emoji, :logo_color, :verificada)"
    );
    $stmt->execute([
      ':nombre'      => htmlspecialchars($body['nombre']),
      ':descripcion' => htmlspecialchars($body['descripcion'] ?? ''),
      ':categoria'   => htmlspecialchars($body['categoria']),
      ':website'     => htmlspecialchars($body['website'] ?? ''),
      ':logo_emoji'  => $body['logo_emoji'] ?? '🏢',
      ':logo_color'  => $body['logo_color'] ?? '#1E2421',
      ':verificada'  => (int)($body['verificada'] ?? 0),
    ]);
    http_response_code(201);
    echo json_encode(['id' => (int)$pdo->lastInsertId(), 'message' => 'Empresa creada']);
    break;

  // ── PUT ──────────────────────────────────
  case 'PUT':
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); break; }
    $stmt = $pdo->prepare(
      "UPDATE empresas SET
        nombre      = COALESCE(:nombre, nombre),
        descripcion = COALESCE(:descripcion, descripcion),
        categoria   = COALESCE(:categoria, categoria),
        website     = COALESCE(:website, website),
        logo_emoji  = COALESCE(:logo_emoji, logo_emoji),
        logo_color  = COALESCE(:logo_color, logo_color),
        verificada  = COALESCE(:verificada, verificada)
       WHERE id = :id"
    );
    $stmt->execute([
      ':nombre'      => isset($body['nombre'])      ? htmlspecialchars($body['nombre'])      : null,
      ':descripcion' => isset($body['descripcion']) ? htmlspecialchars($body['descripcion']) : null,
      ':categoria'   => isset($body['categoria'])   ? htmlspecialchars($body['categoria'])   : null,
      ':website'     => isset($body['website'])     ? htmlspecialchars($body['website'])     : null,
      ':logo_emoji'  => $body['logo_emoji'] ?? null,
      ':logo_color'  => $body['logo_color'] ?? null,
      ':verificada'  => isset($body['verificada'])  ? (int)$body['verificada']               : null,
      ':id'          => $id,
    ]);
    echo json_encode(['message' => 'Empresa actualizada']);
    break;

  // ── DELETE ───────────────────────────────
  case 'DELETE':
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); break; }
    $stmt = $pdo->prepare("DELETE FROM empresas WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
      http_response_code(404);
      echo json_encode(['error' => 'Empresa no encontrada']);
    } else {
      echo json_encode(['message' => 'Empresa eliminada']);
    }
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
