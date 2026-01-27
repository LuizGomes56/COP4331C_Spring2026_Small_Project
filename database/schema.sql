-- Database
CREATE DATABASE IF NOT EXISTS contact_manager
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE contact_manager;

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
  -- Considering First / Last name approach
  first_name VARCHAR(128) NOT NULL,
  last_name  VARCHAR(128) NOT NULL,
  email      VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(60) NOT NULL,   -- Keeping 'Bcrypt', usually inside 60
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  contact_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name  VARCHAR(128) NOT NULL,
  email      VARCHAR(128),
  phone      VARCHAR(32),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

-- If user deleted, delete all contacts assigned to that user
  CONSTRAINT fk_contacts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

-- Index for fast per-user retrieval
  INDEX idx_contacts_user_name (user_id, last_name, first_name),

-- FULLTEXT index for search
  FULLTEXT INDEX ft_contacts_search (first_name, last_name, email)
) ENGINE=InnoDB;
