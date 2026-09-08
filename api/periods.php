<?php
declare(strict_types=1);
header('Content-Type: application/json');
header('Cache-Control: no-store');
try {
    $db = new PDO('sqlite:/data/cycle.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('CREATE TABLE IF NOT EXISTS period_days (day TEXT PRIMARY KEY NOT NULL)');
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode(['days' => $db->query('SELECT day FROM period_days ORDER BY day')->fetchAll(PDO::FETCH_COLUMN)]);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') { http_response_code(405); header('Allow: GET, PUT'); echo json_encode(['error' => 'Method not allowed']); exit; }
    $body = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    $days = $body['days'] ?? null;
    if (!is_array($days) || count($days) > 10000) throw new InvalidArgumentException('Invalid days');
    $validDays = [];
    foreach ($days as $day) {
        if (!is_string($day) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $day)) throw new InvalidArgumentException('Invalid day');
        $date = DateTime::createFromFormat('!Y-m-d', $day);
        if (!$date || $date->format('Y-m-d') !== $day) throw new InvalidArgumentException('Invalid day');
        $validDays[$day] = true;
    }
    $db->beginTransaction(); $db->exec('DELETE FROM period_days');
    $insert = $db->prepare('INSERT INTO period_days (day) VALUES (:day)');
    foreach (array_keys($validDays) as $day) $insert->execute([':day' => $day]);
    $db->commit(); echo json_encode(['days' => array_keys($validDays)]);
} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    http_response_code($error instanceof InvalidArgumentException || $error instanceof JsonException ? 400 : 500);
    echo json_encode(['error' => 'Could not save calendar data']);
}
