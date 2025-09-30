<?php
include('connect.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // desztinaciok
    if (isset($_POST['ment_desztinacio'])) {
        $nev    = $_POST['d_nev'];
        $leiras = $_POST['d_leiras'];
        $lat    = $_POST['d_lat'];
        $lng    = $_POST['d_lng'];

        $sql = "INSERT INTO desztinaciok (nev, leiras, lat, lng) 
                VALUES ('$nev', '$leiras', '$lat', '$lng')";
    }

    // esemenyek
    if (isset($_POST['ment_esemeny'])) {
        $nev     = $_POST['e_nev'];
        $datum   = $_POST['e_datum'];
        $helyszin= $_POST['e_helyszin'];
        $leiras  = $_POST['e_leiras'];
        $lat     = $_POST['e_lat'];
        $lng     = $_POST['e_lng'];

        $sql = "INSERT INTO esemenyek (nev, datum, helyszin, leiras, lat, lng) 
                VALUES ('$nev', '$datum', '$helyszin', '$leiras', '$lat', '$lng')";
    }

    // kolcsonzok
    if (isset($_POST['ment_kolcsonzo'])) {
        $nev    = $_POST['k_nev'];
        $cim    = $_POST['k_cim'];
        $lat    = $_POST['k_lat'];
        $lng    = $_POST['k_lng'];
        $nyitva = $_POST['k_nyitvatartas'];

        $sql = "INSERT INTO kolcsonzok (nev, cim, lat, lng, nyitvatartas) 
                VALUES ('$nev', '$cim', '$lat', '$lng', '$nyitva')";
    }

    // utvonalak
    if (isset($_POST['ment_utvonal'])) {
        $nev        = $_POST['u_nev'];
        $hossz      = $_POST['u_hossz'];
        $nehezseg   = $_POST['u_nehezseg'];
        $lat        = $_POST['u_lat'];
        $lng        = $_POST['u_lng'];
        $koordinatak= $_POST['u_koordinatak'];

        $sql = "INSERT INTO utvonalak (nev, hossz_km, nehezseg, lat, lng, koordinatak) 
                VALUES ('$nev', '$hossz', '$nehezseg', '$lat', '$lng', '$koordinatak')";
    }

    // felhasznalok
    if (isset($_POST['ment_felhasznalo'])) {
        $szoveg     = $_POST['f_szoveg'];
        $jelszo     = $_POST['f_jelszo'];
        $szam       = $_POST['f_szam'];
        $datum      = $_POST['f_datum'];
        $ido        = $_POST['f_ido'];
        $datumido   = $_POST['f_datumido'];
        $nem        = $_POST['f_nem'];
        $erdeklodes = isset($_POST['f_erdeklodes']) ? implode(",", $_POST['f_erdeklodes']) : "";
        $valasztott = $_POST['f_valasztott'];
        $email      = $_POST['f_email'];
        $telefon    = $_POST['f_telefon'];
        $weboldal   = $_POST['f_weboldal'];

        $sql = "INSERT INTO felhasznalok 
                (szoveg, jelszo, szam, datum, ido, datumido, nem, erdeklodesek, valasztott_opcio, feltoltott_fajl, email, telefon, weboldal) 
                VALUES 
                ('$szoveg', '$jelszo', '$szam', '$datum', '$ido', '$datumido', '$nem', '$erdeklodes', '$valasztott', '', '$email', '$telefon', '$weboldal')";
    }

    if (isset($sql)) {
        if ($conn->query($sql) === TRUE) {
            $success_message = "✅ Sikeres mentés!";
        } else {
            $error_message = "❌ Hiba: " . $conn->error;
        }
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adat Létrehozás - Admin Panel</title>
  <style>
    /* Alap stílusok */
    :root {
      --primary-color: #3498db;
      --secondary-color: #2ecc71;
      --accent-color: #9b59b6;
      --warning-color: #f39c12;
      --danger-color: #e74c3c;
      --dark-color: #2c3e50;
      --light-color: #ecf0f1;
      --text-color: #333;
      --border-radius: 16px;
      --box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 30px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      backdrop-filter: blur(10px);
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header p {
      font-size: 1.1rem;
      color: #666;
    }

    /* Vissza gomb */
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 12px 25px;
      background-color: var(--dark-color);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius);
      transition: var(--transition);
      font-weight: 600;
    }

    .back-button:hover {
      background-color: #1a252f;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    }

    /* Tab konténer */
    .tab-container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      backdrop-filter: blur(10px);
      overflow: hidden;
    }

    /* Tab fejléc */
    .tab-header {
      display: flex;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 10px;
      gap: 8px;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      position: relative;
    }

    .tab-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 15px 20px;
      background: transparent;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--dark-color);
      cursor: pointer;
      transition: var(--transition);
      position: relative;
      z-index: 1;
    }

    .tab-button:hover {
      background: rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);
    }

    .tab-button.active {
      color: white;
    }

    .tab-indicator {
      position: absolute;
      top: 10px;
      left: 0;
      height: calc(100% - 20px);
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      transition: var(--transition);
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    /* Tab tartalom */
    .tab-content {
      display: none;
      padding: 40px;
      animation: fadeIn 0.5s ease-in-out;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Űrlap stílusok */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--dark-color);
      font-size: 0.95rem;
    }

    input, textarea, select {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 16px;
      transition: var(--transition);
      background: white;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      transform: translateY(-1px);
    }

    textarea {
      min-height: 120px;
      resize: vertical;
      line-height: 1.5;
    }

    /* Checkbox és radio csoportok */
    .checkbox-group, .radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 8px;
    }

    .checkbox-item, .radio-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: var(--transition);
    }

    .checkbox-item:hover, .radio-item:hover {
      background: #e9ecef;
    }

    .checkbox-item input, .radio-item input {
      width: auto;
      transform: scale(1.2);
    }

    /* Gombok */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      background: linear-gradient(135deg, var(--secondary-color), #27ae60);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      text-align: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
    }

    .btn-block {
      width: 100%;
      margin-top: 20px;
    }

    /* Üzenetek */
    .message {
      padding: 20px;
      margin-bottom: 25px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      text-align: center;
      box-shadow: var(--box-shadow);
    }

    .success {
      background: rgba(46, 204, 113, 0.15);
      color: #27ae60;
      border-left: 4px solid var(--secondary-color);
    }

    .error {
      background: rgba(231, 76, 60, 0.15);
      color: #c0392b;
      border-left: 4px solid var(--danger-color);
    }

    /* Speciális csoportok */
    .coord-group, .datetime-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    /* Reszponzív design */
    @media (max-width: 768px) {
      .tab-header {
        flex-direction: column;
      }
      
      .tab-button {
        padding: 12px 15px;
        font-size: 0.9rem;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .coord-group,
      .datetime-group {
        grid-template-columns: 1fr;
      }
      
      .tab-content {
        padding: 25px;
      }
      
      .header h1 {
        font-size: 2rem;
      }
    }

    /* Placeholder stílus */
    ::placeholder {
      color: #a0a0a0;
      opacity: 1;
    }

    /* Select arrow stílus */
    select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1>📝 Új Adat Létrehozása</h1>
      <p>Válassza ki a létrehozni kívánt adat típusát</p>
      
      <a href="index.php" class="back-button">
        <span>←</span>
        Vissza a főmenühöz
      </a>
    </header>

    <!-- Üzenetek -->
    <?php if (isset($success_message)): ?>
      <div class="message success"><?php echo $success_message; ?></div>
    <?php endif; ?>
    
    <?php if (isset($error_message)): ?>
      <div class="message error"><?php echo $error_message; ?></div>
    <?php endif; ?>

    <!-- Tab konténer -->
    <div class="tab-container">
      <!-- Tab fejléc -->
      <div class="tab-header">
        <div class="tab-indicator" id="tabIndicator"></div>
        
        <button class="tab-button active" data-tab="destination">
          <span>🏔️</span>
          Desztináció
        </button>
        
        <button class="tab-button" data-tab="event">
          <span>🎪</span>
          Esemény
        </button>
        
        <button class="tab-button" data-tab="rental">
          <span>🚲</span>
          Kölcsönző
        </button>
        
        <button class="tab-button" data-tab="route">
          <span>🛣️</span>
          Útvonal
        </button>
        
        <button class="tab-button" data-tab="user">
          <span>👥</span>
          Felhasználó
        </button>
      </div>

      <!-- Tab tartalmak -->
      <div class="tab-content active" id="destination">
        <form method="post" class="form-grid">
          <div class="form-group">
            <label for="d_nev">Desztináció neve</label>
            <input type="text" id="d_nev" name="d_nev" placeholder="Adja meg a desztináció nevét" required>
          </div>
          
          <div class="form-group">
            <label for="d_leiras">Leírás</label>
            <textarea id="d_leiras" name="d_leiras" placeholder="Részletes leírás a desztinációról" required></textarea>
          </div>
          
          <div class="coord-group">
            <div class="form-group">
              <label for="d_lat">Szélesség (lat)</label>
              <input type="text" id="d_lat" name="d_lat" placeholder="Pl. 47.497913" required>
            </div>
            
            <div class="form-group">
              <label for="d_lng">Hosszúság (lng)</label>
              <input type="text" id="d_lng" name="d_lng" placeholder="Pl. 19.040236" required>
            </div>
          </div>
          
          <button type="submit" name="ment_desztinacio" class="btn btn-block">
            <span>💾</span>
            Desztináció mentése
          </button>
        </form>
      </div>

      <div class="tab-content" id="event">
        <form method="post" class="form-grid">
          <div class="form-group">
            <label for="e_nev">Esemény neve</label>
            <input type="text" id="e_nev" name="e_nev" placeholder="Adja meg az esemény nevét" required>
          </div>
          
          <div class="form-group">
            <label for="e_datum">Dátum</label>
            <input type="date" id="e_datum" name="e_datum" required>
          </div>
          
          <div class="form-group">
            <label for="e_helyszin">Helyszín</label>
            <input type="text" id="e_helyszin" name="e_helyszin" placeholder="Esemény helyszíne" required>
          </div>
          
          <div class="form-group">
            <label for="e_leiras">Leírás</label>
            <textarea id="e_leiras" name="e_leiras" placeholder="Részletes leírás az eseményről" required></textarea>
          </div>
          
          <div class="coord-group">
            <div class="form-group">
              <label for="e_lat">Szélesség (lat)</label>
              <input type="text" id="e_lat" name="e_lat" placeholder="Pl. 47.497913" required>
            </div>
            
            <div class="form-group">
              <label for="e_lng">Hosszúság (lng)</label>
              <input type="text" id="e_lng" name="e_lng" placeholder="Pl. 19.040236" required>
            </div>
          </div>
          
          <button type="submit" name="ment_esemeny" class="btn btn-block">
            <span>💾</span>
            Esemény mentése
          </button>
        </form>
      </div>

      <div class="tab-content" id="rental">
        <form method="post" class="form-grid">
          <div class="form-group">
            <label for="k_nev">Kölcsönző neve</label>
            <input type="text" id="k_nev" name="k_nev" placeholder="Adja meg a kölcsönző nevét" required>
          </div>
          
          <div class="form-group">
            <label for="k_cim">Cím</label>
            <input type="text" id="k_cim" name="k_cim" placeholder="Teljes cím" required>
          </div>
          
          <div class="coord-group">
            <div class="form-group">
              <label for="k_lat">Szélesség (lat)</label>
              <input type="text" id="k_lat" name="k_lat" placeholder="Pl. 47.497913" required>
            </div>
            
            <div class="form-group">
              <label for="k_lng">Hosszúság (lng)</label>
              <input type="text" id="k_lng" name="k_lng" placeholder="Pl. 19.040236" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="k_nyitvatartas">Nyitvatartás</label>
            <input type="text" id="k_nyitvatartas" name="k_nyitvatartas" placeholder="Pl. 08:00-20:00" required>
          </div>
          
          <button type="submit" name="ment_kolcsonzo" class="btn btn-block">
            <span>💾</span>
            Kölcsönző mentése
          </button>
        </form>
      </div>

      <div class="tab-content" id="route">
        <form method="post" class="form-grid">
          <div class="form-group">
            <label for="u_nev">Útvonal neve</label>
            <input type="text" id="u_nev" name="u_nev" placeholder="Adja meg az útvonal nevét" required>
          </div>
          
          <div class="form-group">
            <label for="u_hossz">Hossz (km)</label>
            <input type="number" id="u_hossz" name="u_hossz" step="0.1" placeholder="Pl. 12.5" required>
          </div>
          
          <div class="form-group">
            <label for="u_nehezseg">Nehézség</label>
            <select id="u_nehezseg" name="u_nehezseg" required>
              <option value="">Válasszon nehézségi szintet</option>
              <option value="könnyű">Könnyű</option>
              <option value="közepes">Közepes</option>
              <option value="nehéz">Nehéz</option>
            </select>
          </div>
          
          <div class="coord-group">
            <div class="form-group">
              <label for="u_lat">Szélesség (lat)</label>
              <input type="text" id="u_lat" name="u_lat" placeholder="Pl. 47.497913" required>
            </div>
            
            <div class="form-group">
              <label for="u_lng">Hosszúság (lng)</label>
              <input type="text" id="u_lng" name="u_lng" placeholder="Pl. 19.040236" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="u_koordinatak">Koordináták (JSON)</label>
            <textarea id="u_koordinatak" name="u_koordinatak" placeholder='[{"lat": 47.123, "lng": 19.456}, {"lat": 47.124, "lng": 19.457}]'></textarea>
          </div>
          
          <button type="submit" name="ment_utvonal" class="btn btn-block">
            <span>💾</span>
            Útvonal mentése
          </button>
        </form>
      </div>

      <div class="tab-content" id="user">
        <form method="post" class="form-grid">
          <div class="form-group">
            <label for="f_szoveg">Név</label>
            <input type="text" id="f_szoveg" name="f_szoveg" placeholder="Teljes név" required>
          </div>
          
          <div class="form-group">
            <label for="f_jelszo">Jelszó</label>
            <input type="password" id="f_jelszo" name="f_jelszo" placeholder="Erős jelszó" required>
          </div>
          
          <div class="form-group">
            <label for="f_szam">Szám</label>
            <input type="number" id="f_szam" name="f_szam" placeholder="Pl. 12345">
          </div>
          
          <div class="datetime-group">
            <div class="form-group">
              <label for="f_datum">Dátum</label>
              <input type="date" id="f_datum" name="f_datum">
            </div>
            
            <div class="form-group">
              <label for="f_ido">Idő</label>
              <input type="time" id="f_ido" name="f_ido">
            </div>
          </div>
          
          <div class="form-group">
            <label for="f_datumido">Dátum és idő</label>
            <input type="datetime-local" id="f_datumido" name="f_datumido">
          </div>
          
          <div class="form-group">
            <label>Nem</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="f_nem_ferfi" name="f_nem" value="ferfi">
                <label for="f_nem_ferfi">Férfi</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="f_nem_no" name="f_nem" value="no">
                <label for="f_nem_no">Nő</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Érdeklődési körök</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="f_erdeklodes_sport" name="f_erdeklodes[]" value="sport">
                <label for="f_erdeklodes_sport">🏃 Sport</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="f_erdeklodes_zene" name="f_erdeklodes[]" value="zene">
                <label for="f_erdeklodes_zene">🎵 Zene</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="f_erdeklodes_olvasas" name="f_erdeklodes[]" value="olvasas">
                <label for="f_erdeklodes_olvasas">📚 Olvasás</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="f_valasztott">Választott opció</label>
            <select id="f_valasztott" name="f_valasztott">
              <option value="">-- Válasszon opciót --</option>
              <option value="opcio1">Opció 1</option>
              <option value="opcio2">Opció 2</option>
              <option value="opcio3">Opció 3</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="f_email">Email</label>
            <input type="email" id="f_email" name="f_email" placeholder="email@pelda.hu">
          </div>
          
          <div class="form-group">
            <label for="f_telefon">Telefon</label>
            <input type="tel" id="f_telefon" name="f_telefon" placeholder="+36 30 123 4567">
          </div>
          
          <div class="form-group">
            <label for="f_weboldal">Weboldal</label>
            <input type="url" id="f_weboldal" name="f_weboldal" placeholder="https://pelda.hu">
          </div>
          
          <button type="submit" name="ment_felhasznalo" class="btn btn-block">
            <span>💾</span>
            Felhasználó mentése
          </button>
        </form>
      </div>
    </div>
  </div>

  <script>
    // Tab váltó funkció
    document.addEventListener('DOMContentLoaded', function() {
      const tabButtons = document.querySelectorAll('.tab-button');
      const tabContents = document.querySelectorAll('.tab-content');
      const tabIndicator = document.getElementById('tabIndicator');
      
      // Aktív tab beállítása
      function setActiveTab(tabName) {
        // Tab gombok frissítése
        tabButtons.forEach(button => {
          button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Tab tartalmak frissítése
        tabContents.forEach(content => {
          content.classList.toggle('active', content.id === tabName);
        });
        
        // Indikátor pozíció frissítése
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
        if (activeButton) {
          const buttonRect = activeButton.getBoundingClientRect();
          const containerRect = activeButton.parentElement.getBoundingClientRect();
          
          tabIndicator.style.width = `${buttonRect.width}px`;
          tabIndicator.style.transform = `translateX(${buttonRect.left - containerRect.left}px)`;
        }
      }
      
      // Kattintás esemény kezelése
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          setActiveTab(button.dataset.tab);
        });
      });
      
      // Indikátor inicializálása
      setActiveTab('destination');
      
      // Resize esemény kezelése
      window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        setActiveTab(activeTab);
      });
    });
  </script>
</body>
</html>