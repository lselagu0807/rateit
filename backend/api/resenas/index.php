<?php
// ============================================
// RATEIT - API Reseñas (CRUD completo)
// Rutas:
//   GET    /api/resenas/               → listar todas (con JOIN a empresa y usuario)
//   GET    /api/resenas/?id=X          → obtener una
//   GET    /api/resenas/?empresa_id=X  → reseñas de una empresa
//   GET    /api/resenas/?usuario_id=X  → reseñas de un usuario
//   POST   /api/resenas/               → crear
//   PUT    /api/resenas/?id=X          → actualizar
//   DELETE /api/resenas/?id=X          → eliminar
// ============================================

require_once '../../config/db.php';

$pdo    = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id          = isset($_GET['id'])          ? (int)$_GET['id']          : null;
$empresa_id  = isset($_GET['empresa_id'])  ? (int)$_GET['empresa_id']  : null;
$usuario_id  = isset($_GET['usuario_id'])  ? (int)$_GET['usuario_id']  : null;
$body        = json_decode(file_get_contents('php://input'), true) ?? [];

// ── Helper: recalcular valoración media de empresa ──
function recalcularMedia(PDO $pdo, int $empresa_id): void {
  $stmt = $pdo->prepare(
    "UPDATE empresas
     SET valoracion_media = (SELECT COALESCE(AVG(puntuacion), 0) FROM resenas WHERE empresa_id = ?),
         total_resenas    = (SELECT COUNT(*)                       FROM resenas WHERE empresa_id = ?)
     WHERE id = ?"
  );
  $stmt->execute([$empresa_id, $empresa_id, $empresa_id]);
}

// ── SQL base con JOINs ──
$BASE_SQL = "
  SELECT r.*,
         u.nombre  AS usuario_nombre,
         e.nombre  AS empresa_nombre,
         e.categoria AS empresa_categoria
  FROM   resenas r
  JOIN   usuarios u ON r.usuario_id = u.id
  JOIN   empresas e ON r.empresa_id = e.id
";

switch ($method) {

  // ── GET ──────────────────────────────────
  case 'GET':
    if ($id) {
      $stmt = $pdo->prepare($BASE_SQL . " WHERE r.id = ?");
      $stmt->execute([$id]);
      $resena = $stmt->fetch();
      if (!$resena) { http_response_code(404); echo json_encode(['error' => 'Reseña no encontrada']); break; }
      echo json_encode($resena);
    } elseif ($empresa_id) {
      $sort  = in_array($_GET['sort'] ?? '', ['puntuacion','util_count','created_at']) ? $_GET['sort'] : 'created_at';
      $order = ($_GET['order'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
      $stmt  = $pdo->prepare($BASE_SQL . " WHERE r.empresa_id = ? ORDER BY r.{$sort} {$order}");
      $stmt->execute([$empresa_id]);
      echo json_encode($stmt->fetchAll());
    } elseif ($usuario_id) {
      $stmt = $pdo->prepare($BASE_SQL . " WHERE r.usuario_id = ? ORDER BY r.created_at DESC");
      $stmt->execute([$usuario_id]);
      echo json_encode($stmt->fetchAll());
    } else {
      $puntuacion = isset($_GET['puntuacion']) ? (int)$_GET['puntuacion'] : null;
      $where      = $puntuacion ? "WHERE r.puntuacion = {$puntuacion}" : '';
      $stmt       = $pdo->query($BASE_SQL . " {$where} ORDER BY r.created_at DESC LIMIT 50");
      echo json_encode($stmt->fetchAll());
    }
    break;

  // ── POST ─────────────────────────────────
  case 'POST':
    $required = ['usuario_id', 'empresa_id', 'titulo', 'cuerpo', 'puntuacion'];
    foreach ($required as $field) {
      if (empty($body[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "El campo '{$field}' es obligatorio"]);
        exit;
      }
    }
    $puntuacion = (int)$body['puntuacion'];
    if ($puntuacion < 1 || $puntuacion > 5) {
      http_response_code(400);
      echo json_encode(['error' => 'La puntuación debe estar entre 1 y 5']);
      exit;
    }
    // Verificar que no haya reseña duplicada del mismo usuario para la misma empresa
    $check = $pdo->prepare("SELECT id FROM resenas WHERE usuario_id = ? AND empresa_id = ?");
    $check->execute([$body['usuario_id'], $body['empresa_id']]);
    if ($check->fetch()) {
      http_response_code(409);
      echo json_encode(['error' => 'Ya has dejado una reseña para esta empresa']);
      exit;
    }

    $stmt = $pdo->prepare(
      "INSERT INTO resenas (usuario_id, empresa_id, titulo, cuerpo, puntuacion, verificada)
       VALUES (:usuario_id, :empresa_id, :titulo, :cuerpo, :puntuacion, :verificada)"
    );
    $stmt->execute([
      ':usuario_id' => (int)$body['usuario_id'],
      ':empresa_id' => (int)$body['empresa_id'],
      ':titulo'     => htmlspecialchars($body['titulo']),
      ':cuerpo'     => htmlspecialchars($body['cuerpo']),
      ':puntuacion' => $puntuacion,
      ':verificada' => (int)($body['verificada'] ?? 0),
    ]);
    $newId = (int)$pdo->lastInsertId();
    recalcularMedia($pdo, (int)$body['empresa_id']);
    http_response_code(201);
    echo json_encode(['id' => $newId, 'message' => 'Reseña creada']);
    break;

  // ── PUT ──────────────────────────────────
  case 'PUT':
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); break; }

    // Si es solo incrementar "útil"
    if (isset($body['incrementar_util']) && $body['incrementar_util']) {
      $stmt = $pdo->prepare("UPDATE resenas SET util_count = util_count + 1 WHERE id = ?");
      $stmt->execute([$id]);
      echo json_encode(['message' => 'Útil incrementado']);
      break;
    }

    // Obtener empresa_id antes de actualizar para recalcular
    $old = $pdo->prepare("SELECT empresa_id FROM resenas WHERE id = ?");
    $old->execute([$id]);
    $oldRow = $old->fetch();

    $stmt = $pdo->prepare(
      "UPDATE resenas SET
        titulo     = COALESCE(:titulo,     titulo),
        cuerpo     = COALESCE(:cuerpo,     cuerpo),
        puntuacion = COALESCE(:puntuacion, puntuacion)
       WHERE id = :id"
    );
    $stmt->execute([
      ':titulo'     => isset($body['titulo'])     ? htmlspecialchars($body['titulo'])     : null,
      ':cuerpo'     => isset($body['cuerpo'])     ? htmlspecialchars($body['cuerpo'])     : null,
      ':puntuacion' => isset($body['puntuacion']) ? (int)$body['puntuacion']              : null,
      ':id'         => $id,
    ]);
    if ($oldRow) recalcularMedia($pdo, $oldRow['empresa_id']);
    echo json_encode(['message' => 'Reseña actualizada']);
    break;

  // ── DELETE ───────────────────────────────
  case 'DELETE':
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); break; }
    $old = $pdo->prepare("SELECT empresa_id FROM resenas WHERE id = ?");
    $old->execute([$id]);
    $oldRow = $old->fetch();

    $stmt = $pdo->prepare("DELETE FROM resenas WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
      http_response_code(404);
      echo json_encode(['error' => 'Reseña no encontrada']);
    } else {
      if ($oldRow) recalcularMedia($pdo, $oldRow['empresa_id']);
      echo json_encode(['message' => 'Reseña eliminada']);
    }
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
