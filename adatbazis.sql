-- MySQL dump 10.13  Distrib 8.4.8, for Linux (x86_64)
--
-- Host: localhost    Database: ketkereken
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aktivitas_kommentek`
--

DROP TABLE IF EXISTS `aktivitas_kommentek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aktivitas_kommentek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aktivitas_id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `szoveg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `letrehozva` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_aktivitas_komment_aktivitas` (`aktivitas_id`),
  KEY `fk_aktivitas_komment_felhasznalo` (`felhasznalo_id`),
  CONSTRAINT `fk_aktivitas_komment_aktivitas` FOREIGN KEY (`aktivitas_id`) REFERENCES `aktivitasok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_aktivitas_komment_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aktivitas_kommentek`
--

LOCK TABLES `aktivitas_kommentek` WRITE;
/*!40000 ALTER TABLE `aktivitas_kommentek` DISABLE KEYS */;
INSERT INTO `aktivitas_kommentek` VALUES (5,12,3,'Selenium komment 1775325303677','2026-04-04 17:55:03');
INSERT INTO `aktivitas_kommentek` VALUES (6,15,3,'Selenium komment 1775327474901','2026-04-04 18:31:15');
INSERT INTO `aktivitas_kommentek` VALUES (7,16,3,'qwert!','2026-04-15 21:42:03');
/*!40000 ALTER TABLE `aktivitas_kommentek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aktivitas_reakciok`
--

DROP TABLE IF EXISTS `aktivitas_reakciok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aktivitas_reakciok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aktivitas_id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `reakcio` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `letrehozva` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_aktivitas_reakcio` (`aktivitas_id`,`felhasznalo_id`),
  KEY `fk_reakcio_felhasznalo` (`felhasznalo_id`),
  CONSTRAINT `fk_reakcio_aktivitas` FOREIGN KEY (`aktivitas_id`) REFERENCES `aktivitasok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reakcio_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aktivitas_reakciok`
--

LOCK TABLES `aktivitas_reakciok` WRITE;
/*!40000 ALTER TABLE `aktivitas_reakciok` DISABLE KEYS */;
INSERT INTO `aktivitas_reakciok` VALUES (2,12,3,'heart','2026-04-04 17:55:02');
/*!40000 ALTER TABLE `aktivitas_reakciok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aktivitasok`
--

DROP TABLE IF EXISTS `aktivitasok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aktivitasok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `felhasznalo_id` int NOT NULL,
  `tipus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `cel_tipus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `cel_id` int DEFAULT NULL,
  `szoveg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `extra_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `letrehozva` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_aktivitas_felhasznalo` (`felhasznalo_id`),
  CONSTRAINT `fk_aktivitas_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aktivitasok`
--

LOCK TABLES `aktivitasok` WRITE;
/*!40000 ALTER TABLE `aktivitasok` DISABLE KEYS */;
INSERT INTO `aktivitasok` VALUES (12,3,'statusz_poszt',NULL,NULL,'Selenium teszt poszt 1775325296164',NULL,'2026-04-04 17:54:56');
INSERT INTO `aktivitasok` VALUES (13,3,'statusz_poszt',NULL,NULL,'Selenium teszt poszt 1775325397347',NULL,'2026-04-04 17:56:37');
INSERT INTO `aktivitasok` VALUES (14,3,'statusz_poszt',NULL,NULL,'Selenium teszt poszt 1775327247269',NULL,'2026-04-04 18:27:27');
INSERT INTO `aktivitasok` VALUES (15,3,'statusz_poszt',NULL,NULL,'Selenium teszt poszt 1775327470213',NULL,'2026-04-04 18:31:10');
INSERT INTO `aktivitasok` VALUES (16,3,'kedvenc_hozzaadva','esemenyek',2,NULL,NULL,'2026-04-15 19:24:54');
INSERT INTO `aktivitasok` VALUES (17,5,'felhasznalo_kovetese',NULL,NULL,'admin','{\"targetUserId\":3,\"targetUsername\":\"admin\"}','2026-04-15 21:45:24');
INSERT INTO `aktivitasok` VALUES (18,5,'kep_feltoltve','destinaciok',8,NULL,NULL,'2026-04-15 21:50:05');
/*!40000 ALTER TABLE `aktivitasok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinaciok`
--

DROP TABLE IF EXISTS `destinaciok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinaciok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nev` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `leiras` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `ertekeles` decimal(2,1) DEFAULT NULL,
  `tipus` enum('kilato','strand','muzeum','park','etterm') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT 'aktiv',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinaciok`
--

LOCK TABLES `destinaciok` WRITE;
/*!40000 ALTER TABLE `destinaciok` DISABLE KEYS */;
INSERT INTO `destinaciok` VALUES (1,'Hősök tere','Iconic square with statues of Hungarian leaders',47.51550000,19.07890000,4.7,'kilato','aktiv');
INSERT INTO `destinaciok` VALUES (2,'Margit-sziget','Beautiful island park in the Danube',47.52760000,19.04620000,4.8,'park','aktiv');
INSERT INTO `destinaciok` VALUES (3,'Gellért fürdő','Historic thermal bath',47.48390000,19.05060000,4.6,'strand','aktiv');
INSERT INTO `destinaciok` VALUES (7,'Püspökvár kilátó','Győr történelmi belvárosának közelében található látópont, szép rálátással a környékre.',47.68930000,17.63540000,4.7,'kilato','aktiv');
INSERT INTO `destinaciok` VALUES (8,'Rába Quelle élményfürdő','Pihenésre és nyári megállóra is jó választás a győri bringás körök mellett.',47.68480000,17.62870000,4.5,'strand','aktiv');
INSERT INTO `destinaciok` VALUES (9,'Városliget','Népszerű budapesti park, sok kerékpáros pihenőponttal és könnyű megközelítéssel.',47.51490000,19.08220000,4.8,'park','aktiv');
INSERT INTO `destinaciok` VALUES (10,'Kopaszi-gát','Modern dunaparti pihenőhely bringás megállókhoz, esti tekerésekhez is ideális.',47.46750000,19.04300000,4.7,'etterm','aktiv');
INSERT INTO `destinaciok` VALUES (11,'Nagyerdei Park','Debrecen egyik legismertebb zöld területe, családi bringázáshoz kiváló.',47.55320000,21.62590000,4.8,'park','aktiv');
INSERT INTO `destinaciok` VALUES (12,'Déri Múzeum','A város kulturális központja, jól beilleszthető egy belvárosi kerékpáros körbe.',47.53110000,21.62270000,4.6,'muzeum','aktiv');
INSERT INTO `destinaciok` VALUES (13,'Károly-kilátó','Sopron ikonikus kilátója a Lőverekben, népszerű bringás célpont emelkedőkkel.',47.68970000,16.57150000,4.9,'kilato','aktiv');
INSERT INTO `destinaciok` VALUES (14,'Erzsébet-kert','Nyugodt parkos terület, városi pihenőnek és rövid megállónak is tökéletes.',47.68120000,16.59010000,4.4,'park','aktiv');
INSERT INTO `destinaciok` VALUES (15,'Tettyei romok','Pécs hangulatos történelmi helyszíne, remek panorámával és rövid pihenőlehetőséggel.',46.08140000,18.23930000,4.8,'kilato','aktiv');
INSERT INTO `destinaciok` VALUES (16,'Zsolnay Kulturális Negyed','Kulturális és közösségi tér, kerékpárral is könnyen elérhető pécsi célpont.',46.07290000,18.24550000,4.7,'muzeum','aktiv');
INSERT INTO `destinaciok` VALUES (17,'Gébárti-tó','Tóparti pihenőhely, kellemes környezetben tekerőknek és családoknak is.',46.87360000,16.81360000,4.6,'park','aktiv');
INSERT INTO `destinaciok` VALUES (18,'Azáleás-völgy','Zöldövezeti pihenőhely tavasszal különösen látványos környezettel.',46.85830000,16.82850000,4.5,'park','aktiv');
INSERT INTO `destinaciok` VALUES (19,'Benkó Zoltán Szabadidőközpont','Nagy zöldterület és bringás pihenőpont Kecskemét szélén.',46.92380000,19.72750000,4.7,'park','aktiv');
INSERT INTO `destinaciok` VALUES (20,'Cifrapalota','Kecskemét legismertebb szecessziós épülete, belvárosi megállónak tökéletes.',46.90720000,19.69260000,4.6,'muzeum','aktiv');
INSERT INTO `destinaciok` VALUES (21,'Avas kilátó','Miskolc emblematikus kilátója, ahonnan széles panoráma nyílik a városra.',48.09930000,20.77390000,4.8,'kilato','aktiv');
INSERT INTO `destinaciok` VALUES (22,'Miskolctapolca Barlangfürdő','Különleges fürdőkomplexum, népszerű célpont pihenőnapokra és túrák után.',48.06120000,20.75010000,4.7,'strand','aktiv');
/*!40000 ALTER TABLE `destinaciok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ertekelesek`
--

DROP TABLE IF EXISTS `ertekelesek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ertekelesek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `felhasznalo_id` int NOT NULL,
  `cel_tipus` enum('utvonalak','esemenyek','destinaciok','kolcsonzok') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `cel_id` int NOT NULL,
  `pontszam` tinyint NOT NULL,
  `szoveg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `statusz` enum('fuggoben','elfogadva','elutasitva') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL DEFAULT 'fuggoben',
  `letrehozva` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ellenorizte_admin` int DEFAULT NULL,
  `ellenorizve` timestamp NULL DEFAULT NULL,
  `elutasitas_indok` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  PRIMARY KEY (`id`),
  KEY `idx_cel` (`cel_tipus`,`cel_id`,`statusz`),
  KEY `idx_felhasznalo` (`felhasznalo_id`),
  KEY `idx_statusz` (`statusz`),
  KEY `fk_ertekelesek_admin` (`ellenorizte_admin`),
  CONSTRAINT `ertekelesek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ertekelesek_ibfk_2` FOREIGN KEY (`ellenorizte_admin`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ertekelesek_admin` FOREIGN KEY (`ellenorizte_admin`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ertekelesek_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ertekelesek`
--

LOCK TABLES `ertekelesek` WRITE;
/*!40000 ALTER TABLE `ertekelesek` DISABLE KEYS */;
INSERT INTO `ertekelesek` VALUES (8,2,'utvonalak',7,5,'Nagyon jó városi kör, jól követhető és élvezetes útvonal.','elfogadva','2026-04-15 20:39:39',NULL,NULL,NULL);
INSERT INTO `ertekelesek` VALUES (9,2,'destinaciok',21,5,'Kifejezetten jó megálló bringásoknak, rendezett és hangulatos hely.','elfogadva','2026-04-15 20:39:39',NULL,NULL,NULL);
INSERT INTO `ertekelesek` VALUES (10,2,'kolcsonzok',8,4,'Korrekt árak és gyors ügyintézés, könnyű volt bringát bérelni.','elfogadva','2026-04-15 20:39:39',NULL,NULL,NULL);
INSERT INTO `ertekelesek` VALUES (11,2,'esemenyek',25,5,'Jól szervezett esemény volt, jó hangulattal és sok résztvevővel.','elfogadva','2026-04-15 20:39:39',NULL,NULL,NULL);
INSERT INTO `ertekelesek` VALUES (12,3,'utvonalak',7,5,'Kellemes, jól tekerhető városi kör, több ponton is kényelmes megállási lehetőséggel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (13,3,'utvonalak',8,5,'Esti tekeréshez nagyon hangulatos útvonal, szép dunai panorámával és könnyű tempóval.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (14,3,'utvonalak',9,4,'Nyugodt, zöld környezetű útvonal, kezdőknek és családi tekeréshez is jó választás.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (15,3,'utvonalak',10,5,'Szép erdei-városi váltásokkal vezet, kicsit húzósabb, de nagyon élvezetes kör.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (16,3,'utvonalak',11,4,'Látványos pécsi kör, emelkedőkkel együtt is megéri végigmenni rajta.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (17,3,'utvonalak',12,5,'Nyugodt, tiszta környezetben vezető útvonal, pihenős tekerésre kifejezetten jó.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (18,3,'utvonalak',13,4,'Könnyű, alföldi jellegű kör, laza tempóban nagyon kellemes.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (19,3,'utvonalak',14,5,'Jó ritmusú, változatos útvonal, a dombosabb részek miatt élmény végigtekerni.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (27,3,'destinaciok',7,5,'Szép kilátópont, rövid bringás megállónak is nagyon jó választás.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (28,3,'destinaciok',8,4,'Túra után kellemes megálló, nyári időszakban különösen jó opció.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (29,3,'destinaciok',9,5,'Bringával könnyen bejárható környék, sok pihenőhellyel és jó hangulattal.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (30,3,'destinaciok',10,5,'Modern, rendezett helyszín, esti tekerés után is szívesen megáll itt az ember.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (31,3,'destinaciok',11,5,'Debrecen egyik legjobb bringás pihenőpontja, tágas és barátságos környezettel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (32,3,'destinaciok',12,4,'Belvárosi körbe jól beilleszthető megálló, kulturális kitérőnek is remek.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (33,3,'destinaciok',13,5,'A feljutás után nagyon szép panorámát ad, teljesen megéri célpontnak választani.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (34,3,'destinaciok',14,4,'Nyugodt parkos hely, rövidebb pihenéshez vagy találkozóponthoz is ideális.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (35,3,'destinaciok',15,5,'Hangulatos történelmi helyszín, a környezet és a kilátás együtt nagyon erős.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (36,3,'destinaciok',16,5,'Látványos és könnyen megközelíthető hely, bringás útvonalba is jól illik.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (37,3,'destinaciok',17,5,'Kifejezetten kellemes tóparti megálló, nyugodt tekeréshez tökéletes környezet.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (38,3,'destinaciok',18,4,'Szép zöld környezet, főleg jó időben nagyon hangulatos kitérő.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (39,3,'destinaciok',19,5,'Nagy terület, bringásoknak és családoknak is nagyon jól használható helyszín.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (40,3,'destinaciok',20,4,'Belvárosi megállónak jó, építészetileg is látványos és karakteres hely.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (41,3,'destinaciok',21,5,'Az egyik legjobb miskolci célpont, a panoráma miatt különösen ajánlott.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (42,3,'destinaciok',22,5,'Túra után remek levezető program, különleges helyszín és jó kikapcsolódás.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (58,3,'esemenyek',10,5,'Jó hangulatú, könnyen követhető közösségi gurulás volt, kezdőknek is barátságos.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (59,3,'esemenyek',11,4,'Hasznos és gyakorlatias workshop, sok alap dolgot jól összefoglalt.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (60,3,'esemenyek',12,5,'Látványos esti gurulás, erős közösségi hangulattal és jó szervezéssel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (61,3,'esemenyek',13,5,'Nagyon pörgős esemény volt, sok programmal és jó bringás közeggel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (62,3,'esemenyek',14,4,'Kellemes tempójú közösségi esemény, jó útvonallal és korrekt szervezéssel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (63,3,'esemenyek',15,5,'Családbarát és változatos program, sok résztvevővel és jó hangulattal.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (64,3,'esemenyek',16,5,'Technikásabb, de nagyon élvezetes esemény, a soproni terep sokat dob rajta.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (65,3,'esemenyek',17,4,'Tömör, hasznos és jól felépített workshop, érdemes volt részt venni rajta.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (66,3,'esemenyek',18,5,'Szép útvonal és jó társaság, összességében nagyon kellemes program volt.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (67,3,'esemenyek',19,4,'A nehezebb részek miatt inkább tapasztaltabbaknak való, de jól szervezett esemény.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (68,3,'esemenyek',20,5,'Nyugodt, jó ritmusú közösségi gurulás, a helyszín különösen hangulatossá tette.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (69,3,'esemenyek',21,4,'Laza és barátságos esemény, jó közösségi hangulattal és kellemes környezettel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (70,3,'esemenyek',22,4,'Könnyen teljesíthető, jó hangulatú program volt, közös tekerésre ideális.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (71,3,'esemenyek',23,5,'Nagyon hasznos gyakorlati bemutató, kezdőknek különösen ajánlott.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (72,3,'esemenyek',24,5,'Természetközeli, élvezetes túra volt, jó társasággal és korrekt szervezéssel.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (73,3,'esemenyek',25,5,'Nagyobb léptékű, mégis jól szervezett esemény, sok programmal és erős hangulattal.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (89,3,'kolcsonzok',7,5,'Korrekt kiszolgálás, jó állapotú bringák és gyors ügyintézés.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (90,3,'kolcsonzok',8,5,'Jó elhelyezkedés, kulturált átvétel és kényelmesen használható bringák.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (91,3,'kolcsonzok',9,4,'Megbízható kölcsönző, a környékhez jól passzoló választékkal.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (92,3,'kolcsonzok',10,5,'Segítőkész hozzáállás és jó felszereltség, túrához is korrekt választás.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (93,3,'kolcsonzok',11,4,'Rugalmas bérlés és korrekt állapotú kerékpárok, összességében jó tapasztalat.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (94,3,'kolcsonzok',12,4,'Egyszerű és gyors bérlés, nyugodt környéken jó kiindulópont tekeréshez.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (95,3,'kolcsonzok',13,5,'Barátságos kiszolgálás és jó ár-érték arány, könnyen ment minden.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
INSERT INTO `ertekelesek` VALUES (96,3,'kolcsonzok',14,5,'Jó minőségű bringákat adtak, túrához és városi használatra is bevált.','elfogadva','2026-04-15 20:47:57',3,'2026-04-15 20:47:57',NULL);
/*!40000 ALTER TABLE `ertekelesek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `esemenyek`
--

DROP TABLE IF EXISTS `esemenyek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `esemenyek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nev` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `leiras` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `datum` date NOT NULL,
  `resztvevok` int DEFAULT NULL,
  `tipus` enum('verseny','tura','fesztival','workshop') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT 'aktiv',
  `utvonal_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_esemeny_utvonal` (`utvonal_id`),
  CONSTRAINT `fk_esemeny_utvonal` FOREIGN KEY (`utvonal_id`) REFERENCES `utvonalak` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `esemenyek`
--

LOCK TABLES `esemenyek` WRITE;
/*!40000 ALTER TABLE `esemenyek` DISABLE KEYS */;
INSERT INTO `esemenyek` VALUES (1,'Budapest Bike Festival','Annual bicycle festival with races and exhibitions',47.49790000,19.04020000,'2026-06-15',5000,'fesztival','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (2,'Duna-parti túra','Guided bike tour along the Danube',47.50000000,19.05000000,'2026-05-20',200,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (3,'Hegyi kerékpáros verseny','Mountain bike competition in Buda hills',47.49060000,19.03090000,'2026-07-10',300,'verseny','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (10,'Győri tavaszi gurulás','Baráti városi túra a győri folyópartok mentén kezdőknek és haladóknak.',47.68790000,17.65010000,'2026-05-18',120,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (11,'Győr Bike Workshop','Alap karbantartási és biztonsági workshop helyi bringásoknak.',47.68460000,17.63480000,'2026-06-07',45,'workshop','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (12,'Budapesti Duna Ride','Esti közösségi gurulás panorámás dunai szakaszokkal.',47.49770000,19.04880000,'2026-05-22',260,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (13,'Budapest Urban Bike Feszt','Belvárosi bringás fesztivál programokkal, bemutatókkal és közös tekeréssel.',47.51390000,19.08050000,'2026-06-19',1800,'fesztival','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (14,'Debreceni Nagyerdő túra','Közösségi gurulás a Nagyerdő és a stadion környékén.',47.55020000,21.62810000,'2026-05-29',150,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (15,'Debreceni bringás nap','Családbarát esemény ügyességi pályával és helyi kiállítókkal.',47.53160000,21.62460000,'2026-06-12',700,'fesztival','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (16,'Sopron Lőverek kihívás','Emelkedős közös túra a soproni dombvidéken tapasztaltabb bringásoknak.',47.68420000,16.58600000,'2026-06-05',90,'verseny','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (17,'Sopron bringás műhely','Gyakorlati workshop túrafelkészülésről és felszerelésről.',47.68180000,16.59080000,'2026-05-14',35,'workshop','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (18,'Pécsi panoráma tekerés','Laza tempójú közösségi esemény a Tettye és a belváros között.',46.07890000,18.23620000,'2026-05-24',110,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (19,'Pécs MTB hétvége','Technikásabb, szintkülönbséges bringás program pécsi indulással.',46.07250000,18.22990000,'2026-06-27',160,'verseny','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (20,'Zalaegerszegi tókerülő túra','Kellemes közösségi gurulás a Gébárti-tó környékén.',46.87290000,16.81580000,'2026-05-31',80,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (21,'Zalaegerszegi bringás piknik','Kisebb fesztivál jellegű program helyi közösségeknek.',46.84470000,16.84100000,'2026-06-21',260,'fesztival','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (22,'Kecskeméti nyári kör','Könnyű városi-külvárosi túra baráti társaságoknak és családoknak.',46.90690000,19.69280000,'2026-06-03',100,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (23,'Kecskemét Bike Workshop','Defektjavítási és alap szerelési bemutató kezdőknek.',46.90880000,19.69020000,'2026-05-16',40,'workshop','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (24,'Miskolctapolca közösségi túra','Természetközeli túra Miskolctapolca és környéke érintésével.',48.06320000,20.75650000,'2026-05-26',95,'tura','aktiv',NULL);
INSERT INTO `esemenyek` VALUES (25,'Miskolci bringás fesztivál','Közösségi nap ügyességi pályával, színpadi programokkal és tesztbringákkal.',48.10390000,20.78110000,'2026-06-14',850,'fesztival','aktiv',NULL);
/*!40000 ALTER TABLE `esemenyek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `felhasznalok`
--

DROP TABLE IF EXISTS `felhasznalok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `felhasznalok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `felhasznalonev` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `jelszo_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `rang` enum('felhasznalo','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `profilkep` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `reset_token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `reset_token_lejar` datetime DEFAULT NULL,
  `reset_token_letrehozva` datetime DEFAULT NULL,
  `letrehozva` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `utolso_modositas` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `felhasznalok`
--

LOCK TABLES `felhasznalok` WRITE;
/*!40000 ALTER TABLE `felhasznalok` DISABLE KEYS */;
INSERT INTO `felhasznalok` VALUES (2,'kutya@gmail.com','ferihegy','$2b$12$iXpypqw073OmFRrMptqjkOuVZqLMT53fvjpARXRCBx5ZQ1JSJFnlm','admin',NULL,NULL,NULL,NULL,NULL,'2026-03-13 13:57:36',NULL);
INSERT INTO `felhasznalok` VALUES (3,'admin@admin.hu','admin','$2b$12$MjRryvCDiK8Dl.7ihZSjkeBSMdCnPq9AbC3aTemBlLAB3jXySY8wK','admin','/uploads/1774792565186-279307883.png','rawrrxdxdxd',NULL,NULL,NULL,'2026-03-29 13:56:05','2026-03-29 15:56:05');
INSERT INTO `felhasznalok` VALUES (4,'shadugeci@gmail.com','jani','$2b$12$sxM/zXK.d1FAiTwToSw5Qu5uRVwVab9Naj0duOFFRZxclLzVYTR16','felhasznalo',NULL,NULL,'34d335839af531e194937b853ea8334fa80433a21f8cf35e0b30aeb76248dd95','2026-04-15 15:32:01','2026-04-15 15:02:00','2026-04-15 15:02:00',NULL);
INSERT INTO `felhasznalok` VALUES (5,'teszt@teszt.hu','teszt','$2b$12$qB5wNTCS9gxJKUSIez0LDOQr9qP3IHjO2Pw85wH4KVVBHh3cLd95K','admin',NULL,NULL,NULL,NULL,NULL,'2026-04-15 21:42:49',NULL);
/*!40000 ALTER TABLE `felhasznalok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kedvencek`
--

DROP TABLE IF EXISTS `kedvencek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kedvencek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `felhasznalo_id` int NOT NULL,
  `cel_tipus` enum('utvonalak','esemenyek','destinaciok','kolcsonzok') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `cel_id` int NOT NULL,
  `letrehozva` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_kedvenc` (`felhasznalo_id`,`cel_tipus`,`cel_id`),
  KEY `idx_cel` (`cel_tipus`,`cel_id`),
  KEY `idx_felhasznalo` (`felhasznalo_id`),
  CONSTRAINT `fk_kedvencek_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kedvencek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kedvencek`
--

LOCK TABLES `kedvencek` WRITE;
/*!40000 ALTER TABLE `kedvencek` DISABLE KEYS */;
INSERT INTO `kedvencek` VALUES (15,3,'esemenyek',1,'2026-03-30 15:50:31');
/*!40000 ALTER TABLE `kedvencek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kepek`
--

DROP TABLE IF EXISTS `kepek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kepek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `felhasznalo_id` int NOT NULL,
  `cel_tipus` enum('utvonalak','esemenyek','destinaciok','kolcsonzok') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `cel_id` int NOT NULL,
  `fajl_utvonal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `leiras` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `statusz` enum('fuggoben','elfogadva','elutasitva') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL DEFAULT 'fuggoben',
  `letrehozva` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ellenorizte_admin` int DEFAULT NULL,
  `ellenorizve` timestamp NULL DEFAULT NULL,
  `elutasitas_indok` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  PRIMARY KEY (`id`),
  KEY `idx_cel` (`cel_tipus`,`cel_id`,`statusz`),
  KEY `idx_felhasznalo` (`felhasznalo_id`),
  KEY `idx_statusz` (`statusz`),
  KEY `fk_kepek_admin` (`ellenorizte_admin`),
  CONSTRAINT `fk_kepek_admin` FOREIGN KEY (`ellenorizte_admin`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_kepek_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kepek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kepek_ibfk_2` FOREIGN KEY (`ellenorizte_admin`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kepek`
--

LOCK TABLES `kepek` WRITE;
/*!40000 ALTER TABLE `kepek` DISABLE KEYS */;
INSERT INTO `kepek` VALUES (4,5,'destinaciok',8,'/uploads/1776289805799-423078736.png',NULL,'elfogadva','2026-04-15 21:50:05',5,'2026-04-15 21:50:13',NULL);
/*!40000 ALTER TABLE `kepek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kolcsonzok`
--

DROP TABLE IF EXISTS `kolcsonzok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kolcsonzok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nev` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `cim` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `ar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `telefon` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `nyitvatartas` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT 'aktiv',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kolcsonzok`
--

LOCK TABLES `kolcsonzok` WRITE;
/*!40000 ALTER TABLE `kolcsonzok` DISABLE KEYS */;
INSERT INTO `kolcsonzok` VALUES (1,'Bubi Központ','Deák Ferenc tér 1, Budapest',47.49790000,19.05110000,'500','+3612345678','0-24','aktiv');
INSERT INTO `kolcsonzok` VALUES (2,'Budapest Bike','Andrássy út 45, Budapest',47.50560000,19.06580000,'2500','+36201234567','9-18','aktiv');
INSERT INTO `kolcsonzok` VALUES (3,'Hillside Bikes','Szépvölgyi út 35, Budapest',47.53020000,19.01590000,'3000','+36301234567','8-20','aktiv');
INSERT INTO `kolcsonzok` VALUES (7,'Győr Bike Point','Árpád út 12, Győr',47.68710000,17.63890000,'3500 / nap','+3696123456','8-18','aktiv');
INSERT INTO `kolcsonzok` VALUES (8,'Rakpart Bike Budapest','Belgrád rakpart 18, Budapest',47.49210000,19.04860000,'4500 / nap','+3615550101','8-20','aktiv');
INSERT INTO `kolcsonzok` VALUES (9,'Nagyerdő Bike Rent','Nagyerdei körút 22, Debrecen',47.55390000,21.62510000,'3200 / nap','+3652555010','9-18','aktiv');
INSERT INTO `kolcsonzok` VALUES (10,'Lővér Kerékpárkölcsönző','Lővér körút 44, Sopron',47.68470000,16.58690000,'3800 / nap','+3699555010','9-19','aktiv');
INSERT INTO `kolcsonzok` VALUES (11,'Tettye Bike Hub','Tettye tér 3, Pécs',46.08080000,18.23870000,'3600 / nap','+3672555010','8-18','aktiv');
INSERT INTO `kolcsonzok` VALUES (12,'Gébárt Bike Rent','Gébárti út 77, Zalaegerszeg',46.87310000,16.81490000,'3000 / nap','+3692555010','9-18','aktiv');
INSERT INTO `kolcsonzok` VALUES (13,'Hírös Bike Kecskemét','Rákóczi út 9, Kecskemét',46.90660000,19.69190000,'3300 / nap','+3676555010','8-19','aktiv');
INSERT INTO `kolcsonzok` VALUES (14,'Tapolca Bike Base','Miskolctapolcai út 41, Miskolc',48.06250000,20.75770000,'3400 / nap','+3646555010','9-19','aktiv');
/*!40000 ALTER TABLE `kolcsonzok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kovetesek`
--

DROP TABLE IF EXISTS `kovetesek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kovetesek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `koveto_id` int NOT NULL,
  `kovetett_id` int NOT NULL,
  `letrehozva` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_follow` (`koveto_id`,`kovetett_id`),
  KEY `fk_kovetes_kovetett` (`kovetett_id`),
  CONSTRAINT `fk_kovetes_kovetett` FOREIGN KEY (`kovetett_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kovetes_koveto` FOREIGN KEY (`koveto_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kovetesek`
--

LOCK TABLES `kovetesek` WRITE;
/*!40000 ALTER TABLE `kovetesek` DISABLE KEYS */;
INSERT INTO `kovetesek` VALUES (1,3,2,'2026-03-31 13:49:47');
INSERT INTO `kovetesek` VALUES (2,5,3,'2026-04-15 21:45:24');
/*!40000 ALTER TABLE `kovetesek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utvonalak`
--

DROP TABLE IF EXISTS `utvonalak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utvonalak` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cim` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `leiras` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `koordinatak` text CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL,
  `hossz` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `nehezseg` enum('könnyű','közepes','nehéz') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv') CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT 'aktiv',
  `idotartam` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `szintkulonbseg` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utvonalak`
--

LOCK TABLES `utvonalak` WRITE;
/*!40000 ALTER TABLE `utvonalak` DISABLE KEYS */;
INSERT INTO `utvonalak` VALUES (4,'Duna-parti túra','Gyönyörű kerékpáros út a Duna mentén','[[47.498091, 19.040466], [47.498074, 19.040493], [47.498034, 19.04054], [47.49799, 19.040579], [47.497886, 19.040671], [47.497676, 19.040751], [47.497506, 19.040858], [47.497403, 19.04094], [47.497126, \n19.041163], [47.496977, 19.041285], [47.496829, 19.04141], [47.496185, 19.041997], [47.496145, 19.042032], [47.496043, 19.042119], [47.495973, 19.04217], [47.495885, 19.042239], [47.495808, 19.042296], \n[47.49574, 19.04234], [47.495681, 19.042373], [47.495561, 19.042442], [47.495474, 19.042497], [47.495409, 19.04253], [47.495073, 19.042713], [47.494956, 19.042775], [47.494575, 19.042961], [47.494392, 19.043051], [47.494235, 19.043136], [47.49401, 19.043254], [47.493957, 19.043274], [47.493906, 19.043288], [47.493836, 19.043299], [47.493746, 19.04331], [47.493583, 19.043304], [47.493455, 19.043293], [47.493348, 19.043278], [47.492978, 19.043218], [47.4928, 19.043194], [47.492606, 19.04306], [47.492582, 19.043047], [47.492509, 19.042989], [47.492404, 19.042877], [47.49238, 19.042848], [47.492321, 19.042778], [47.492079, 19.042486], [47.492042, 19.042443], [47.492017, 19.042428], [47.491963, 19.04241], [47.491895, 19.042416], [47.49179, 19.042479], [47.491684, 19.042762], [47.491588, 19.043007], [47.491574, 19.043043], [47.491559, 19.043077], [47.491301, 19.043666], [47.491236, 19.043814], [47.491141, 19.043997], [47.491112, 19.044047], [47.491088, 19.04409], [47.491073, 19.044118], [47.490789, 19.044608], [47.490697, 19.044768], [47.490612, 19.044942], [47.490589, 19.044977], [47.490436, 19.045201], [47.490389, 19.045267], [47.490117, 19.045621], [47.490075, 19.045728], [47.490038, 19.045815], \n[47.489982, 19.045932], [47.489963, 19.045976], [47.489939, 19.046053], [47.489919, 19.046132], [47.489907, 19.046211], [47.4899, 19.046306], [47.489897, 19.046389], [47.489899, 19.046446], [47.489909, \n19.046501], [47.489924, 19.046567], [47.489949, 19.046637], [47.489983, 19.046723], [47.490017, 19.046797], [47.490099, 19.046942], [47.490444, 19.047932], [47.490851, 19.04904], [47.491702, 19.051421], [47.491759, 19.051602], [47.491792, 19.05172], [47.491819, 19.05185], [47.49184, 19.051941], [47.491871, 19.052078], [47.491925, 19.052276], [47.491987, 19.052477], [47.492034, 19.052604], [47.492094, \n19.052749], [47.492151, 19.052869], [47.492162, 19.053255], [47.492153, 19.0533], [47.492108, 19.053365], [47.492062, 19.053383], [47.492012, 19.053378], [47.491959, 19.053329], [47.491925, 19.053237], \n[47.491823, 19.052944], [47.491692, 19.052576], [47.491661, 19.052469], [47.491639, 19.052391], [47.491457, 19.051826], [47.491412, 19.051601], [47.491416, 19.051491], [47.491429, 19.051429], [47.491485, 19.051251], [47.491726, 19.051061], [47.491836, 19.050975], [47.491997, 19.050876], [47.492033, 19.050854], [47.492134, 19.050741], [47.492174, 19.05069], [47.492185, 19.050674], [47.492213, 19.050639], [47.492259, 19.050598], [47.492681, 19.050223], [47.492787, 19.050098], [47.493467, 19.049561], [47.49461, 19.048801], [47.494742, 19.048714], [47.495089, 19.048494], [47.495189, 19.048432], [47.495216, 19.048415], [47.495247, 19.048396], [47.495767, 19.048078], [47.496322, 19.047759], [47.49668, 19.047562], [47.497401, 19.047186], [47.497673, 19.047023], [47.497898, 19.04688], [47.49807, 19.046784], [47.498151, 19.046757], [47.49869, 19.046688], [47.498933, 19.046697], [47.499136, 19.046713], [47.49931, 19.046734], [47.499368, 19.046746], [47.499459, 19.046772], [47.499505, 19.046783], [47.499535, 19.046791], [47.499568, 19.04679], [47.4996, 19.04678], [47.499623, 19.046765], [47.499647, 19.046735], [47.499703, 19.04665], [47.499758, 19.046581], [47.499785, 19.04655], [47.500025, 19.046309], [47.50029, 19.046135], [47.500429, 19.046057], [47.5003, 19.046025], [47.500209, 19.046034], [47.500158, 19.046051], [47.500209, 19.046034], [47.5003, 19.046025], [47.500429, 19.046057], [47.500607, 19.045952], [47.500815, 19.04585], [47.500862, 19.045826], [47.501081, 19.045754], [47.502561, 19.045331], [47.50321, 19.04514], [47.503574, 19.045037], [47.503694, 19.045073], [47.50383, 19.045055], [47.504007, 19.045019], [47.504301, 19.044966], [47.50464, 19.044921], [47.504666, 19.044918], [47.504713, 19.044918], [47.504742, 19.044942], [47.504766, 19.045018], [47.504775, 19.045075], [47.504783, 19.045142], [47.504785, 19.045168], [47.504795, 19.045258], [47.504795, 19.045258], [47.504854, 19.045999], [47.50486, 19.046083], [47.504916, 19.046662], [47.505058, 19.048109], [47.505064, 19.048178], [47.504464, 19.048309], [47.504386, 19.048326], [47.50364, 19.048489], [47.503088, 19.048611], [47.503037, 19.048639], [47.503003, 19.048667], [47.502942, 19.048758], [47.502903, 19.048804], [47.50286, 19.048834], [47.502769, 19.048855], [47.502659, 19.04888], [47.502605, 19.048892], [47.502601, 19.048893], [47.502024, 19.049019], [47.502031, 19.049097], [47.502116, 19.049975], [47.502183, 19.050662], [47.502284, 19.051703], [47.502333, 19.052208], [47.502382, 19.052711], [47.502395, 19.052831], [47.502539, 19.054158], [47.502595, 19.054669], [47.502633, 19.054908], [47.502761, 19.05491], [47.50282, 19.054912], [47.502972, 19.054918], [47.503319, 19.054932], [47.503541, 19.05494], [47.503639, 19.054944], [47.503785, 19.054949], [47.503973, 19.054953], [47.504001, 19.054954]]','15 km','könnyű','aktiv','1-2 óra','50 m');
/*!40000 ALTER TABLE `utvonalak` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-15 21:51:15
