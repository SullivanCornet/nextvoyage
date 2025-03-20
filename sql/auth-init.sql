-- Script d'initialisation de l'authentification
-- La table users existe déjà, donc nous n'avons pas besoin de la créer
-- Nous allons uniquement mettre à jour les tables qui ont besoin de colonnes supplémentaires

-- Mise à jour des tables existantes pour ajuster le champ status
-- Table cities
ALTER TABLE `cities` 
  MODIFY COLUMN IF EXISTS `status` ENUM('published','pending','rejected') NOT NULL DEFAULT 'pending';

-- Table city_accommodations
ALTER TABLE `city_accommodations` 
  MODIFY COLUMN IF EXISTS `status` ENUM('published','pending','rejected') NOT NULL DEFAULT 'pending';

-- Table city_transports
ALTER TABLE `city_transports` 
  MODIFY COLUMN IF EXISTS `status` ENUM('published','pending','rejected') NOT NULL DEFAULT 'pending';

-- Table countries
ALTER TABLE `countries` 
  MODIFY COLUMN IF EXISTS `status` ENUM('published','pending','rejected') NOT NULL DEFAULT 'published';

-- Table places
ALTER TABLE `places` 
  MODIFY COLUMN IF EXISTS `status` ENUM('published','pending','rejected') NOT NULL DEFAULT 'pending';

-- Note: Nous n'avons pas besoin de créer un utilisateur admin car il existe déjà dans la base de données 