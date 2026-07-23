-- ============================================================
-- Vision Vortex - Digital Farm Management Portal
-- Database: MySQL
-- File: schema.sql
--
-- This file creates the database and all the tables we need.
-- I kept the table names simple and used comments everywhere
-- so that anyone reading this (including my professor) can
-- understand what each column is for.
-- ============================================================

CREATE DATABASE IF NOT EXISTS vision_vortex_farm;
USE vision_vortex_farm;

-- ------------------------------------------------------------
-- 1. USERS TABLE
-- Stores farmers, veterinarians and admin in one single table.
-- The "role" column tells us which type of user it is.
-- (We could have made 3 separate tables, but one table with a
--  role column is simpler to manage for CRUD operations.)
-- ------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- stored as bcrypt hash, never plain text
    role ENUM('farmer', 'vet', 'admin') NOT NULL DEFAULT 'farmer',
    farm_name VARCHAR(100),                   -- only really used for farmers
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. ANIMALS TABLE
-- Every animal belongs to one farmer (owner_id).
-- ------------------------------------------------------------
CREATE TABLE animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    animal_tag VARCHAR(50) NOT NULL,          -- like an ID tag / ear tag number
    name VARCHAR(100),
    species ENUM('Cow','Buffalo','Goat','Sheep','Poultry','Other') NOT NULL,
    breed VARCHAR(100),
    age INT,
    gender ENUM('Male','Female'),
    weight DECIMAL(6,2),
    health_status ENUM('Healthy','Sick','Under Treatment','Critical') DEFAULT 'Healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3. MEDICINES TABLE (this is the antimicrobial tracking part)
-- Every time an antimicrobial/medicine is given to an animal,
-- we save it here, along with the withdrawal period.
--
-- Withdrawal period = number of days after the LAST dose during
-- which milk/meat from that animal should NOT be sold, because
-- medicine residue may still be present in the animal's body.
-- withdrawal_end_date = end_date + withdrawal_days
-- ------------------------------------------------------------
CREATE TABLE medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    owner_id INT NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    is_antimicrobial BOOLEAN DEFAULT TRUE,     -- flag to separate antimicrobials from normal medicine
    dosage VARCHAR(100),
    purpose VARCHAR(150),
    vet_name VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    withdrawal_days INT DEFAULT 0,
    withdrawal_end_date DATE,                  -- calculated when the record is saved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. VACCINATIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    owner_id INT NOT NULL,
    vaccine_name VARCHAR(150) NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE NOT NULL,
    given_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. INVENTORY TABLE (medicine stock in the farm store room)
-- ------------------------------------------------------------
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(30) DEFAULT 'units',          -- e.g. bottles, tablets, ml
    reorder_level INT DEFAULT 5,               -- if quantity goes below this, show a low-stock alert
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 6. ALERTS TABLE
-- Used for withdrawal-period-active alerts, vaccination-due
-- alerts and low-stock alerts.
-- ------------------------------------------------------------
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type ENUM('withdrawal','vaccination','stock','system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- SAMPLE / SEED DATA
-- Just a little bit of test data so the dashboard is not empty
-- when the project is demonstrated. Password for both accounts
-- below is: Password@123  (already hashed with bcrypt, 10 rounds)
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, role, farm_name, phone) VALUES
('Ramesh Kumar', 'farmer@test.com', '$2a$10$3f2S0m1c1r9r6H2ZbYQvKOo3o0N4b1x0m4gk8v9d0YQ6b1u4b0T9O', 'farmer', 'Green Valley Farm', '9876543210'),
('Dr. Anjali Sharma', 'vet@test.com', '$2a$10$3f2S0m1c1r9r6H2ZbYQvKOo3o0N4b1x0m4gk8v9d0YQ6b1u4b0T9O', 'vet', NULL, '9123456780'),
('Admin User', 'admin@test.com', '$2a$10$3f2S0m1c1r9r6H2ZbYQvKOo3o0N4b1x0m4gk8v9d0YQ6b1u4b0T9O', 'admin', NULL, '9000000000');

-- NOTE: the hash above is only a placeholder pattern for readability in this file.
-- When you actually run backend/db/seed.js (see README), it will hash the password
-- "Password@123" freshly using bcrypt and update these rows correctly.
