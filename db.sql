-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: restaurant
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
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `booking_end_time` time NOT NULL,
  `number_of_people` int NOT NULL,
  `special_requests` text,
  `menu_items` json DEFAULT NULL,
  `status` enum('pending','confirmed','canceled','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `restaurant_id` int NOT NULL,
  `table_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_status` (`status`),
  KEY `fk_bookings_restaurant` (`restaurant_id`),
  KEY `idx_bookings_customer` (`customer_id`),
  KEY `fk_bookings_table` (`table_id`),
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_table` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_menu_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_menu_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,2,'B&G Special Fried Rice 1:3','Big flavors for big hearts.❤️?️',469.00,'1750967230858-80490079.jpg','2025-06-26 12:50:47','2025-06-26 19:47:10'),(2,2,'Seafood Salad','Big flavors for big hearts.❤️?️',399.00,'1750942734430-322065555.jpg','2025-06-26 12:58:54','2025-06-26 12:58:54'),(3,2,'Szechuan Chicken 1:3','Big flavors for big hearts.❤️?️',469.00,'1750942804282-70576027.jpg','2025-06-26 13:00:04','2025-06-26 13:00:04'),(4,2,'Chicken Chili Onion 1:3','Big flavors for big hearts.❤️?️',399.00,'1750942874411-308713324.jpg','2025-06-26 13:01:14','2025-06-26 13:01:14'),(5,2,'Thai Vegetables 1:3','Big flavors for big hearts.❤️?️',349.00,'1750942920128-12437030.jpg','2025-06-26 13:02:00','2025-06-26 13:02:00'),(6,3,'চিকেন দম বিরিয়ানি','এখন ১০% ছাড়ে',179.00,'1750964126640-640697142.jpg','2025-06-26 13:10:30','2025-06-26 18:55:26'),(8,3,'বিফ চাপ- পোলাও','এখন ১০% ছাড়ে',198.00,'1750943554196-43030080.jpg','2025-06-26 13:12:34','2025-06-26 13:12:34'),(9,3,'মাটন তেহেরি এখন','এখন ১০% ছাড়ে',225.00,'1750943639939-563326135.jpg','2025-06-26 13:13:59','2025-06-26 13:13:59'),(10,3,'মাটন কাচ্চি','এখন ১০% ছাড়ে',299.00,'1750943698984-539419421.jpg','2025-06-26 13:14:58','2025-06-26 13:14:58'),(11,3,'চিকেন রোস্ট, পোলাও এবং বোরহানি','এখন ১০% ছাড়ে',299.00,'1750943742108-37165770.jpg','2025-06-26 13:15:42','2025-06-26 13:15:42');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_images`
--

DROP TABLE IF EXISTS `restaurant_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_restaurant_images_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_restaurant_images_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_images`
--

LOCK TABLES `restaurant_images` WRITE;
/*!40000 ALTER TABLE `restaurant_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurant_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_tables`
--

DROP TABLE IF EXISTS `restaurant_tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_tables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `table_number` varchar(10) NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `restaurant_tables_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_tables`
--

LOCK TABLES `restaurant_tables` WRITE;
/*!40000 ALTER TABLE `restaurant_tables` DISABLE KEYS */;
INSERT INTO `restaurant_tables` VALUES (3,2,'1',4),(5,2,'2',4),(6,2,'3',4),(7,2,'5',4),(8,2,'6',4),(9,2,'7',4),(10,2,'8',4),(15,3,'2',2),(16,3,'3',4),(17,3,'4',4),(18,3,'5',6),(19,3,'7',6),(21,3,'1',2);
/*!40000 ALTER TABLE `restaurant_tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `address` text NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `cuisine_type` varchar(50) DEFAULT NULL,
  `owner_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `map` text COMMENT 'HTML <iframe> snippet for embedding the map',
  PRIMARY KEY (`id`),
  KEY `fk_restaurants_owner` (`owner_id`),
  KEY `idx_restaurant_email` (`email`),
  CONSTRAINT `fk_restaurants_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (2,'Butter & Grace \'s Restaurant','Hungry? Just eat.','Paradise Bhaban, Level-3 50 Lalbagh Road (Opposite Of Fort Mosque Gate), Dhaka, Bangladesh','01300-808234','buttergrace95@gmail.com','1748037023883-221540368.jpg','Fast Food',9,'2025-05-12 23:49:18','2025-06-26 14:33:20','<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d913.1918294893518!2d90.38619168386134!3d23.720001899999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b90f80d9ae43%3A0x60dcf9cf4fb94b69!2sButter%20%26%20Grace!5e0!3m2!1sen!2sbd!4v1750947475454!5m2!1sen!2sbd\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>'),(3,'Sultan\'s Dine','Get the best biriani in Dhaka','Green Akshay Plaza, 146/G (old), 59 (new), Satmasjid Road, Dhaka, Bangladesh','01775-003218','sultandine@gmail.com','1750302791479-514008556.jpg',' Bengali cuisine',12,'2025-06-19 03:12:19','2025-06-26 14:34:27','<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2387764266923!2d90.37282297518708!3d23.738863178678265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8caa7e60837%3A0xf47efcf6f49b50c5!2sSultan&#39;s%20Dine%20-%20Dhanmondi!5e0!3m2!1sen!2sbd!4v1750948452693!5m2!1sen!2sbd\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_restaurant` (`user_id`,`restaurant_id`),
  KEY `fk_reviews_restaurant` (`restaurant_id`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `fk_reviews_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_reviews` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,10,3,5,'good!','2025-06-28 04:33:58'),(5,1,3,5,'nice!','2025-06-26 19:18:00'),(7,1,2,5,'good!','2025-06-26 19:19:50'),(8,10,2,5,'best','2025-06-26 20:03:20');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `user_type` enum('seller','customer') NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nayem@fun.com','$2b$10$gR4ltEj6P.2XyQZiOMgSbe6UVeBTGWZHfsqFQIp4bgrakzN9el5Oi','Md. Nayemur Rahman','01711223344','Dhaka Notubazar','customer','1747792397306-334299172.jpg','2025-05-12 18:39:25','2025-06-17 17:46:15'),(9,'buttergrace95@gmail.com','$2b$10$bg8rIWheelLCjZqzrvVZ..pjdFrWJV95n3cGpEqBJQd0tAB.QTGey','Fahim Khan','01300-808234','Paradise Bhaban, Level-3 50 Lalbagh Road (Opposite Of Fort Mosque Gate), Dhaka, Bangladesh','seller','1747792433725-23360362.jpg','2025-05-12 23:49:17','2025-05-21 01:53:53'),(10,'emon@fun.com','$2b$10$ix5Ub0nZmbztbz9UaPS0XuIupPzh7EwRgHY0y.iZjqEnJFdlEGOW6','Mehadi Hassion Emon','0123456789','Dhaka','customer','1750301643817-983691057.jpg','2025-06-19 02:54:03','2025-06-19 02:54:03'),(12,'sultandine@gmail.com','$2b$10$fh1wcI524kj.oFLYVtCxU.Jwdzvv3MYOz0lvkpHQQWBvGB0ZOpnnq','Maruf Shahriar','01775-003218','Green Akshay Plaza, 146/G (old), 59 (new), Satmasjid Road, Dhaka, Bangladesh','seller','1750302739589-387487510.jpg','2025-06-19 03:12:19','2025-06-19 03:12:19'),(13,'sm@gmail.com','$2b$10$kK7071v7H/g/uTWhdSTk.OF6w9kuZg8wyD7291E8Rm8aflVohZ/rW','S.M.Maruph','01766972626','Paradise Bhaban, Level-3 50 Lalbagh Road (Opposite Of Fort Mosque Gate), Dhaka, Bangladesh','customer','1750887903636-481934989.jpg','2025-06-25 21:45:03','2025-06-25 21:45:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-29  2:04:17
