<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Főmenü</title>
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
            --border-radius: 12px;
            --box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            backdrop-filter: blur(10px);
        }

        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 20px;
        }

        /* Navigációs linkek */
        .nav-links {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }

        .nav-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 25px;
            background: rgba(255, 255, 255, 0.9);
            color: var(--dark-color);
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: var(--transition);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .nav-link:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
            background: white;
        }

        .nav-link.create {
            background: var(--secondary-color);
            color: white;
        }

        .nav-link.home {
            background: var(--primary-color);
            color: white;
        }

        /* Fő tartalom */
        .main-content {
            background: rgba(255, 255, 255, 0.95);
            border-radius: var(--border-radius);
            padding: 40px;
            box-shadow: var(--box-shadow);
            backdrop-filter: blur(10px);
        }

        .section-title {
            text-align: center;
            margin-bottom: 30px;
            color: var(--dark-color);
            font-size: 2rem;
        }

        /* Menü kártyák */
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .menu-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 30px;
            text-align: center;
            box-shadow: var(--box-shadow);
            transition: var(--transition);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .menu-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
            display: block;
        }

        .card-title {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: var(--dark-color);
        }

        .card-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .card-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 25px;
            background: var(--primary-color);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: var(--transition);
        }

        .card-button:hover {
            background: var(--dark-color);
            transform: translateY(-2px);
        }

        /* Speciális kártya színek */
        .card-users {
            border-top: 4px solid var(--primary-color);
        }

        .card-destinations {
            border-top: 4px solid var(--secondary-color);
        }

        .card-events {
            border-top: 4px solid var(--accent-color);
        }

        .card-rentals {
            border-top: 4px solid var(--warning-color);
        }

        .card-routes {
            border-top: 4px solid var(--danger-color);
        }

        /* Statisztika szekció */
        .stats-section {
            margin-top: 40px;
            padding: 30px;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            border-radius: var(--border-radius);
            color: white;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .stat-item {
            text-align: center;
            padding: 20px;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .stat-label {
            font-size: 1rem;
            opacity: 0.9;
        }

        /* Reszponzív design */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.2rem;
            }
            
            .nav-links {
                flex-direction: column;
                align-items: center;
            }
            
            .nav-link {
                width: 100%;
                max-width: 300px;
                justify-content: center;
            }
            
            .menu-grid {
                grid-template-columns: 1fr;
            }
            
            .main-content {
                padding: 20px;
            }
        }

        /* Animációk */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .menu-card, .nav-link, .header {
            animation: fadeInUp 0.6s ease forwards;
        }

        .menu-card:nth-child(1) { animation-delay: 0.1s; }
        .menu-card:nth-child(2) { animation-delay: 0.2s; }
        .menu-card:nth-child(3) { animation-delay: 0.3s; }
        .menu-card:nth-child(4) { animation-delay: 0.4s; }
        .menu-card:nth-child(5) { animation-delay: 0.5s; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1>🚀 Admin Főmenü</h1>
            <p>Központi irányítópult az összes adat kezeléséhez</p>
            
            <!-- Navigációs linkek -->
            <div class="nav-links">
                <a href="felhasznalok.php" class="nav-link create">
                    <span>➕</span>
                    Létrehozás
                </a>
                <a href="../index.html" class="nav-link home">
                    <span>🏠</span>
                    Főmenü [itt van minden]
                </a>
            </div>
        </header>

        <!-- Fő tartalom -->
        <main class="main-content">
            <h2 class="section-title">📊 Adatkezelési Modulok</h2>
            
            <!-- Menü kártyák -->
            <div class="menu-grid">
                <!-- Felhasználók kártya -->
                <div class="menu-card card-users">
                    <span class="card-icon">👥</span>
                    <h3 class="card-title">Felhasználók</h3>
                    <p class="card-description">Felhasználói fiókok kezelése, szerkesztése és törlése</p>
                    <a href="felhasznalok_lista_new.php" class="card-button">
                        <span>📋</span>
                        Lista megtekintése
                    </a>
                </div>

                <!-- Desztinációk kártya -->
                <div class="menu-card card-destinations">
                    <span class="card-icon">🏔️</span>
                    <h3 class="card-title">Desztinációk</h3>
                    <p class="card-description">Célállomások és érdekes helyek kezelése</p>
                    <a href="desztinaciok_lista.php" class="card-button">
                        <span>🗺️</span>
                        Lista megtekintése
                    </a>
                </div>

                <!-- Események kártya -->
                <div class="menu-card card-events">
                    <span class="card-icon">🎪</span>
                    <h3 class="card-title">Események</h3>
                    <p class="card-description">Rendezvények és programok kezelése</p>
                    <a href="esemenyek_lista.php" class="card-button">
                        <span>📅</span>
                        Lista megtekintése
                    </a>
                </div>

                <!-- Kölcsönzők kártya -->
                <div class="menu-card card-rentals">
                    <span class="card-icon">🚲</span>
                    <h3 class="card-title">Kölcsönzők</h3>
                    <p class="card-description">Bérlési pontok és szolgáltatások kezelése</p>
                    <a href="kolcsonzok_lista.php" class="card-button">
                        <span>🏪</span>
                        Lista megtekintése
                    </a>
                </div>

                <!-- Útvonalak kártya -->
                <div class="menu-card card-routes">
                    <span class="card-icon">🛣️</span>
                    <h3 class="card-title">Útvonalak</h3>
                    <p class="card-description">Túraútvonalak és javaslatok kezelése</p>
                    <a href="utvonalak_lista.php" class="card-button">
                        <span>🧭</span>
                        Lista megtekintése
                    </a>
                </div>
            </div>

            <!-- Statisztika szekció -->
            <div class="stats-section">
                <h3 style="text-align: center; margin-bottom: 30px; font-size: 1.5rem;">📈 Rendszer Statisztikák</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">1,247</div>
                        <div class="stat-label">Összes felhasználó</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">89</div>
                        <div class="stat-label">Aktív desztinációk</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">34</div>
                        <div class="stat-label">Közelgő események</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">56</div>
                        <div class="stat-label">Kölcsönző helyek</div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Egyszerű animáció a statisztikákhoz
        document.addEventListener('DOMContentLoaded', function() {
            const statNumbers = document.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current);
                }, 30);
            });
        });
    </script>
</body>
</html>