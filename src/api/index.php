<?php
header('Content-Type: application/json; charset=utf-8');

// DEV CORS (React dev szerverhez)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

include(__DIR__ . '/../admin/connect.php');

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

$resource = $_GET['resource'] ?? '';

switch ($resource) {

  case 'menu': {
    $q = "SELECT id, nev, link, statusz, sorrend
          FROM menu
          WHERE statusz='aktiv'
          ORDER BY sorrend ASC, id ASC";
    $res = $conn->query($q);
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    respond($rows);
  }

  case 'utvonalak': {
    $q = "SELECT id, cim, leiras, koordinatak, hossz, nehezseg, statusz, idotartam, szintkulonbseg
          FROM utvonalak
          WHERE statusz='aktiv'
          ORDER BY id ASC";
    $res = $conn->query($q);
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    respond($rows);
  }

  case 'destinaciok': {
    $q = "SELECT id, nev, leiras, lat, lng, ertekeles, tipus, statusz
          FROM destinaciok
          WHERE statusz='aktiv'
          ORDER BY id ASC";
    $res = $conn->query($q);
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    respond($rows);
  }

  case 'esemenyek': {
    // csak a mai vagy jövőbeli események
    $q = "SELECT id, nev, leiras, lat, lng, datum, resztvevok, tipus, statusz
          FROM esemenyek
          WHERE statusz='aktiv' AND datum >= CURDATE()
          ORDER BY datum ASC, id ASC";
    $res = $conn->query($q);
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    respond($rows);
  }

  case 'kolcsonzok': {
    $q = "SELECT id, nev, cim, lat, lng, ar, telefon, nyitvatartas, statusz
          FROM kolcsonzok
          WHERE statusz='aktiv'
          ORDER BY id ASC";
    $res = $conn->query($q);
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    respond($rows);
  }

  case 'blippek': {
    $q = "SELECT id, nev, leiras, lat, lng, tipus, ikon, statusz
          FROM blippek
          WHERE statusz='aktiv'
          ORDER BY id ASC";
    $res = $conn->query($q);
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    respond($rows);
  }

  default:
    respond(["error" => "Unknown resource"], 400);
}