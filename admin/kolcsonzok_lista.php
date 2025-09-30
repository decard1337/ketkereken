<?php
include('connect.php');

// Törlés kezelése
if (isset($_GET['torol_kolcsonzok'])) {
    $id = (int) $_GET['torol_kolcsonzok'];
    $conn->query("DELETE FROM kolcsonzok WHERE id = $id");
    header("Location: " . str_replace("&torol_kolcsonzok=$id", "", $_SERVER['REQUEST_URI']));
    exit;
}

// Szerkesztés adatok betöltése
$edit_id = null;
$edit_data = null;
if (isset($_GET['szerkeszt_kolcsonzok'])) {
    $edit_id = (int) $_GET['szerkeszt_kolcsonzok'];
    $result = $conn->query("SELECT * FROM kolcsonzok WHERE id = $edit_id");
    if ($result && $result->num_rows > 0) {
        $edit_data = $result->fetch_assoc();
    }
}

// Mentés kezelése
if (isset($_POST['mentes_kolcsonzok'])) {
    $id = (int) $_POST['id'];
    $nev = $_POST['nev'];
    $cim = $_POST['cim'];
    $lat = $_POST['lat'];
    $lng = $_POST['lng'];
    $nyitvatartas = $_POST['nyitvatartas'];
    
    $sql = "UPDATE kolcsonzok SET nev = '$nev', cim = '$cim', lat = '$lat', lng = '$lng', nyitvatartas = '$nyitvatartas' WHERE id = $id";
    if ($conn->query($sql) === TRUE) {
        header("Location: " . str_replace("&szerkeszt_kolcsonzok=$id", "", $_SERVER['REQUEST_URI']));
        exit;
    } else {
        $error = "Hiba a mentés során: " . $conn->error;
    }
}

$sql2 = "SELECT id, nev, cim, nyitvatartas, lat, lng FROM kolcsonzok ORDER BY id DESC";
$result2 = $conn->query($sql2);

function h($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kölcsönzők listája</title>
  <style>
    /* Alap stílusok */
    :root {
      --primary-color: #1abc9c;
      --secondary-color: #16a085;
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
      background-color: #16a085;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-success {
      background-color: var(--secondary-color);
      color: white;
    }

    .btn-success:hover {
      background-color: #138d75;
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
      background-color: #138d75;
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
      content: "🏪";
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
    .form-group textarea {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      font-size: 16px;
      transition: var(--transition);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.2);
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 25px;
    }

    /* Koordináta csoport */
    .coord-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    /* Nyitvatartás badge */
    .hours-badge {
      background: #d5f4e6;
      color: var(--secondary-color);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .hours-badge::before {
      content: "🕒";
      font-size: 0.9rem;
    }

    /* Cím formázás */
    .address {
      color: #666;
      font-size: 0.9rem;
      max-width: 250px;
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
      
      .coord-group {
        grid-template-columns: 1fr;
      }
      
      .address {
        max-width: 150px;
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
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.2);
    }

    /* Kölcsönző kártyák (alternatív nézet) */
    .card-view {
      display: none;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .kolcsonzo-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: var(--box-shadow);
      transition: var(--transition);
      border-left: 4px solid var(--primary-color);
    }

    .kolcsonzo-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    .kolcsonzo-card h3 {
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    .kolcsonzo-card .address {
      margin-bottom: 10px;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    /* Nézet váltó */
    .view-toggle {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .view-btn {
      padding: 10px 15px;
      background: white;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
    }

    .view-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
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
      <h1>Kölcsönzők listája</h1>
      <p class="subtitle">Összes kölcsönző megtekintése és kezelése</p>
    </header>

    <?php if (isset($error)): ?>
      <div class="message error"><?= h($error) ?></div>
    <?php endif; ?>

    <!-- Statisztika kártyák -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-number"><?= $result2 ? $result2->num_rows : 0 ?></div>
        <div class="stat-label">Összes kölcsönző</div>
      </div>
      <div class="stat-card">
        <div class="stat-number"><?= $edit_id ? 'Szerkesztés' : 'Lista' ?></div>
        <div class="stat-label">Aktuális mód</div>
      </div>
    </div>

    <!-- Új kölcsönző gomb -->
    <div style="margin-bottom: 20px;">
      <a href="index.php" class="btn btn-add">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Új kölcsönző hozzáadása
      </a>
    </div>

    <!-- Szerkesztő űrlap -->
    <?php if ($edit_data): ?>
      <div class="edit-form-container">
        <h2>Kölcsönző szerkesztése</h2>
        <form method="post">
          <input type="hidden" name="id" value="<?= h($edit_data['id']) ?>">
          
          <div class="form-group">
            <label for="nev">Kölcsönző neve</label>
            <input type="text" id="nev" name="nev" value="<?= h($edit_data['nev']) ?>" required>
          </div>
          
          <div class="form-group">
            <label for="cim">Cím</label>
            <textarea id="cim" name="cim" required><?= h($edit_data['cim']) ?></textarea>
          </div>
          
          <div class="coord-group">
            <div class="form-group">
              <label for="lat">Szélesség (lat)</label>
              <input type="text" id="lat" name="lat" value="<?= h($edit_data['lat']) ?>" required>
            </div>
            
            <div class="form-group">
              <label for="lng">Hosszúság (lng)</label>
              <input type="text" id="lng" name="lng" value="<?= h($edit_data['lng']) ?>" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="nyitvatartas">Nyitvatartás</label>
            <input type="text" id="nyitvatartas" name="nyitvatartas" value="<?= h($edit_data['nyitvatartas']) ?>" placeholder="pl. 08:00-20:00" required>
          </div>
          
          <div class="form-actions">
            <button type="submit" name="mentes_kolcsonzok" class="btn btn-success">Mentés</button>
            <a href="?" class="btn btn-cancel">Mégse</a>
          </div>
        </form>
      </div>
    <?php endif; ?>

    <!-- Keresés és szűrés -->
    <div class="search-filter">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Keresés kölcsönzők között...">
      </div>
    </div>

    <!-- Táblázat nézet -->
    <div class="table-container">
      <?php if ($result2 && $result2->num_rows > 0): ?>
        <table id="kolcsonzokTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>Cím</th>
              <th>Nyitvatartás</th>
              <th>Koordináták</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <?php while ($row = $result2->fetch_assoc()): ?>
              <tr>
                <td><?= h($row['id']) ?></td>
                <td><strong><?= h($row['nev']) ?></strong></td>
                <td class="address"><?= h($row['cim']) ?></td>
                <td>
                  <?php if (!empty($row['nyitvatartas'])): ?>
                    <span class="hours-badge"><?= h($row['nyitvatartas']) ?></span>
                  <?php else: ?>
                    <span>-</span>
                  <?php endif; ?>
                </td>
                <td><?= h($row['lat']) ?>, <?= h($row['lng']) ?></td>
                <td>
                  <div class="action-buttons">
                    <a href="?szerkeszt_kolcsonzok=<?= $row['id'] ?>" class="btn btn-edit">Szerkesztés</a>
                    <a href="?torol_kolcsonzok=<?= $row['id'] ?>" class="btn btn-danger" onclick="return confirm('Biztosan törlöd ezt a kölcsönzőt?')">Törlés</a>
                  </div>
                </td>
              </tr>
            <?php endwhile; ?>
          </tbody>
        </table>
      <?php else: ?>
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3>Nincsenek kölcsönzők</h3>
          <p>Még nincsenek hozzáadva kölcsönzők. Adj hozzá újat a gombra kattintva!</p>
        </div>
      <?php endif; ?>
    </div>
  </div>

  <script>
    // Keresés funkció
    document.getElementById('searchInput').addEventListener('input', function() {
      const searchValue = this.value.toLowerCase();
      const table = document.getElementById('kolcsonzokTable');
      
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