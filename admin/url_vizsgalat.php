<?php
if (isset($_GET['p'])) {
    $p = $_GET['p'];
    echo "A p változó értéke: " . $p;
}
if (isset($_GET['k'])) {
    $k = $_GET['k'];
    echo "<br>A k változó értéke: " . $k;
}

?>