<?php
include('connect.php');

// Törlés kezelése
if (isset($_GET['torol'])) {
    $id = (int) $_GET['torol'];
    $conn->query("DELETE FROM felhasznalok WHERE id = $id");
    header("Location: " . str_replace("&torol=$id", "", $_SERVER['REQUEST_URI']));
    exit;
}

// Szerkesztés adatok betöltése
$edit_id = null;
$edit_data = null;
if (isset($_GET['szerkeszt'])) {
    $edit_id = (int) $_GET['szerkeszt'];
    $result = $conn->query("SELECT * FROM felhasznalok WHERE id = $edit_id");
    if ($result && $result->num_rows > 0) {
        $edit_data = $result->fetch_assoc();
        // Érdeklődési körök tömbbe konvertálása
        if (!empty($edit_data['erdeklodesek'])) {
            $edit_data['erdeklodesek_array'] = explode(',', $edit_data['erdeklodesek']);
        } else {
            $edit_data['erdeklodesek_array'] = [];
        }
    }
}

// Mentés kezelése
if (isset($_POST['mentes_felhasznalo'])) {
    $id = (int) $_POST['id'];
    $szoveg = $_POST['szoveg'];
    $jelszo = $_POST['jelszo'];
    $szam = $_POST['szam'];
    $datum = $_POST['datum'];
    $ido = $_POST['ido'];
    $datumido = $_POST['datumido'];
    $nem = $_POST['nem'];
    $erdeklodes = isset($_POST['erdeklodes']) ? implode(",", $_POST['erdeklodes']) : "";
    $valasztott = $_POST['valasztott'];
    $email = $_POST['email'];
    $telefon = $_POST['telefon'];
    $weboldal = $_POST['weboldal'];
    
    $sql = "UPDATE felhasznalok SET 
            szoveg = '$szoveg', 
            jelszo = '$jelszo', 
            szam = '$szam', 
            datum = '$datum', 
            ido = '$ido', 
            datumido = '$datumido', 
            nem = '$nem', 
            erdeklodesek = '$erdeklodes', 
            valasztott_opcio = '$valasztott', 
            email = '$email', 
            telefon = '$telefon', 
            weboldal = '$weboldal' 
            WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        header("Location: " . str_replace("&szerkeszt=$id", "", $_SERVER['REQUEST_URI']));
        exit;
    } else {
        $error = "Hiba a mentés során: " . $conn->error;
    }
}

$sql = "SELECT id, szoveg, jelszo, szam, email, telefon, nem, datum, valasztott_opcio FROM felhasznalok ORDER BY id DESC";
$result = $conn->query($sql);

function h($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Felhasználók listája</title>
  <style>
    /* Alap stílusok */
    :root {
      --primary-color: #e67e22;
      --secondary-color: #d35400;
      --danger-color: #e74c3c;
      --warning-color: #f39c12;
      --dark-color: #2c3e50;
      --light-color: #ecf0f1;
      --text-color: #333;
      --border-radius: 8px;
      --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      --transition: all 0.3s ease;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: #f5f7fa;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    /* Táblázat stílusok */
    .table-container {
      background: white;
      border-radius: var(--border-radius);
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: var(--box-shadow);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: var(--dark-color);
      position: sticky;
      top: 0;
    }

    tr {
      transition: var(--transition);
    }

    tr:hover {
      background-color: #f8f9fa;
    }

    /* Művelet gombok */
    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .btn {
      display: inline-block;
      padding: 8px 15px;
      border: none;
      border-radius: var(--border-radius);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      text-align: center;
      text-decoration: none;
    }

    .btn-danger {
      background-color: var(--danger-color);
      color: white;
    }

    .btn-danger:hover {
      background-color: #c0392b;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-edit {
      background-color: var(--primary-color);
      color: white;
    }

    .btn-edit:hover {
      background-color: #d35400;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-success {
      background-color: #27ae60;
      color: white;
    }

    .btn-success:hover {
      background-color: #219653;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-cancel {
      background-color: #95a5a6;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #7f8c8d;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-add {
      background-color: var(--secondary-color);
      color: white;
      padding: 12px 25px;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-add:hover {
      background-color: #ba4a00;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    /* Üres állapot */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #7f8c8d;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 15px;
      color: #bdc3c7;
    }

    /* Statisztika kártyák */
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: var(--box-shadow);
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    /* Vissza gomb */
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 10px 20px;
      background-color: var(--dark-color);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    .back-button:hover {
      background-color: #1a252f;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    /* Szerkesztő űrlap */
    .edit-form-container {
      background: white;
      border-radius: var(--border-radius);
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: var(--box-shadow);
    }

    .edit-form-container h2 {
      color: var(--dark-color);
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--light-color);
      display: flex;
      align-items: center;
    }

    .edit-form-container h2::before {
      content: "👤";
      margin-right: 10px;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--dark-color);
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      font-size: 16px;
      transition: var(--transition);
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 25px;
    }

    /* Checkbox és radio csoportok */
    .checkbox-group, .radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 5px;
    }

    .checkbox-item, .radio-item {
      display: flex;
      align-items: center;
    }

    .checkbox-item input, .radio-item input {
      width: auto;
      margin-right: 8px;
    }

    /* Idő és dátum csoport */
    .datetime-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    /* Badge-ek */
    .gender-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .gender-male {
      background: #3498db;
      color: white;
    }

    .gender-female {
      background: #e84393;
      color: white;
    }

    .option-badge {
      background: #e8f4fd;
      color: var(--primary-color);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    /* Üzenetek */
    .message {
      padding: 15px;
      margin-bottom: 20px;
      border-radius: var(--border-radius);
      font-weight: 600;
    }

    .success {
      background-color: rgba(46, 204, 113, 0.2);
      color: #27ae60;
      border-left: 4px solid #27ae60;
    }

    .error {
      background-color: rgba(231, 76, 60, 0.2);
      color: #c0392b;
      border-left: 4px solid var(--danger-color);
    }

    /* Reszponzív design */
    @media (max-width: 768px) {
      th, td {
        padding: 8px 10px;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .table-container, .edit-form-container {
        padding: 15px;
      }
      
      .action-buttons, .form-actions {
        flex-direction: column;
      }
      
      .datetime-group {
        grid-template-columns: 1fr;
      }
    }

    /* Animációk */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .table-container, .stat-card, .edit-form-container {
      animation: fadeIn 0.5s ease forwards;
    }

    /* Keresés és szűrés */
    .search-filter {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-box input {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      font-size: 16px;
      transition: var(--transition);
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
    }

    /* Jelszó mező */
    .password-field {
      font-family: 'Courier New', monospace;
    }

    /* Érdeklődési badge-ek */
    .interest-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }

    .interest-badge {
      background: #ffeaa7;
      color: #e17055;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 0.7rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="index.php" class="back-button">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
      </svg>
      Vissza a főoldalra
    </a>

    <header>
      <h1>Felhasználók listája</h1>
      <p class="subtitle">Összes felhasználó megtekintése és kezelése</p>
    </header>

    <?php if (isset($error)): ?>
      <div class="message error"><?= h($error) ?></div>
    <?php endif; ?>

    <!-- Statisztika kártyák -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-number"><?= $result ? $result->num_rows : 0 ?></div>
        <div class="stat-label">Összes felhasználó</div>
      </div>
      <div class="stat-card">
        <div class="stat-number"><?= $edit_id ? 'Szerkesztés' : 'Lista' ?></div>
        <div class="stat-label">Aktuális mód</div>
      </div>
    </div>

    <!-- Új felhasználó gomb -->
    <div style="margin-bottom: 20px;">
      <a href="felhasznalok.php" class="btn btn-add">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Új felhasználó hozzáadása
      </a>
    </div>

    <!-- Szerkesztő űrlap -->
    <?php if ($edit_data): ?>
      <div class="edit-form-container">
        <h2>Felhasználó szerkesztése</h2>
        <form method="post">
          <input type="hidden" name="id" value="<?= h($edit_data['id']) ?>">
          
          <div class="form-group">
            <label for="szoveg">Szöveg</label>
            <input type="text" id="szoveg" name="szoveg" value="<?= h($edit_data['szoveg']) ?>" required>
          </div>
          
          <div class="form-group">
            <label for="jelszo">Jelszó</label>
            <input type="text" id="jelszo" name="jelszo" value="<?= h($edit_data['jelszo']) ?>" class="password-field" required>
          </div>
          
          <div class="form-group">
            <label for="szam">Szám</label>
            <input type="number" id="szam" name="szam" value="<?= h($edit_data['szam']) ?>">
          </div>
          
          <div class="datetime-group">
            <div class="form-group">
              <label for="datum">Dátum</label>
              <input type="date" id="datum" name="datum" value="<?= h($edit_data['datum']) ?>">
            </div>
            
            <div class="form-group">
              <label for="ido">Idő</label>
              <input type="time" id="ido" name="ido" value="<?= h($edit_data['ido']) ?>">
            </div>
          </div>
          
          <div class="form-group">
            <label for="datumido">Dátum és idő</label>
            <input type="datetime-local" id="datumido" name="datumido" value="<?= h($edit_data['datumido']) ?>">
          </div>
          
          <div class="form-group">
            <label>Nem:</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="nem_ferfi" name="nem" value="ferfi" <?= $edit_data['nem'] == 'ferfi' ? 'checked' : '' ?>>
                <label for="nem_ferfi">Férfi</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="nem_no" name="nem" value="no" <?= $edit_data['nem'] == 'no' ? 'checked' : '' ?>>
                <label for="nem_no">Nő</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Érdeklődési körök:</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="erdeklodes_sport" name="erdeklodes[]" value="sport" <?= in_array('sport', $edit_data['erdeklodesek_array']) ? 'checked' : '' ?>>
                <label for="erdeklodes_sport">Sport</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="erdeklodes_zene" name="erdeklodes[]" value="zene" <?= in_array('zene', $edit_data['erdeklodesek_array']) ? 'checked' : '' ?>>
                <label for="erdeklodes_zene">Zene</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="erdeklodes_olvasas" name="erdeklodes[]" value="olvasas" <?= in_array('olvasas', $edit_data['erdeklodesek_array']) ? 'checked' : '' ?>>
                <label for="erdeklodes_olvasas">Olvasás</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="valasztott">Választott opció</label>
            <select id="valasztott" name="valasztott">
              <option value="">--Válassz--</option>
              <option value="opcio1" <?= $edit_data['valasztott_opcio'] == 'opcio1' ? 'selected' : '' ?>>Opció 1</option>
              <option value="opcio2" <?= $edit_data['valasztott_opcio'] == 'opcio2' ? 'selected' : '' ?>>Opció 2</option>
              <option value="opcio3" <?= $edit_data['valasztott_opcio'] == 'opcio3' ? 'selected' : '' ?>>Opció 3</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="<?= h($edit_data['email']) ?>">
          </div>
          
          <div class="form-group">
            <label for="telefon">Telefon</label>
            <input type="tel" id="telefon" name="telefon" value="<?= h($edit_data['telefon']) ?>">
          </div>
          
          <div class="form-group">
            <label for="weboldal">Weboldal</label>
            <input type="url" id="weboldal" name="weboldal" value="<?= h($edit_data['weboldal']) ?>">
          </div>
          
          <div class="form-actions">
            <button type="submit" name="mentes_felhasznalo" class="btn btn-success">Mentés</button>
            <a href="?" class="btn btn-cancel">Mégse</a>
          </div>
        </form>
      </div>
    <?php endif; ?>

    <!-- Keresés és szűrés -->
    <div class="search-filter">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Keresés felhasználók között...">
      </div>
    </div>

    <!-- Táblázat -->
    <div class="table-container">
      <?php if ($result && $result->num_rows > 0): ?>
        <table id="usersTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>Email</th>
              <th>Jelszó</th>
              <th>Szám</th>
              <th>Nem</th>
              <th>Dátum</th>
              <th>Opció</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <?php while ($row = $result->fetch_assoc()): ?>
              <tr>
                <td><?= h($row['id']) ?></td>
                <td><strong><?= h($row['szoveg']) ?></strong></td>
                <td><?= h($row['email']) ?></td>
                <td class="password-field"><?= h($row['jelszo']) ?></td>
                <td><?= h($row['szam']) ?></td>
                <td>
                  <?php if ($row['nem'] == 'ferfi'): ?>
                    <span class="gender-badge gender-male">Férfi</span>
                  <?php elseif ($row['nem'] == 'no'): ?>
                    <span class="gender-badge gender-female">Nő</span>
                  <?php else: ?>
                    <span>-</span>
                  <?php endif; ?>
                </td>
                <td><?= h($row['datum']) ?></td>
                <td>
                  <?php if (!empty($row['valasztott_opcio'])): ?>
                    <span class="option-badge"><?= h($row['valasztott_opcio']) ?></span>
                  <?php else: ?>
                    <span>-</span>
                  <?php endif; ?>
                </td>
                <td>
                  <div class="action-buttons">
                    <a href="?szerkeszt=<?= $row['id'] ?>" class="btn btn-edit">Szerkesztés</a>
                    <a href="?torol=<?= $row['id'] ?>" class="btn btn-danger" onclick="return confirm('Biztosan törlöd ezt a felhasználót?')">Törlés</a>
                  </div>
                </td>
              </tr>
            <?php endwhile; ?>
          </tbody>
        </table>
      <?php else: ?>
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>Nincsenek felhasználók</h3>
          <p>Még nincsenek hozzáadva felhasználók. Adj hozzá újat a gombra kattintva!</p>
        </div>
      <?php endif; ?>
    </div>
  </div>

  <script>
    // Keresés funkció
    document.getElementById('searchInput').addEventListener('input', function() {
      const searchValue = this.value.toLowerCase();
      const table = document.getElementById('usersTable');
      
      if (!table) return;
      
      const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length - 1; j++) { // Az utolsó oszlop (műveletek) kihagyása
          const cellText = cells[j].textContent || cells[j].innerText;
          if (cellText.toLowerCase().indexOf(searchValue) > -1) {
            found = true;
            break;
          }
        }
        
        rows[i].style.display = found ? '' : 'none';
      }
    });
  </script>
</body>
</html>