CREATE DATABASE  IF NOT EXISTS `sz_backend` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sz_backend`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: sz_backend
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `authorities`
--

DROP TABLE IF EXISTS `authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authorities` (
  `authority_id` bigint NOT NULL AUTO_INCREMENT,
  `authority_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`authority_id`),
  UNIQUE KEY `authority_name` (`authority_name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorities`
--

LOCK TABLES `authorities` WRITE;
/*!40000 ALTER TABLE `authorities` DISABLE KEYS */;
INSERT INTO `authorities` VALUES (1,'PROFILE_VIEW','View user profile','2025-12-19 13:54:29','2025-12-19 13:54:29'),(2,'PROFILE_EDIT','Edit own profile','2025-12-19 13:54:29','2025-12-19 13:54:29'),(3,'CHAT_SEND','Send chat messages','2025-12-19 13:54:29','2025-12-19 13:54:29'),(4,'CHAT_VIEW','View chat messages','2025-12-19 13:54:29','2025-12-19 13:54:29'),(5,'MEDIA_UPLOAD','Upload photos or videos','2025-12-19 13:54:29','2025-12-19 13:54:29'),(6,'STREAM_CREATE','Create live stream','2025-12-19 13:54:45','2025-12-19 13:54:45'),(7,'STREAM_START','Start live stream','2025-12-19 13:54:45','2025-12-19 13:54:45'),(8,'STREAM_END','End live stream','2025-12-19 13:54:45','2025-12-19 13:54:45'),(9,'STREAM_MODERATE','Moderate own stream','2025-12-19 13:54:45','2025-12-19 13:54:45'),(10,'USER_REPORT_VIEW','View user reports','2025-12-19 13:55:01','2025-12-19 13:55:01'),(11,'USER_WARN','Warn users','2025-12-19 13:55:01','2025-12-19 13:55:01'),(12,'USER_SUSPEND','Suspend users','2025-12-19 13:55:01','2025-12-19 13:55:01'),(13,'USER_BAN','Ban users','2025-12-19 13:55:01','2025-12-19 13:55:01'),(14,'ROLE_ASSIGN','Assign roles to users','2025-12-19 13:55:50','2025-12-19 13:55:50'),(15,'AUTHORITY_ASSIGN','Assign authorities','2025-12-19 13:55:50','2025-12-19 13:55:50'),(16,'SYSTEM_CONFIG','Modify system configuration','2025-12-19 13:55:50','2025-12-19 13:55:50'),(17,'ADMIN_PANEL_ACCESS','Access admin dashboard','2025-12-19 13:55:50','2025-12-19 13:55:50');
/*!40000 ALTER TABLE `authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_packages`
--

DROP TABLE IF EXISTS `coin_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_packages` (
  `package_id` bigint NOT NULL AUTO_INCREMENT,
  `banner` text COLLATE utf8mb4_unicode_ci,
  `coins` bigint NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `add_on_desc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bonus_coins` bigint DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_packages`
--

LOCK TABLES `coin_packages` WRITE;
/*!40000 ALTER TABLE `coin_packages` DISABLE KEYS */;
INSERT INTO `coin_packages` VALUES (1,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768774520975_vip_cup_big_gold_uTLjw3n0z.png',199,190.55,'INR','Add on desc',10,1,'2026-01-16 09:14:15','2026-01-18 22:56:49'),(2,NULL,250,99.00,'INR',NULL,0,1,'2026-01-16 09:14:29',NULL),(3,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768775412548_vip_cup_big_silver_8hVOseqpA.png',150,90.99,'inr','Popular',5,1,'2026-01-18 22:30:14',NULL),(4,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768775465302_vip_cup_big_silver_w8mcUgoCD.png',150,90.99,'inr','Popular',5,0,'2026-01-18 22:31:07','2026-01-18 22:58:05'),(5,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768775545964_vip_cup_big_silver_Mgnx1M_U3.png',150,90.99,'inr','Popular',5,1,'2026-01-18 22:32:28',NULL),(6,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768776090243_big_star_04_3x_Utz7vnSWqx.webp',150,90.99,'inr','Best',10,0,'2026-01-18 22:41:32','2026-01-18 22:58:02'),(7,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768776165845_big_star_04_3x_RREzy_-zK.webp',150,90.99,'inr','Best',10,1,'2026-01-18 22:42:47',NULL),(8,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768776185711_big_star_04_3x_dJzrXZkZu.webp',150,90.99,'inr','Best',10,0,'2026-01-18 22:43:07','2026-01-18 22:58:00'),(9,'https://ik.imagekit.io/jaul95sx2/coin_packages/coin_package_1768776213983_big_star_04_3x_YmnM81FVeA.webp',150,90.99,'INR','Best',10,1,'2026-01-18 22:43:36',NULL);
/*!40000 ALTER TABLE `coin_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_purchases`
--

DROP TABLE IF EXISTS `coin_purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_purchases` (
  `purchase_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `package_id` bigint NOT NULL,
  `coins` bigint NOT NULL DEFAULT '0',
  `gateway` enum('RAZORPAY','STRIPE','PAYPAL','UPI') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway_txn_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `status` enum('INITIATED','SUCCESS','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'INITIATED',
  `credited` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`purchase_id`),
  UNIQUE KEY `gateway_txn_id` (`gateway_txn_id`),
  KEY `fk_purchase_user` (`user_id`),
  KEY `fk_purchase_package` (`package_id`),
  CONSTRAINT `fk_purchase_package` FOREIGN KEY (`package_id`) REFERENCES `coin_packages` (`package_id`),
  CONSTRAINT `fk_purchase_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_purchases`
--

LOCK TABLES `coin_purchases` WRITE;
/*!40000 ALTER TABLE `coin_purchases` DISABLE KEYS */;
INSERT INTO `coin_purchases` VALUES (6,3,1,100,'UPI','12345',59.00,'INR','SUCCESS',1,'2026-01-16 09:20:31'),(8,3,1,100,'UPI','12346',59.00,'INR','SUCCESS',1,'2026-01-16 09:21:13');
/*!40000 ALTER TABLE `coin_purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_transactions`
--

DROP TABLE IF EXISTS `coin_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_transactions` (
  `transaction_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `coins` bigint NOT NULL COMMENT 'Positive for gain, Negative for spend',
  `transaction_type` enum('PURCHASE','GIFT_SENT','GIFT_RECEIVED','BONUS','REFUND','ADMIN_ADJUST') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance_after` bigint NOT NULL,
  `status` enum('SUCCESS','PENDING','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_type` (`user_id`,`transaction_type`),
  CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_transactions`
--

LOCK TABLES `coin_transactions` WRITE;
/*!40000 ALTER TABLE `coin_transactions` DISABLE KEYS */;
INSERT INTO `coin_transactions` VALUES (2,3,10,'GIFT_SENT',NULL,NULL,170,'SUCCESS','2026-01-18 20:13:13'),(3,12,10,'GIFT_RECEIVED',NULL,NULL,30,'SUCCESS','2026-01-18 20:13:13');
/*!40000 ALTER TABLE `coin_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gift_leaderboards`
--

DROP TABLE IF EXISTS `gift_leaderboards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gift_leaderboards` (
  `live_stream_id` bigint unsigned NOT NULL,
  `user_id` bigint NOT NULL,
  `total_coins` bigint DEFAULT NULL,
  PRIMARY KEY (`live_stream_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_stream_coins` (`live_stream_id`,`total_coins` DESC),
  CONSTRAINT `gift_leaderboards_ibfk_1` FOREIGN KEY (`live_stream_id`) REFERENCES `user_streams` (`stream_id`),
  CONSTRAINT `gift_leaderboards_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gift_leaderboards`
--

LOCK TABLES `gift_leaderboards` WRITE;
/*!40000 ALTER TABLE `gift_leaderboards` DISABLE KEYS */;
/*!40000 ALTER TABLE `gift_leaderboards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gifts`
--

DROP TABLE IF EXISTS `gifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gifts` (
  `gift_id` bigint NOT NULL AUTO_INCREMENT,
  `gift_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gift_icon_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coin_cost` bigint NOT NULL,
  `is_animated` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`gift_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gifts`
--

LOCK TABLES `gifts` WRITE;
/*!40000 ALTER TABLE `gifts` DISABLE KEYS */;
INSERT INTO `gifts` VALUES (11,'star','https://ik.imagekit.io/jaul95sx2/gifts/gift_1768760540851_big_star_06_3x_h_Fwojl90.webp',10,0,1,'2026-01-18 18:22:23'),(12,'small_cup','https://ik.imagekit.io/jaul95sx2/gifts/gift_1768760730904_vip_cup_small_gold_GlAUFh6w1.png',25,0,1,'2026-01-18 18:25:32'),(13,'bronze_cup','https://ik.imagekit.io/jaul95sx2/gifts/gift_1768760762160_vip_cup_small_bronze_B6ntr73Qx.png',20,0,1,'2026-01-18 18:26:04');
/*!40000 ALTER TABLE `gifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `language_id` int NOT NULL AUTO_INCREMENT,
  `language_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`language_id`),
  UNIQUE KEY `language_name` (`language_name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (13,'Bengali'),(1,'English'),(6,'German'),(16,'Gujarati'),(2,'Hindi'),(10,'Indonesian'),(12,'Italian'),(8,'Japanese'),(5,'Kannada'),(9,'Korean'),(17,'Malayalam'),(14,'Marathi'),(7,'Portuguese'),(3,'Tamil'),(4,'Telugu'),(11,'Turkish'),(15,'Urdu');
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_authorities`
--

DROP TABLE IF EXISTS `role_authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_authorities` (
  `role_id` bigint NOT NULL,
  `authority_id` bigint NOT NULL,
  PRIMARY KEY (`role_id`,`authority_id`),
  KEY `authority_id` (`authority_id`),
  CONSTRAINT `role_authorities_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `role_authorities_ibfk_2` FOREIGN KEY (`authority_id`) REFERENCES `authorities` (`authority_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_authorities`
--

LOCK TABLES `role_authorities` WRITE;
/*!40000 ALTER TABLE `role_authorities` DISABLE KEYS */;
INSERT INTO `role_authorities` VALUES (1,1),(2,1),(3,1),(4,1),(1,2),(2,2),(4,2),(1,3),(2,3),(4,3),(1,4),(2,4),(3,4),(4,4),(2,5),(4,5),(2,6),(4,6),(2,7),(4,7),(2,8),(4,8),(2,9),(4,9),(3,10),(4,10),(3,11),(4,11),(3,12),(4,12),(4,13),(4,14),(4,15),(4,16),(4,17);
/*!40000 ALTER TABLE `role_authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'USER','Default role for all users','2025-12-19 13:46:51','2025-12-19 13:46:51'),(2,'CREATOR','User who can host live streams','2025-12-19 13:46:51','2025-12-19 13:46:51'),(3,'MODERATOR','Handles reports and moderation','2025-12-19 13:46:51','2025-12-19 13:46:51'),(4,'ADMIN','Full system access','2025-12-19 13:46:51','2025-12-19 13:46:51');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_authorities`
--

DROP TABLE IF EXISTS `user_authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_authorities` (
  `user_authority_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `authority_id` bigint NOT NULL,
  `effect` enum('ALLOW','DENY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALLOW',
  `expires_at` timestamp NULL DEFAULT NULL,
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_authority_id`),
  UNIQUE KEY `user_id` (`user_id`,`authority_id`),
  KEY `authority_id` (`authority_id`),
  CONSTRAINT `user_authorities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_authorities_ibfk_2` FOREIGN KEY (`authority_id`) REFERENCES `authorities` (`authority_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_authorities`
--

LOCK TABLES `user_authorities` WRITE;
/*!40000 ALTER TABLE `user_authorities` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_follows`
--

DROP TABLE IF EXISTS `user_follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_follows` (
  `follower_id` bigint NOT NULL,
  `following_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `following_id` (`following_id`,`follower_id`),
  KEY `idx_follower_id` (`follower_id`),
  KEY `idx_following_id` (`following_id`),
  CONSTRAINT `user_follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_follows_chk_1` CHECK ((`follower_id` <> `following_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_follows`
--

LOCK TABLES `user_follows` WRITE;
/*!40000 ALTER TABLE `user_follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_gifts`
--

DROP TABLE IF EXISTS `user_gifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_gifts` (
  `user_gift_id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` bigint NOT NULL,
  `receiver_id` bigint NOT NULL,
  `gift_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total_coins` bigint NOT NULL,
  `context_type` enum('CHAT','LIVE','PROFILE','COMMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `context_id` bigint DEFAULT NULL,
  `message_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_gift_id`),
  KEY `fk_gift_sender` (`sender_id`),
  KEY `fk_gift_receiver` (`receiver_id`),
  KEY `fk_gift_master` (`gift_id`),
  KEY `idx_user_gifts_live` (`context_type`,`context_id`),
  CONSTRAINT `fk_gift_master` FOREIGN KEY (`gift_id`) REFERENCES `gifts` (`gift_id`),
  CONSTRAINT `fk_gift_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_gift_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_gifts`
--

LOCK TABLES `user_gifts` WRITE;
/*!40000 ALTER TABLE `user_gifts` DISABLE KEYS */;
INSERT INTO `user_gifts` VALUES (1,3,12,11,1,10,'LIVE',3,NULL,'2026-01-18 19:39:13'),(2,3,12,11,1,10,'LIVE',3,NULL,'2026-01-18 19:40:22'),(6,3,12,11,1,10,'LIVE',3,NULL,'2026-01-18 20:13:13');
/*!40000 ALTER TABLE `user_gifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_languages`
--

DROP TABLE IF EXISTS `user_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_languages` (
  `user_id` bigint NOT NULL,
  `language_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`language_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `user_languages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_languages_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`language_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_languages`
--

LOCK TABLES `user_languages` WRITE;
/*!40000 ALTER TABLE `user_languages` DISABLE KEYS */;
INSERT INTO `user_languages` VALUES (12,1,'2025-12-27 15:43:22'),(12,2,'2025-12-27 15:43:22'),(14,1,'2026-01-17 11:18:48'),(14,2,'2026-01-17 11:18:48');
/*!40000 ALTER TABLE `user_languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_location`
--

DROP TABLE IF EXISTS `user_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_location` (
  `user_id` bigint NOT NULL,
  `location_id` bigint NOT NULL AUTO_INCREMENT,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `county` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_location_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_location`
--

LOCK TABLES `user_location` WRITE;
/*!40000 ALTER TABLE `user_location` DISABLE KEYS */;
INSERT INTO `user_location` VALUES (3,1,'India','IN','Karnataka','Blore','563101','NAN'),(12,5,'India','IN','Karnataka','Bengaluru Urban','562106','Anekal'),(14,6,'United States','US','Virginia','Ashburn','20147','Loudoun County');
/*!40000 ALTER TABLE `user_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (3,1,'2025-12-20 07:40:49','2025-12-20 07:40:49'),(3,2,'2025-12-20 09:45:28','2025-12-20 09:45:28'),(3,3,'2025-12-27 09:01:25','2025-12-27 09:01:25'),(3,4,'2025-12-27 09:01:25','2025-12-27 09:01:25'),(12,1,'2025-12-27 15:43:22','2025-12-27 15:43:22'),(12,2,'2025-12-27 15:43:22','2025-12-27 15:43:22'),(14,1,'2026-01-17 11:18:47','2026-01-17 11:18:47'),(14,2,'2026-01-17 11:18:47','2026-01-17 11:18:47');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stats`
--

DROP TABLE IF EXISTS `user_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stats` (
  `user_id` bigint NOT NULL,
  `followers_count` int DEFAULT '0',
  `following_count` int DEFAULT '0',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_stats` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stats`
--

LOCK TABLES `user_stats` WRITE;
/*!40000 ALTER TABLE `user_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_streams`
--

DROP TABLE IF EXISTS `user_streams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_streams` (
  `stream_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `status` enum('created','live','end','banned') COLLATE utf8mb4_unicode_ci DEFAULT 'created',
  `is_audio` tinyint(1) NOT NULL DEFAULT '0',
  `is_paused` tinyint(1) NOT NULL DEFAULT '0',
  `current_viewers` int DEFAULT '0',
  `started_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_live` tinyint(1) GENERATED ALWAYS AS ((`status` = _utf8mb4'live')) STORED,
  `paused_at` timestamp NULL DEFAULT NULL,
  `total_views` bigint DEFAULT '0',
  PRIMARY KEY (`stream_id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_live_streams` (`status`,`started_at`),
  KEY `idx_user_streams_status_user` (`status`,`user_id`,`started_at`),
  KEY `idx_user_streams_live_type` (`is_live`,`is_audio`,`started_at`),
  KEY `idx_user_streams_user` (`user_id`),
  CONSTRAINT `user_streams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_streams`
--

LOCK TABLES `user_streams` WRITE;
/*!40000 ALTER TABLE `user_streams` DISABLE KEYS */;
INSERT INTO `user_streams` (`stream_id`, `user_id`, `status`, `is_audio`, `is_paused`, `current_viewers`, `started_at`, `ended_at`, `created_at`, `paused_at`, `total_views`) VALUES (1,3,'end',0,0,0,'2026-01-18 15:14:18','2026-01-18 16:54:57','2026-01-18 15:14:18',NULL,0),(2,3,'end',1,0,0,'2026-01-18 17:27:34','2026-01-18 17:35:25','2026-01-18 17:27:34',NULL,0),(3,3,'end',1,0,0,'2026-01-18 19:34:57','2026-01-19 13:59:30','2026-01-18 19:34:57',NULL,0),(4,3,'live',0,0,0,'2026-01-19 13:59:44',NULL,'2026-01-19 13:59:44',NULL,0);
/*!40000 ALTER TABLE `user_streams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vip_history`
--

DROP TABLE IF EXISTS `user_vip_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vip_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `vip_level_id` int NOT NULL,
  `achieved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expired_at` timestamp NULL DEFAULT NULL,
  `coins_spent` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `vip_level_id` (`vip_level_id`),
  CONSTRAINT `user_vip_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_vip_history_ibfk_2` FOREIGN KEY (`vip_level_id`) REFERENCES `vip_levels` (`vip_level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vip_history`
--

LOCK TABLES `user_vip_history` WRITE;
/*!40000 ALTER TABLE `user_vip_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_vip_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vip_levels`
--

DROP TABLE IF EXISTS `user_vip_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vip_levels` (
  `user_id` bigint NOT NULL,
  `vip_level_id` int NOT NULL,
  `total_coins_spent` bigint DEFAULT '0',
  `vip_started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vip_expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `vip_level_id` (`vip_level_id`),
  KEY `idx_user_vip_levels_active` (`user_id`,`is_active`),
  CONSTRAINT `user_vip_levels_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_vip_levels_ibfk_2` FOREIGN KEY (`vip_level_id`) REFERENCES `vip_levels` (`vip_level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vip_levels`
--

LOCK TABLES `user_vip_levels` WRITE;
/*!40000 ALTER TABLE `user_vip_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_vip_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_wallets`
--

DROP TABLE IF EXISTS `user_wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_wallets` (
  `wallet_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `balance` bigint NOT NULL DEFAULT '0',
  `locked_balance` bigint NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`wallet_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_wallets`
--

LOCK TABLES `user_wallets` WRITE;
/*!40000 ALTER TABLE `user_wallets` DISABLE KEYS */;
INSERT INTO `user_wallets` VALUES (1,3,170,0,'2026-01-18 20:13:13'),(5,12,30,0,'2026-01-18 20:13:13'),(6,14,0,0,'2026-01-17 11:18:48');
/*!40000 ALTER TABLE `user_wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usernames`
--

DROP TABLE IF EXISTS `usernames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usernames` (
  `username_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `username` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`username_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `user_id` (`user_id`,`is_active`),
  UNIQUE KEY `uq_user_active` (`user_id`,`is_active`),
  KEY `idx_usernames_active` (`user_id`,`is_active`),
  CONSTRAINT `usernames_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usernames`
--

LOCK TABLES `usernames` WRITE;
/*!40000 ALTER TABLE `usernames` DISABLE KEYS */;
INSERT INTO `usernames` VALUES (1,3,'FozLw_ash1',1,'2025-12-20 07:40:49','2025-12-20 07:40:49'),(5,12,'EvxEv_Y0i2',1,'2025-12-27 15:43:22','2025-12-27 15:43:22'),(6,14,'hZ29k_mkE3',1,'2026-01-17 11:18:48','2026-01-17 11:18:48');
/*!40000 ALTER TABLE `usernames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `firebase_uid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_picture` text COLLATE utf8mb4_unicode_ci,
  `dob` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `auth_provider` enum('google','phone') COLLATE utf8mb4_unicode_ci DEFAULT 'google',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `firebase_uid` (`firebase_uid`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_users_active_created` (`is_active`,`created_at`),
  KEY `idx_users_active` (`user_id`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'FozLwHqEpnfIFYzSKcmuyKb3ash1','Soulzaa Admin','https://ik.imagekit.io/jaul95sx2/profile_pictures/profile_3_1768762524967_photo-1557053910-d9eadeed1c58_DvX0hftxS.jpeg','2001-01-01','male',NULL,'vv137941@gmail.com',NULL,1,'google','2025-12-20 07:40:49','2026-01-18 18:58:51'),(12,'Q240Z3wwiGPPZKorZEarlF9NTsn2','Soulzaa',NULL,'1990-01-01','other',NULL,'soulzaa.project@gmail.com',NULL,1,'google','2025-12-27 15:43:22','2026-01-18 20:29:53'),(14,'hZ29knMafSX3AdrORZbDAICamkE3','Varun',NULL,'2004-01-17','male',NULL,NULL,'9448140164',1,'phone','2026-01-17 11:18:47','2026-01-17 11:18:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vip_levels`
--

DROP TABLE IF EXISTS `vip_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vip_levels` (
  `vip_level_id` int NOT NULL,
  `level_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_coins` bigint NOT NULL,
  `benefits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `badge_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vip_level_id`),
  CONSTRAINT `vip_levels_chk_1` CHECK (json_valid(`benefits`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vip_levels`
--

LOCK TABLES `vip_levels` WRITE;
/*!40000 ALTER TABLE `vip_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `vip_levels` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-30 18:20:33
