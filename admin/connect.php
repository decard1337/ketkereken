<?php

// --- Adatbázis kapcsolat beállítása ---
$servername = "localhost";
$username   = "root";      // adatbázis felhasználónév
$password   = "";          // adatbázis jelszó
$dbname     = "ketkerek"; // adatbázis neve

$conn = new mysqli($servername, $username, $password, $dbname);

// Kapcsolat ellenőrzése
if ($conn->connect_error) {
    die("Sikertelen kapcsolat: " . $conn->connect_error);
}
?>