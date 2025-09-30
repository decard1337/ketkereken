<?php
header('Content-Type: application/json');
$mysqli = new mysqli("localhost", "root", "", "ketkerek");
if ($mysqli->connect_error) {
  die("DB hiba: " . $mysqli->connect_error);
}

$action = $_GET['action'] ?? '';

switch($action) {
  case "utvonalak":
    $res = $mysqli->query("SELECT id, nev, hossz_km, nehezseg, lat, lng, koordinatak FROM utvonalak");
    $utvonalak = [];
    while($row = $res->fetch_assoc()) {
      if (!empty($row['koordinatak'])) {
        $row['koordinatak'] = json_decode($row['koordinatak']);
      }
      $utvonalak[] = $row;
    }
    echo json_encode($utvonalak);
    break;
  case "desztinaciok":
    $res = $mysqli->query("SELECT * FROM desztinaciok");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    break;
  case "kolcsonzok":
    $res = $mysqli->query("SELECT * FROM kolcsonzok");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    break;
  case "esemenyek":
    $res = $mysqli->query("SELECT * FROM esemenyek");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    break;
  default:
    echo json_encode(["error" => "Ismeretlen action"]);
}
