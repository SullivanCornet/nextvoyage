-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 20 mars 2025 à 22:31
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `nextvoyageplus`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `created_at`, `updated_at`) VALUES
(1, 'Monuments', 'monuments', 'Sites historiques et monuments', 'monument', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(2, 'Musées', 'musees', 'Musées et galeries d\'art', 'museum', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(3, 'Parcs', 'parcs', 'Parcs et jardins', 'tree', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(4, 'Restaurants', 'restaurants', 'Restaurants et gastronomie', 'utensils', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(5, 'Hébergements', 'hebergements', 'Hôtels et autres hébergements', 'bed', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(6, 'Plages', 'plages', 'Plages et côtes', 'umbrella-beach', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(7, 'Shopping', 'shopping', 'Centres commerciaux et boutiques', 'shopping-bag', '2025-03-18 01:26:16', '2025-03-18 01:26:16'),
(8, 'Vie nocturne', 'vie-nocturne', 'Bars et clubs', 'moon', '2025-03-18 01:26:16', '2025-03-18 01:26:16');

-- --------------------------------------------------------

--
-- Structure de la table `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `country_id` int(11) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','pending','published','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `cities`
--

INSERT INTO `cities` (`id`, `country_id`, `country_code`, `name`, `slug`, `description`, `image_path`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(11, 6, 'DZ', 'Alger', 'alger', 'Alger La Blanche', '/uploads/cities/1742273814389_8b737be2.jpg', NULL, 'published', '2025-03-18 03:56:57', '2025-03-18 04:56:57'),
(12, 7, 'JP', 'Tokyo', 'tokyo', 'La plus connue du japon', '/uploads/cities/1742273960875_0a4cbdc3.jpg', NULL, 'published', '2025-03-18 03:59:21', '2025-03-18 04:59:21'),
(13, 11, 'EG', 'Le Caire ', 'le-caire', 'L’immense capitale égyptienne, Le Caire, est traversée par le fleuve du Nil. Le cœur de la ville abrite la place Tahrir et le musée égyptien du Caire, un trésor d’antiquités avec ses momies royales et le trésor du pharaon Toutânkhamon. Non loin du musée se trouve Gizeh avec ses légendaires pyramides et la statue du Sphinx, dont la construction date du XXVIe siècle av. J.-C. Dans le quartier boisé de Zamalek sur l\'île de Gezira, on peut admirer une vue panoramique de la ville depuis la tour du Caire, qui s’élève à 187 m d’altitude', '/uploads/cities/1742326552655_c8dbfa26.jpg', NULL, 'published', '2025-03-18 18:35:55', '2025-03-18 19:35:55'),
(14, 6, 'DZ', 'Tizi ouzou', 'tizi-ouzou', 'ville en kabylie', '/uploads/cities/1742428302978_84d6d8e5.jpg', NULL, 'published', '2025-03-19 22:51:43', '2025-03-19 23:51:43'),
(15, 7, 'JP', 'cffff', 'cffff', 'fffffffffffffffffffffffffffffffffffffffffffffffff', NULL, NULL, 'published', '2025-03-20 20:19:13', '2025-03-20 21:19:13'),
(16, 7, 'JP', 'dqdqdqsqsdqdqd', 'dqdqdqsqsdqdqd', 'qsddddqsdqdqdqsd', NULL, NULL, 'published', '2025-03-20 20:27:37', '2025-03-20 21:27:37');

-- --------------------------------------------------------

--
-- Structure de la table `city_accommodations`
--

CREATE TABLE `city_accommodations` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `accommodation_type` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `price_range` varchar(100) DEFAULT NULL,
  `comfort_level` tinyint(4) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','pending','published','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `city_accommodations`
--

INSERT INTO `city_accommodations` (`id`, `city_id`, `accommodation_type`, `name`, `slug`, `description`, `address`, `price_range`, `comfort_level`, `phone`, `website`, `image_path`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(3, 11, 'maison', 'maison avec jardin et piscine', NULL, 'fsfsdfsfsfsfsdfsdfsfs', 'sdfsfsjjj', 'superieur', 4, NULL, NULL, '/uploads/accommodations/1742359992886_e0bba39a.png', NULL, 'published', '2025-03-18 21:28:44', '2025-03-20 19:22:10');

-- --------------------------------------------------------

--
-- Structure de la table `city_transports`
--

CREATE TABLE `city_transports` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `transport_type` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price_info` text DEFAULT NULL,
  `schedule` text DEFAULT NULL,
  `tips` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','pending','published','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `city_transports`
--

INSERT INTO `city_transports` (`id`, `city_id`, `transport_type`, `name`, `slug`, `description`, `price_info`, `schedule`, `tips`, `image_path`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(2, 11, 'taxi', 'Mahmoud taxi', NULL, 'mahmoud tres sympa, tu l\'appelles il vient te chercher et t\'amenes ou tu veux:\n012.045.897.998', 'pas cher', 'a voir avec lui', 'appelle le la veille au plus tard pour les longs déplacements', '/uploads/transports/1742334637640_e8205d09.jpg', NULL, 'published', '2025-03-18 05:23:07', '2025-03-20 19:20:34');

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `entity_type` enum('country','city','place','transport','accommodation') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `countries`
--

CREATE TABLE `countries` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `country_code` varchar(10) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `population` varchar(100) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `capital` varchar(100) DEFAULT NULL,
  `currency` varchar(100) DEFAULT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `flag_image` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `countries`
--

INSERT INTO `countries` (`id`, `name`, `slug`, `country_code`, `description`, `language`, `population`, `area`, `capital`, `currency`, `currency_code`, `image_path`, `flag_image`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(6, 'Algeria', 'algeria', 'DZ', 'Algeria est un pays situé en Africa, plus précisément en Northern Africa.', 'Arabic', '44700000', '2381741', 'Algiers', 'Algerian dinar', 'DZD', 'https://flagcdn.com/dz.svg', 'https://flagcdn.com/dz.svg', NULL, 'published', '2025-03-18 03:51:53', '2025-03-18 04:51:53'),
(7, 'Japan', 'japan', 'JP', 'Japan est un pays situé en Asia, plus précisément en Eastern Asia.', 'Japanese', '125836021', '377930', 'Tokyo', 'Japanese yen', 'JPY', 'https://flagcdn.com/jp.svg', 'https://flagcdn.com/jp.svg', NULL, 'published', '2025-03-18 03:58:25', '2025-03-18 04:58:25'),
(8, 'United States', 'united-states', 'US', 'United States est un pays situé en Americas, plus précisément en North America.', 'English', '329484123', '9372610', 'Washington, D.C.', 'United States dollar', 'USD', 'https://flagcdn.com/us.svg', 'https://flagcdn.com/us.svg', NULL, 'published', '2025-03-18 04:33:22', '2025-03-18 05:33:22'),
(11, 'Egypt', 'egypt', 'EG', 'Egypt est un pays situé en Africa, plus précisément en Northern Africa.', 'Arabic', '102334403', '1002450', 'Cairo', 'Egyptian pound', 'EGP', 'https://flagcdn.com/eg.svg', 'https://flagcdn.com/eg.svg', NULL, 'published', '2025-03-18 18:32:48', '2025-03-18 19:32:48'),
(15, 'Andorra', 'andorra', 'AD', 'Andorra est un pays situé en Europe, plus précisément en Southern Europe.', 'Catalan', '77265', '468', 'Andorra la Vella', 'Euro', 'EUR', 'https://flagcdn.com/ad.svg', 'https://flagcdn.com/ad.svg', NULL, 'published', '2025-03-20 20:28:15', '2025-03-20 21:28:15');

-- --------------------------------------------------------

--
-- Structure de la table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `entity_type` enum('country','city','place','transport','accommodation') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `places`
--

CREATE TABLE `places` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `practical_info` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','pending','published','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `places`
--

INSERT INTO `places` (`id`, `city_id`, `category_id`, `name`, `slug`, `description`, `practical_info`, `location`, `image_path`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(15, 11, 1, 'marché  de la casbah d\' Alger', 'march-de-la-casbah-d-alger', 'marché  de la casbah d\' Alger marché  de la casbah\nmarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Algermarché  de la casbah d\' Alger marché  de la casbah d\' Alger', NULL, 'marché  de la casbah d\' Alger', '/uploads/shops/1742274780373_411be912.jpg', NULL, 'published', '2025-03-18 04:13:03', '2025-03-19 23:36:46'),
(17, 13, 3, 'Les Pyramides de Gizeh', 'les-pyramides-de-gizeh', 'Les pyramides de Gizeh, aussi appelées complexe pyramidal de Gizeh, sont l\'ensemble des pyramides égyptiennes situées dans la nécropole de Gizeh sur le plateau de Gizeh, proche de la métropole du Caire. Elles sont les seules des Sept Merveilles du monde à avoir survécu jusqu\'à nos jours', NULL, ' Al Haram, Giza Governorate 3512201, Égypte', '/uploads/places/img_1742326730492_a51af6da.jpg', NULL, 'published', '2025-03-18 18:38:50', '2025-03-18 19:38:50'),
(19, 11, 2, 'Chez aziz', 'chez-aziz', 'restaurant à algerrestaurant à algerrestaurant à algerrestaurant à alger', NULL, 'hdkqjdk', '/uploads/places/place_19_1742430958776_88cda7d8.jpg', NULL, 'published', '2025-03-19 05:59:59', '2025-03-20 19:23:36'),
(20, 11, 3, 'la casbahf', 'la-casbahf', 'la casbah d\'alger\r\nla casbah d\'algerla casbah d\'alger', NULL, 'la casbah d\'alger', '/uploads/places/img_1742431083712_ac64fce0.jpg', NULL, 'published', '2025-03-19 23:38:03', '2025-03-20 00:08:47');

-- --------------------------------------------------------

--
-- Structure de la table `place_categories`
--

CREATE TABLE `place_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `place_categories`
--

INSERT INTO `place_categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'Commerces', 'commerces', 'Boutiques, magasins et marchés', '2025-03-17 22:22:03'),
(2, 'Restaurants', 'restaurants', 'Restaurants, cafés et bars', '2025-03-17 22:22:03'),
(3, 'Lieux à visiter', 'lieux-a-visiter', 'Monuments, musées et sites touristiques', '2025-03-17 22:22:03');

-- --------------------------------------------------------

--
-- Structure de la table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `entity_type` enum('country','city','place','transport','accommodation') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 0 and 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `type` enum('country','city','place','transport','accommodation') NOT NULL,
  `name` varchar(100) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `user_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_by` int(11) DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','moderator','admin') DEFAULT 'user',
  `status` enum('reported','banned') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'poulou', 'poulouvoyage@gmail.com', '$2a$10$5cseqIX1gv.Fxtkz/heIAOfLwEN.DMl1gS/j4XeGpr/1glmzMZGuK', 'admin', NULL, '2025-03-16 22:10:30', '2025-03-16 23:33:07'),
(2, 'papapoulou', 'papapoulouvoyage@gmail.com', '$2a$10$4Q8V6hh1SLnoDXKnfFrqZOI287NJKLWlAWXBsANP/BoyrinN1Kacq', 'user', NULL, '2025-03-17 00:07:44', '2025-03-17 00:07:44'),
(3, 'ptitepatate', 'ptitepatate@gmail.com', '$2b$10$MDFccNuJcpCkOT0XTC.gieOn1skp8ZYL4bw956logkOTdU.NHfc/.', 'user', NULL, '2025-03-20 03:23:57', '2025-03-20 03:23:57');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Index pour la table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `country_id` (`country_id`,`slug`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `city_accommodations`
--
ALTER TABLE `city_accommodations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `city_id` (`city_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `city_transports`
--
ALTER TABLE `city_transports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `city_id` (`city_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Index pour la table `places`
--
ALTER TABLE `places`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `city_id` (`city_id`,`slug`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `place_categories`
--
ALTER TABLE `place_categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rating` (`entity_type`,`entity_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `rejected_by` (`rejected_by`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `city_accommodations`
--
ALTER TABLE `city_accommodations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `city_transports`
--
ALTER TABLE `city_transports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `places`
--
ALTER TABLE `places`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `place_categories`
--
ALTER TABLE `place_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cities_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `city_accommodations`
--
ALTER TABLE `city_accommodations`
  ADD CONSTRAINT `city_accommodations_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `city_accommodations_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `city_transports`
--
ALTER TABLE `city_transports`
  ADD CONSTRAINT `city_transports_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `city_transports_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `countries`
--
ALTER TABLE `countries`
  ADD CONSTRAINT `countries_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `images_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `places`
--
ALTER TABLE `places`
  ADD CONSTRAINT `places_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `places_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `place_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `places_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
