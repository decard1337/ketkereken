<?php
include('connect.php');

$sql = "SELECT * FROM felhasznalok ORDER BY id";
$desztinaciok = "SELECT * FROM desztinaciok ORDER BY id";
$esemenyek = "SELECT * FROM esemenyek ORDER BY id";
$kolcsonzok = "SELECT * FROM kolcsonzok ORDER BY id";
$utvonalak = "SELECT * FROM utvonalak ORDER BY id";

$result = $conn->query($sql);
$result_desztinaciok = $conn->query($desztinaciok);
$result_esemenyek = $conn->query($esemenyek);
$result_kolcsonzok = $conn->query($kolcsonzok);
$result_utvonalak = $conn->query($utvonalak);


function h($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
?>
 <h1>Felhasználók listája</h1>

    <table border=1>
      <thead>
        <tr>
          <th>#</th>
          <th>szoveg</th>
          <th>jelszo</th>
          <th>szam</th>
          <th>datum</th>
          <th>ido</th>
          <th>datumido</th>
          <th>nem</th>
          <th>erdeklodesek</th>
          <th>valasztott_opcio</th>
          <th>email</th>
          <th>telefon</th>
          <th>weboldal</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($result && $result->num_rows > 0): ?>
          <?php while ($row = $result->fetch_assoc()): ?>
            <tr>
              <td><?php echo isset($row['id']) ? h($row['id']) : ''; ?></td>
              <td><?php echo h($row['szoveg']); ?></td>
              <td><?php echo h($row['jelszo']); ?></td>
              <td><?php echo h($row['szam']); ?></td>
              <td><?php echo h($row['datum']); ?></td>
              <td><?php echo h($row['ido']); ?></td>
              <td><?php echo h($row['datiumido']); ?></td>
              <td><?php echo h($row['nem']); ?></td>
              <td><?php echo h($row['erdeklodesek']); ?></td>
              <td><?php echo h($row['valasztott_opcio']); ?></td>
              <td><?php echo h($row['email']); ?></td>
              <td><?php echo h($row['telefon']); ?></td>
              <td><?php echo h($row['weboldal']); ?></td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr>
            <td colspan="4">
              <div class="empty">Még nincs egyetlen felhasznalo sem.</div>
            </td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>

<hr>

<h1>desztinaciok listája</h1>

    <table border=1>
      <thead>
        <tr>
          <th>#</th>
          <th>szoveg</th>
          <th>jelszo</th>
          <th>szam</th>
          <th>datum</th>
          <th>ido</th>
          <th>datumido</th>
          <th>nem</th>
          <th>erdeklodesek</th>
          <th>valasztott_opcio</th>
          <th>email</th>
          <th>telefon</th>
          <th>weboldal</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($result && $result->num_rows > 0): ?>
          <?php while ($row = $result->fetch_assoc()): ?>
            <tr>
              <td><?php echo isset($row['id']) ? h($row['id']) : ''; ?></td>
              <td><?php echo h($row['nev']); ?></td>
              <td><?php echo h($row['leiras']); ?></td>
              <td><?php echo h($row['lat']); ?></td>
              <td><?php echo h($row['lng']); ?></td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr>
            <td colspan="4">
              <div class="empty">Még nincs egyetlen felhasznalo sem.</div>
            </td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>

<hr>

<h1>esemenyek listája</h1>

    <table border=1>
      <thead>
        <tr>
          <th>#</th>
          <th>szoveg</th>
          <th>jelszo</th>
          <th>szam</th>
          <th>datum</th>
          <th>ido</th>
          <th>datumido</th>
          <th>nem</th>
          <th>erdeklodesek</th>
          <th>valasztott_opcio</th>
          <th>email</th>
          <th>telefon</th>
          <th>weboldal</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($result && $result->num_rows > 0): ?>
          <?php while ($row = $result->fetch_assoc()): ?>
            <tr>
              <td><?php echo isset($row['id']) ? h($row['id']) : ''; ?></td>
              <td><?php echo h($row['nev']); ?></td>
              <td><?php echo h($row['leiras']); ?></td>
              <td><?php echo h($row['lat']); ?></td>
              <td><?php echo h($row['lng']); ?></td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr>
            <td colspan="4">
              <div class="empty">Még nincs egyetlen felhasznalo sem.</div>
            </td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>