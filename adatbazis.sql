-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 24, 2026 at 09:33 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ketkerek`
--

-- --------------------------------------------------------

--
-- Table structure for table `blippek`
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
-- Dumping data for table `blippek`
--

INSERT INTO `blippek` (`id`, `nev`, `leiras`, `lat`, `lng`, `tipus`, `ikon`, `statusz`) VALUES
(1, 'Biciklikölcsönző - Deák tér', 'Bubi állomás', 47.49790000, 19.05110000, 'kölcsönző', 'bicycle', 'aktiv'),
(2, 'Kerékpár szerviz', 'Professzionális kerékpár javítás', 47.50210000, 19.03920000, 'szerviz', 'tools', 'aktiv'),
(3, 'Duna panoráma', 'Gyönyörű kilátás a Dunára', 47.49880000, 19.04390000, 'látványosság', 'camera', 'aktiv');

-- --------------------------------------------------------

--
-- Table structure for table `destinaciok`
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
-- Dumping data for table `destinaciok`
--

INSERT INTO `destinaciok` (`id`, `nev`, `leiras`, `lat`, `lng`, `ertekeles`, `tipus`, `statusz`) VALUES
(1, 'Hősök tere', 'Iconic square with statues of Hungarian leaders', 47.51550000, 19.07890000, 4.7, 'kilato', 'aktiv'),
(2, 'Margit-sziget', 'Beautiful island park in the Danube', 47.52760000, 19.04620000, 4.8, 'park', 'aktiv'),
(3, 'Gellért fürdő', 'Historic thermal bath', 47.48390000, 19.05060000, 4.6, 'strand', 'aktiv');

-- --------------------------------------------------------

--
-- Table structure for table `esemenyek`
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
-- Dumping data for table `esemenyek`
--

INSERT INTO `esemenyek` (`id`, `nev`, `leiras`, `lat`, `lng`, `datum`, `resztvevok`, `tipus`, `statusz`, `utvonal_id`) VALUES
(1, 'Budapest Bike Festival', 'Annual bicycle festival with races and exhibitions', 47.49790000, 19.04020000, '2026-06-15', 5000, 'fesztival', 'aktiv', NULL),
(2, 'Duna-parti túra', 'Guided bike tour along the Danube', 47.50000000, 19.05000000, '2026-05-20', 200, 'tura', 'aktiv', NULL),
(3, 'Hegyi kerékpáros verseny', 'Mountain bike competition in Buda hills', 47.49060000, 19.03090000, '2026-07-10', 300, 'verseny', 'aktiv', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `szoveg` varchar(255) DEFAULT NULL,
  `jelszo` varchar(255) DEFAULT NULL,
  `szam` int(11) DEFAULT NULL,
  `datum` date DEFAULT NULL,
  `ido` time DEFAULT NULL,
  `datumido` datetime DEFAULT NULL,
  `nem` enum('ferfi','no') DEFAULT NULL,
  `erdeklodesek` varchar(255) DEFAULT NULL,
  `valasztott_opcio` varchar(100) DEFAULT NULL,
  `feltoltott_fajl` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefon` varchar(50) DEFAULT NULL,
  `weboldal` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `szoveg`, `jelszo`, `szam`, `datum`, `ido`, `datumido`, `nem`, `erdeklodesek`, `valasztott_opcio`, `feltoltott_fajl`, `email`, `telefon`, `weboldal`) VALUES
(1, 'gafga', 'adfhdh', 2, '2025-09-05', '12:16:00', '2025-09-13 12:14:00', 'ferfi', 'olvasas', 'opcio1', NULL, 'gibszjakab900@gmail.com', '+36302585725', 'http://localhost/phpmyadmin/index.php?route=/table/structure&db=ketkerek&table=felhasznalok'),
(2, 'gafga', 'adfhdh', 2, '2025-09-05', '12:16:00', '2025-09-13 12:14:00', 'ferfi', 'olvasas', 'opcio1', NULL, 'gibszjakab900@gmail.com', '+36302585725', 'http://localhost/phpmyadmin/index.php?route=/table/structure&db=ketkerek&table=felhasznalok');

-- --------------------------------------------------------

--
-- Table structure for table `felhasznalo_kedv_destinaciok`
--

CREATE TABLE `felhasznalo_kedv_destinaciok` (
  `felhasznalo_id` int(11) NOT NULL,
  `destinacio_id` int(11) NOT NULL,
  `letrehozva` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `felhasznalo_kedv_kolcsonzok`
--

CREATE TABLE `felhasznalo_kedv_kolcsonzok` (
  `felhasznalo_id` int(11) NOT NULL,
  `kolcsonzo_id` int(11) NOT NULL,
  `letrehozva` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `felhasznalo_kedv_utvonalak`
--

CREATE TABLE `felhasznalo_kedv_utvonalak` (
  `felhasznalo_id` int(11) NOT NULL,
  `utvonal_id` int(11) NOT NULL,
  `letrehozva` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kolcsonzok`
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
-- Dumping data for table `kolcsonzok`
--

INSERT INTO `kolcsonzok` (`id`, `nev`, `cim`, `lat`, `lng`, `ar`, `telefon`, `nyitvatartas`, `statusz`) VALUES
(1, 'Bubi Központ', 'Deák Ferenc tér 1, Budapest', 47.49790000, 19.05110000, '500', '+3612345678', '0-24', 'aktiv'),
(2, 'Budapest Bike', 'Andrássy út 45, Budapest', 47.50560000, 19.06580000, '2500', '+36201234567', '9-18', 'aktiv'),
(3, 'Hillside Bikes', 'Szépvölgyi út 35, Budapest', 47.53020000, 19.01590000, '3000', '+36301234567', '8-20', 'aktiv');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `link` varchar(50) NOT NULL,
  `statusz` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `sorrend` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `nev`, `link`, `statusz`, `sorrend`) VALUES
(1, 'Kezdőlap', 'kezdooldal', 'inaktiv', 1),
(2, 'Útvonalak', 'utvonalak', 'aktiv', 2),
(3, 'Desztinációk', 'desztinaciok', 'aktiv', 3),
(4, 'Események', 'esemenyek', 'aktiv', 4),
(5, 'Kölcsönzők', 'kölcsönzők', 'aktiv', 5);

-- --------------------------------------------------------

--
-- Table structure for table `reszvetelek`
--

CREATE TABLE `reszvetelek` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `esemeny_id` int(11) NOT NULL,
  `jelentkezes_datuma` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `utvonalak`
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
-- Dumping data for table `utvonalak`
--

INSERT INTO `utvonalak` (`id`, `cim`, `leiras`, `koordinatak`, `hossz`, `nehezseg`, `statusz`, `idotartam`, `szintkulonbseg`) VALUES
(4, 'Duna-parti túra', 'Gyönyörű kerékpáros út a Duna mentén', '[[47.4979,19.0402],[47.5000,19.0450],[47.5020,19.0500],[47.5040,19.0550]]', '15 km', '', 'aktiv', '1-2 óra', '50 m'),
(5, 'Buda hegyei', 'Kihívásokkal teli hegyi kerékpáros útvonal', '[[47.4906,19.0309],[47.4880,19.0350],[47.4850,19.0400],[47.4820,19.0450]]', '25 km', 'nehéz', 'aktiv', '3-4 óra', '450 m'),
(6, 'Margit-sziget kör', 'Kellemes körút a Margit-szigeten', '[[47.5276,19.0462],[47.5260,19.0480],[47.5240,19.0500],[47.5220,19.0520],[47.5276,19.0462]]', '5 km', '', 'aktiv', '30 perc', '10 m');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blippek`
--
ALTER TABLE `blippek`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `destinaciok`
--
ALTER TABLE `destinaciok`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `esemenyek`
--
ALTER TABLE `esemenyek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_esemeny_utvonal` (`utvonal_id`);

--
-- Indexes for table `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `felhasznalo_kedv_destinaciok`
--
ALTER TABLE `felhasznalo_kedv_destinaciok`
  ADD PRIMARY KEY (`felhasznalo_id`,`destinacio_id`),
  ADD KEY `fk_kedv_d_d` (`destinacio_id`);

--
-- Indexes for table `felhasznalo_kedv_kolcsonzok`
--
ALTER TABLE `felhasznalo_kedv_kolcsonzok`
  ADD PRIMARY KEY (`felhasznalo_id`,`kolcsonzo_id`),
  ADD KEY `fk_kedv_k_k` (`kolcsonzo_id`);

--
-- Indexes for table `felhasznalo_kedv_utvonalak`
--
ALTER TABLE `felhasznalo_kedv_utvonalak`
  ADD PRIMARY KEY (`felhasznalo_id`,`utvonal_id`),
  ADD KEY `fk_kedv_u_u` (`utvonal_id`);

--
-- Indexes for table `kolcsonzok`
--
ALTER TABLE `kolcsonzok`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reszvetelek`
--
ALTER TABLE `reszvetelek`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_reszvetel` (`felhasznalo_id`,`esemeny_id`),
  ADD KEY `fk_reszvetel_esemeny` (`esemeny_id`);

--
-- Indexes for table `utvonalak`
--
ALTER TABLE `utvonalak`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blippek`
--
ALTER TABLE `blippek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `destinaciok`
--
ALTER TABLE `destinaciok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `esemenyek`
--
ALTER TABLE `esemenyek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `kolcsonzok`
--
ALTER TABLE `kolcsonzok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reszvetelek`
--
ALTER TABLE `reszvetelek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `utvonalak`
--
ALTER TABLE `utvonalak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `esemenyek`
--
ALTER TABLE `esemenyek`
  ADD CONSTRAINT `fk_esemeny_utvonal` FOREIGN KEY (`utvonal_id`) REFERENCES `utvonalak` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `felhasznalo_kedv_destinaciok`
--
ALTER TABLE `felhasznalo_kedv_destinaciok`
  ADD CONSTRAINT `fk_kedv_d_d` FOREIGN KEY (`destinacio_id`) REFERENCES `destinaciok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kedv_d_f` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `felhasznalo_kedv_kolcsonzok`
--
ALTER TABLE `felhasznalo_kedv_kolcsonzok`
  ADD CONSTRAINT `fk_kedv_k_f` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kedv_k_k` FOREIGN KEY (`kolcsonzo_id`) REFERENCES `kolcsonzok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `felhasznalo_kedv_utvonalak`
--
ALTER TABLE `felhasznalo_kedv_utvonalak`
  ADD CONSTRAINT `fk_kedv_u_f` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kedv_u_u` FOREIGN KEY (`utvonal_id`) REFERENCES `utvonalak` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reszvetelek`
--
ALTER TABLE `reszvetelek`
  ADD CONSTRAINT `fk_reszvetel_esemeny` FOREIGN KEY (`esemeny_id`) REFERENCES `esemenyek` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reszvetel_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
