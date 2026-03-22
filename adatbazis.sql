-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Már 22. 11:58
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `ketkerek`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `blippek`
--

CREATE TABLE `blippek` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `tipus` enum('kölcsönző','szerviz','pihenő','látványosság') DEFAULT NULL,
  `ikon` varchar(50) DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `blippek`
--

INSERT INTO `blippek` (`id`, `nev`, `leiras`, `lat`, `lng`, `tipus`, `ikon`, `statusz`) VALUES
(1, 'Biciklikölcsönző - Deák tér', 'Bubi állomás', 47.49790000, 19.05110000, 'kölcsönző', 'bicycle', 'aktiv'),
(2, 'Kerékpár szerviz', 'Professzionális kerékpár javítás', 47.50210000, 19.03920000, 'szerviz', 'tools', 'aktiv'),
(3, 'Duna panoráma', 'Gyönyörű kilátás a Dunára', 47.49880000, 19.04390000, 'látványosság', 'camera', 'aktiv');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `destinaciok`
--

CREATE TABLE `destinaciok` (
  `id` int(11) NOT NULL,
  `nev` varchar(200) NOT NULL,
  `leiras` text DEFAULT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `ertekeles` decimal(2,1) DEFAULT NULL,
  `tipus` enum('kilato','strand','muzeum','park','etterm') DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `destinaciok`
--

INSERT INTO `destinaciok` (`id`, `nev`, `leiras`, `lat`, `lng`, `ertekeles`, `tipus`, `statusz`) VALUES
(1, 'Hősök tere', 'Iconic square with statues of Hungarian leaders', 47.51550000, 19.07890000, 4.7, 'kilato', 'aktiv'),
(2, 'Margit-sziget', 'Beautiful island park in the Danube', 47.52760000, 19.04620000, 4.8, 'park', 'aktiv'),
(3, 'Gellért fürdő', 'Historic thermal bath', 47.48390000, 19.05060000, 4.6, 'strand', 'aktiv');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ertekelesek`
--

CREATE TABLE `ertekelesek` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `cel_tipus` enum('utvonal','esemeny','destinacio','kolcsonzo','blipp') NOT NULL,
  `cel_id` int(11) NOT NULL,
  `pontszam` tinyint(4) NOT NULL,
  `szoveg` text DEFAULT NULL,
  `statusz` enum('fuggoben','elfogadva','elutasitva') NOT NULL DEFAULT 'fuggoben',
  `letrehozva` timestamp NOT NULL DEFAULT current_timestamp(),
  `ellenorizte_admin` int(11) DEFAULT NULL,
  `ellenorizve` timestamp NULL DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `esemenyek`
--

CREATE TABLE `esemenyek` (
  `id` int(11) NOT NULL,
  `nev` varchar(200) NOT NULL,
  `leiras` text DEFAULT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `datum` date NOT NULL,
  `resztvevok` int(11) DEFAULT NULL,
  `tipus` enum('verseny','tura','fesztival','workshop') DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `utvonal_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `esemenyek`
--

INSERT INTO `esemenyek` (`id`, `nev`, `leiras`, `lat`, `lng`, `datum`, `resztvevok`, `tipus`, `statusz`, `utvonal_id`) VALUES
(1, 'Budapest Bike Festival', 'Annual bicycle festival with races and exhibitions', 47.49790000, 19.04020000, '2026-06-15', 5000, 'fesztival', 'aktiv', NULL),
(2, 'Duna-parti túra', 'Guided bike tour along the Danube', 47.50000000, 19.05000000, '2026-05-20', 200, 'tura', 'aktiv', NULL),
(3, 'Hegyi kerékpáros verseny', 'Mountain bike competition in Buda hills', 47.49060000, 19.03090000, '2026-07-10', 300, 'verseny', 'aktiv', NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `felhasznalonev` varchar(80) DEFAULT NULL,
  `jelszo_hash` varchar(255) DEFAULT NULL,
  `rang` enum('felhasznalo','admin') DEFAULT NULL,
  `letrehozva` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `email`, `felhasznalonev`, `jelszo_hash`, `rang`, `letrehozva`) VALUES
(1, 'fiszfassz', 'admin', '$2b$12$1WMlrbrgT9WAmT8HQ5q5zOWKZX6cfdI3.7rhXGYEBlYlpE5rMncwu', 'admin', '2026-03-04 20:26:43'),
(2, 'kutya@gmail.com', 'ferihegy', '$2b$12$iXpypqw073OmFRrMptqjkOuVZqLMT53fvjpARXRCBx5ZQ1JSJFnlm', 'admin', '2026-03-13 13:57:36');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kedvencek`
--

CREATE TABLE `kedvencek` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `cel_tipus` enum('utvonal','esemeny','destinacio','kolcsonzo','blipp') NOT NULL,
  `cel_id` int(11) NOT NULL,
  `letrehozva` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kepek`
--

CREATE TABLE `kepek` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `cel_tipus` enum('utvonal','esemeny','destinacio','kolcsonzo','blipp') NOT NULL,
  `cel_id` int(11) NOT NULL,
  `fajl_utvonal` varchar(255) NOT NULL,
  `leiras` varchar(255) DEFAULT NULL,
  `statusz` enum('fuggoben','elfogadva','elutasitva') NOT NULL DEFAULT 'fuggoben',
  `letrehozva` timestamp NOT NULL DEFAULT current_timestamp(),
  `ellenorizte_admin` int(11) DEFAULT NULL,
  `ellenorizve` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kolcsonzok`
--

CREATE TABLE `kolcsonzok` (
  `id` int(11) NOT NULL,
  `nev` varchar(200) NOT NULL,
  `cim` varchar(300) NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `ar` varchar(100) DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `nyitvatartas` varchar(100) DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kolcsonzok`
--

INSERT INTO `kolcsonzok` (`id`, `nev`, `cim`, `lat`, `lng`, `ar`, `telefon`, `nyitvatartas`, `statusz`) VALUES
(1, 'Bubi Központ', 'Deák Ferenc tér 1, Budapest', 47.49790000, 19.05110000, '500', '+3612345678', '0-24', 'aktiv'),
(2, 'Budapest Bike', 'Andrássy út 45, Budapest', 47.50560000, 19.06580000, '2500', '+36201234567', '9-18', 'aktiv'),
(3, 'Hillside Bikes', 'Szépvölgyi út 35, Budapest', 47.53020000, 19.01590000, '3000', '+36301234567', '8-20', 'aktiv');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `link` varchar(50) NOT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `sorrend` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `menu`
--

INSERT INTO `menu` (`id`, `nev`, `link`, `statusz`, `sorrend`) VALUES
(2, 'Útvonalak', 'utvonalak', 'aktiv', 2),
(3, 'Desztinációk', 'desztinaciok', 'aktiv', 3),
(4, 'Események', 'esemenyek', 'aktiv', 4),
(5, 'Kölcsönzők', 'kölcsönzők', 'aktiv', 5);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `utvonalak`
--

CREATE TABLE `utvonalak` (
  `id` int(11) NOT NULL,
  `cim` varchar(200) NOT NULL,
  `leiras` text DEFAULT NULL,
  `koordinatak` text NOT NULL,
  `hossz` varchar(50) DEFAULT NULL,
  `nehezseg` enum('könnyű','közepes','nehéz') DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `idotartam` varchar(50) DEFAULT NULL,
  `szintkulonbseg` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `utvonalak`
--

INSERT INTO `utvonalak` (`id`, `cim`, `leiras`, `koordinatak`, `hossz`, `nehezseg`, `statusz`, `idotartam`, `szintkulonbseg`) VALUES
(4, 'Duna-parti túra', 'Gyönyörű kerékpáros út a Duna mentén', '[[47.498091, 19.040466], [47.498074, 19.040493], [47.498034, 19.04054], [47.49799, 19.040579], [47.497886, 19.040671], [47.497676, 19.040751], [47.497506, 19.040858], [47.497403, 19.04094], [47.497126, \n19.041163], [47.496977, 19.041285], [47.496829, 19.04141], [47.496185, 19.041997], [47.496145, 19.042032], [47.496043, 19.042119], [47.495973, 19.04217], [47.495885, 19.042239], [47.495808, 19.042296], \n[47.49574, 19.04234], [47.495681, 19.042373], [47.495561, 19.042442], [47.495474, 19.042497], [47.495409, 19.04253], [47.495073, 19.042713], [47.494956, 19.042775], [47.494575, 19.042961], [47.494392, 19.043051], [47.494235, 19.043136], [47.49401, 19.043254], [47.493957, 19.043274], [47.493906, 19.043288], [47.493836, 19.043299], [47.493746, 19.04331], [47.493583, 19.043304], [47.493455, 19.043293], [47.493348, 19.043278], [47.492978, 19.043218], [47.4928, 19.043194], [47.492606, 19.04306], [47.492582, 19.043047], [47.492509, 19.042989], [47.492404, 19.042877], [47.49238, 19.042848], [47.492321, 19.042778], [47.492079, 19.042486], [47.492042, 19.042443], [47.492017, 19.042428], [47.491963, 19.04241], [47.491895, 19.042416], [47.49179, 19.042479], [47.491684, 19.042762], [47.491588, 19.043007], [47.491574, 19.043043], [47.491559, 19.043077], [47.491301, 19.043666], [47.491236, 19.043814], [47.491141, 19.043997], [47.491112, 19.044047], [47.491088, 19.04409], [47.491073, 19.044118], [47.490789, 19.044608], [47.490697, 19.044768], [47.490612, 19.044942], [47.490589, 19.044977], [47.490436, 19.045201], [47.490389, 19.045267], [47.490117, 19.045621], [47.490075, 19.045728], [47.490038, 19.045815], \n[47.489982, 19.045932], [47.489963, 19.045976], [47.489939, 19.046053], [47.489919, 19.046132], [47.489907, 19.046211], [47.4899, 19.046306], [47.489897, 19.046389], [47.489899, 19.046446], [47.489909, \n19.046501], [47.489924, 19.046567], [47.489949, 19.046637], [47.489983, 19.046723], [47.490017, 19.046797], [47.490099, 19.046942], [47.490444, 19.047932], [47.490851, 19.04904], [47.491702, 19.051421], [47.491759, 19.051602], [47.491792, 19.05172], [47.491819, 19.05185], [47.49184, 19.051941], [47.491871, 19.052078], [47.491925, 19.052276], [47.491987, 19.052477], [47.492034, 19.052604], [47.492094, \n19.052749], [47.492151, 19.052869], [47.492162, 19.053255], [47.492153, 19.0533], [47.492108, 19.053365], [47.492062, 19.053383], [47.492012, 19.053378], [47.491959, 19.053329], [47.491925, 19.053237], \n[47.491823, 19.052944], [47.491692, 19.052576], [47.491661, 19.052469], [47.491639, 19.052391], [47.491457, 19.051826], [47.491412, 19.051601], [47.491416, 19.051491], [47.491429, 19.051429], [47.491485, 19.051251], [47.491726, 19.051061], [47.491836, 19.050975], [47.491997, 19.050876], [47.492033, 19.050854], [47.492134, 19.050741], [47.492174, 19.05069], [47.492185, 19.050674], [47.492213, 19.050639], [47.492259, 19.050598], [47.492681, 19.050223], [47.492787, 19.050098], [47.493467, 19.049561], [47.49461, 19.048801], [47.494742, 19.048714], [47.495089, 19.048494], [47.495189, 19.048432], [47.495216, 19.048415], [47.495247, 19.048396], [47.495767, 19.048078], [47.496322, 19.047759], [47.49668, 19.047562], [47.497401, 19.047186], [47.497673, 19.047023], [47.497898, 19.04688], [47.49807, 19.046784], [47.498151, 19.046757], [47.49869, 19.046688], [47.498933, 19.046697], [47.499136, 19.046713], [47.49931, 19.046734], [47.499368, 19.046746], [47.499459, 19.046772], [47.499505, 19.046783], [47.499535, 19.046791], [47.499568, 19.04679], [47.4996, 19.04678], [47.499623, 19.046765], [47.499647, 19.046735], [47.499703, 19.04665], [47.499758, 19.046581], [47.499785, 19.04655], [47.500025, 19.046309], [47.50029, 19.046135], [47.500429, 19.046057], [47.5003, 19.046025], [47.500209, 19.046034], [47.500158, 19.046051], [47.500209, 19.046034], [47.5003, 19.046025], [47.500429, 19.046057], [47.500607, 19.045952], [47.500815, 19.04585], [47.500862, 19.045826], [47.501081, 19.045754], [47.502561, 19.045331], [47.50321, 19.04514], [47.503574, 19.045037], [47.503694, 19.045073], [47.50383, 19.045055], [47.504007, 19.045019], [47.504301, 19.044966], [47.50464, 19.044921], [47.504666, 19.044918], [47.504713, 19.044918], [47.504742, 19.044942], [47.504766, 19.045018], [47.504775, 19.045075], [47.504783, 19.045142], [47.504785, 19.045168], [47.504795, 19.045258], [47.504795, 19.045258], [47.504854, 19.045999], [47.50486, 19.046083], [47.504916, 19.046662], [47.505058, 19.048109], [47.505064, 19.048178], [47.504464, 19.048309], [47.504386, 19.048326], [47.50364, 19.048489], [47.503088, 19.048611], [47.503037, 19.048639], [47.503003, 19.048667], [47.502942, 19.048758], [47.502903, 19.048804], [47.50286, 19.048834], [47.502769, 19.048855], [47.502659, 19.04888], [47.502605, 19.048892], [47.502601, 19.048893], [47.502024, 19.049019], [47.502031, 19.049097], [47.502116, 19.049975], [47.502183, 19.050662], [47.502284, 19.051703], [47.502333, 19.052208], [47.502382, 19.052711], [47.502395, 19.052831], [47.502539, 19.054158], [47.502595, 19.054669], [47.502633, 19.054908], [47.502761, 19.05491], [47.50282, 19.054912], [47.502972, 19.054918], [47.503319, 19.054932], [47.503541, 19.05494], [47.503639, 19.054944], [47.503785, 19.054949], [47.503973, 19.054953], [47.504001, 19.054954]]', '15 km', 'könnyű', 'aktiv', '1-2 óra', '50 m'),
(5, 'Buda hegyei', 'Kihívásokkal teli hegyi kerékpáros útvonal', '[[47.4906,19.0309],[47.4880,19.0350],[47.4850,19.0400],[47.4820,19.0450]]', '25 km', 'nehéz', 'aktiv', '3-4 óra', '450 m'),
(6, 'Margit-sziget kör', 'Kellemes körút a Margit-szigeten', '[[47.5276,19.0462],[47.5260,19.0480],[47.5240,19.0500],[47.5220,19.0520],[47.5276,19.0462]]', '5 km', 'közepes', 'aktiv', '30 perc', '10 m');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `blippek`
--
ALTER TABLE `blippek`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `destinaciok`
--
ALTER TABLE `destinaciok`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `ertekelesek`
--
ALTER TABLE `ertekelesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cel` (`cel_tipus`,`cel_id`,`statusz`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`),
  ADD KEY `idx_statusz` (`statusz`),
  ADD KEY `ellenorizte_admin` (`ellenorizte_admin`);

--
-- A tábla indexei `esemenyek`
--
ALTER TABLE `esemenyek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_esemeny_utvonal` (`utvonal_id`);

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `kedvencek`
--
ALTER TABLE `kedvencek`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_kedvenc` (`felhasznalo_id`,`cel_tipus`,`cel_id`),
  ADD KEY `idx_cel` (`cel_tipus`,`cel_id`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`);

--
-- A tábla indexei `kepek`
--
ALTER TABLE `kepek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cel` (`cel_tipus`,`cel_id`,`statusz`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`),
  ADD KEY `idx_statusz` (`statusz`),
  ADD KEY `ellenorizte_admin` (`ellenorizte_admin`);

--
-- A tábla indexei `kolcsonzok`
--
ALTER TABLE `kolcsonzok`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `utvonalak`
--
ALTER TABLE `utvonalak`
  ADD PRIMARY KEY (`id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `blippek`
--
ALTER TABLE `blippek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `destinaciok`
--
ALTER TABLE `destinaciok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `ertekelesek`
--
ALTER TABLE `ertekelesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `esemenyek`
--
ALTER TABLE `esemenyek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `kedvencek`
--
ALTER TABLE `kedvencek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kepek`
--
ALTER TABLE `kepek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kolcsonzok`
--
ALTER TABLE `kolcsonzok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `utvonalak`
--
ALTER TABLE `utvonalak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `ertekelesek`
--
ALTER TABLE `ertekelesek`
  ADD CONSTRAINT `ertekelesek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ertekelesek_ibfk_2` FOREIGN KEY (`ellenorizte_admin`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `esemenyek`
--
ALTER TABLE `esemenyek`
  ADD CONSTRAINT `fk_esemeny_utvonal` FOREIGN KEY (`utvonal_id`) REFERENCES `utvonalak` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Megkötések a táblához `kedvencek`
--
ALTER TABLE `kedvencek`
  ADD CONSTRAINT `kedvencek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `kepek`
--
ALTER TABLE `kepek`
  ADD CONSTRAINT `kepek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kepek_ibfk_2` FOREIGN KEY (`ellenorizte_admin`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
