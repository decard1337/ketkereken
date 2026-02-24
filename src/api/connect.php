<?php
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "ketkerek";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Sikertelen kapcsolat: " . $conn->connect_error);
}
?>