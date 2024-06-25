-- MySQL dump 10.15  Distrib 10.0.28-MariaDB, for debian-linux-gnueabihf (armv7l)
--
-- Host: new-sealable    Database: new-sealable
-- ------------------------------------------------------
-- Server version	10.0.28-MariaDB-2+b1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bin`
--

DROP TABLE IF EXISTS `bin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `weight` decimal(11,2) NOT NULL,
  `max_weight` decimal(10,2) NOT NULL,
  `IdWaste` int(11) NOT NULL,
  `name_hostname` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bin_ibfk_1` (`IdWaste`),
  CONSTRAINT `bin_ibfk_1` FOREIGN KEY (`IdWaste`) REFERENCES `waste` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bin`
--

LOCK TABLES `bin` WRITE;
/*!40000 ALTER TABLE `bin` DISABLE KEYS */;
INSERT INTO `bin` VALUES (1,'2-PCL-2-WR',0.00,100.00,1,'PCS-01'),(2,'2-PCL-1-TM',0.00,100.00,2,'PCS-02'),(3,'2-PCL-SP-05',0.00,100.00,4,'PCS-02');
/*!40000 ALTER TABLE `bin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection`
--

DROP TABLE IF EXISTS `collection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collection` (
  `id` int(11) NOT NULL,
  `Idbadge` int(11) NOT NULL,
  `Idcontainer` int(11) NOT NULL,
  `Idwaste` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection`
--

LOCK TABLES `collection` WRITE;
/*!40000 ALTER TABLE `collection` DISABLE KEYS */;
/*!40000 ALTER TABLE `collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `container`
--

DROP TABLE IF EXISTS `container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `container` (
  `containerId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `station` varchar(100) NOT NULL,
  `IdWaste` int(11) NOT NULL,
  `weightbin` decimal(18,2) NOT NULL,
  `status` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  PRIMARY KEY (`containerId`),
  KEY `container_ibfk_1` (`IdWaste`),
  CONSTRAINT `container_ibfk_1` FOREIGN KEY (`IdWaste`) REFERENCES `waste` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `container`
--

LOCK TABLES `container` WRITE;
/*!40000 ALTER TABLE `container` DISABLE KEYS */;
INSERT INTO `container` VALUES (1,'1-PCL-3-1-7-WR','Wire',1,0.06,0,'Dispose'),(2,'1-PCL-3-2-7-TM','Terminal',2,0.98,0,'Dispose'),(3,'PCS-03','Coil',1,0.00,0,'Dispose'),(4,'2-PCL-2-WR','Wirel',1,0.00,0,'Collection'),(5,'2-PCL-1-TM','Terminal',2,0.00,0,'Collection'),(6,'2B-000-003','Coil',1,0.00,0,'Collection'),(7,'1-PCS-SD-SR-B1','Solder Dust',3,0.00,0,'Dispose'),(8,'1-PCL-SP-SR-5-1','1-PCL-SP-M',4,0.00,0,'Dispose'),(9,'2-PCL-SP-05','2-PCL-SP',4,0.00,0,'Collection'),(11,'1-PCS-SP-SR-B1','1-PCS-SP',1,0.00,0,'Dispose'),(12,'1-PCL-SP-SR-B1','1-PCL-SP',4,0.00,0,'Dispose');
/*!40000 ALTER TABLE `container` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disposewaste`
--

DROP TABLE IF EXISTS `disposewaste`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disposewaste` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Idbadge` int(11) NOT NULL,
  `Idcontainer` int(11) NOT NULL,
  `Idwaste` int(11) NOT NULL,
  `CreatedAt` int(11) NOT NULL,
  `neto` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disposewaste`
--

LOCK TABLES `disposewaste` WRITE;
/*!40000 ALTER TABLE `disposewaste` DISABLE KEYS */;
/*!40000 ALTER TABLE `disposewaste` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `isactive` int(11) NOT NULL,
  `badgeId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `badgeId` (`badgeId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'Admin',1,123),(2,'Rennu',1,940265),(3,'Ricky',1,939256);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transaction` (
  `badgeId` int(11) NOT NULL,
  `idContainer` int(11) DEFAULT NULL,
  `idWaste` int(11) DEFAULT NULL,
  `recordDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(100) NOT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `idscraplog` varchar(128) CHARACTER SET utf8 NOT NULL,
  `status` varchar(48) CHARACTER SET utf8 DEFAULT NULL,
  `fromContainer` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `toBin` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`idscraplog`),
  KEY `badgeId` (`badgeId`),
  KEY `idContainer` (`idContainer`),
  KEY `idWaste` (`idWaste`),
  CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`badgeId`) REFERENCES `employee` (`badgeId`),
  CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`idContainer`) REFERENCES `container` (`containerId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transaction_ibfk_3` FOREIGN KEY (`idWaste`) REFERENCES `waste` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (123,12,4,'2024-06-25 09:32:38','',0.00,'DC596B0FD2E04A2A979E7774C094F449','Step-1','1-PCL-SP-SR-B1','1-PCL-SP-SR-5-1');
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waste`
--

DROP TABLE IF EXISTS `waste`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `waste` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `scales` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `handletype` varchar(48) CHARACTER SET utf8 DEFAULT NULL,
  `step1` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waste`
--

LOCK TABLES `waste` WRITE;
/*!40000 ALTER TABLE `waste` DISABLE KEYS */;
INSERT INTO `waste` VALUES (1,'Copper Wire','4Kg','2024-05-17 15:28:08','2024-05-17 15:28:08',NULL,'\0'),(2,'Copper Terminal','50Kg','0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,'\0'),(3,'Solder Waste','4Kg','0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,'\0'),(4,'Solder Paste','50Kg','0000-00-00 00:00:00','0000-00-00 00:00:00','Rack','\0'),(5,'Cutting Copper Terminal','50Kg','0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,'\0'),(6,'Coil Reject (PCC)','50Kg','0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,'\0');
/*!40000 ALTER TABLE `waste` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-25 17:15:29
