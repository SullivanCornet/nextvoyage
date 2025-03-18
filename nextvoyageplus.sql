-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 18 mars 2025 à 03:57
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
  `status` enum('draft','published','archived') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `cities`
--

INSERT INTO `cities` (`id`, `country_id`, `country_code`, `name`, `slug`, `description`, `image_path`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(4, 1, 'FR', 'Paris', 'paris', 'Ville des parigots', NULL, NULL, 'published', '2025-03-17 21:01:37', '2025-03-17 22:01:37'),
(8, 5, 'JP', 'Tokyo', 'tokyo', 'la ville jap la plus connu', '/uploads/cities/1742266029221_f8f865dd.jpg', NULL, 'published', '2025-03-18 01:47:09', '2025-03-18 02:47:09'),
(9, 5, 'JP', 'Osaka', 'osaka', '2eme ville jap', '/uploads/cities/1742266057481_f8a7d0fc.jpg', NULL, 'published', '2025-03-18 01:47:37', '2025-03-18 02:47:37'),
(10, 5, 'JP', 'sakai', 'sakai', 'eme ville jap', '/uploads/cities/1742266083443_a4348212.jpg', NULL, 'published', '2025-03-18 01:48:03', '2025-03-18 02:48:03');

-- --------------------------------------------------------

--
-- Structure de la table `city_accommodations`
--

CREATE TABLE `city_accommodations` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `accommodation_type` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `price_range` varchar(100) DEFAULT NULL,
  `comfort_level` tinyint(4) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `city_transports`
--

CREATE TABLE `city_transports` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `transport_type` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price_info` text DEFAULT NULL,
  `schedule` text DEFAULT NULL,
  `tips` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

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
(1, 'France', 'france', 'FR', 'La France est un pays d\'Europe occidentale.', 'Français', NULL, NULL, 'Paris', 'Euro', 'EUR', NULL, NULL, NULL, 'published', '2025-03-16 23:25:17', '2025-03-16 23:25:17'),
(5, 'Japon', 'japon', 'JP', 'le pays du soleil levant', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'published', '2025-03-18 01:46:40', '2025-03-18 02:46:40');

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
  `status` enum('draft','published','archived') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `places`
--

INSERT INTO `places` (`id`, `city_id`, `category_id`, `name`, `slug`, `description`, `practical_info`, `location`, `image_path`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 'ronde des pains', 'ronde-des-pains', 'boulangerie de francais', NULL, NULL, NULL, NULL, 'published', '2025-03-17 21:27:37', '2025-03-17 22:27:37'),
(2, 4, 3, 'Tour eiffel', 'tour-eiffel', 'du metal beaucoup de metal', NULL, NULL, NULL, NULL, 'published', '2025-03-17 21:29:05', '2025-03-17 22:29:05'),
(3, 4, 2, 'mangeur de grenouilles', 'mangeur-de-grenouilles', 'mangeur de grenouilles', NULL, NULL, NULL, NULL, 'published', '2025-03-17 21:56:29', '2025-03-17 22:56:29'),
(4, 4, 2, 'eaeaeaeaeaz', 'eaeaeaeaeaz', 'azeaeazeazeazeaeazea', NULL, NULL, NULL, NULL, 'published', '2025-03-17 22:25:33', '2025-03-17 23:25:33'),
(5, 4, 2, 'qdsqqqqq', 'qdsqqqqq', 'qdqsdqsqdqsdqdqsdqdqdqs', NULL, 'qdqdqdqdqsdqd', NULL, NULL, 'published', '2025-03-17 23:28:02', '2025-03-18 00:28:02'),
(6, 4, 3, 'qdsqdqsdqdqd', 'qdsqdqsdqdqd', 'dqdqdqdqddddddddddddddd', NULL, 'ddddddd', '/uploads/places/img_1742261227237_e0482dc5.jpg', NULL, 'published', '2025-03-18 00:27:07', '2025-03-18 01:27:07'),
(7, 4, 1, 'qdqdqdqdqdqdqdq', 'qdqdqdqdqdqdqdq', 'dddddddddddddddddddddddddddddddddddddddd', NULL, 'dddddddddddddddd', '/uploads/places/img_1742261302416_936e7d82.png', NULL, 'published', '2025-03-18 00:28:22', '2025-03-18 01:28:22'),
(10, 8, 3, 'Mont Fuji', 'mont-fuji', 'grosse montagne emblematique', NULL, 'mont fuji c\'est gros tu peux pas le louper', '/uploads/places/img_1742266150322_0ec3d5a3.jpg', NULL, 'published', '2025-03-18 01:49:10', '2025-03-18 02:49:10'),
(11, 8, 2, 'des sushis', 'des-sushis', 'sushissushissushissushissushissushissushissushissushis', NULL, 'rue des sushi', '/uploads/places/img_1742266216008_febdd9bc.jpg', NULL, 'published', '2025-03-18 01:50:16', '2025-03-18 02:50:16'),
(12, 8, 1, 'akihabara', 'akihabara', 'plein de commerces', NULL, 'akihabara', '/uploads/places/img_1742266355112_d981db7a.jpg', NULL, 'published', '2025-03-18 01:52:35', '2025-03-18 02:52:35');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'poulou', 'poulouvoyage@gmail.com', '$2a$10$5cseqIX1gv.Fxtkz/heIAOfLwEN.DMl1gS/j4XeGpr/1glmzMZGuK', 'admin', '2025-03-16 22:10:30', '2025-03-16 23:33:07'),
(2, 'papapoulou', 'papapoulouvoyage@gmail.com', '$2a$10$4Q8V6hh1SLnoDXKnfFrqZOI287NJKLWlAWXBsANP/BoyrinN1Kacq', 'user', '2025-03-17 00:07:44', '2025-03-17 00:07:44');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `city_accommodations`
--
ALTER TABLE `city_accommodations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `city_transports`
--
ALTER TABLE `city_transports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `places`
--
ALTER TABLE `places`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
