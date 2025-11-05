CREATE DATABASE IF NOT EXISTS cineVerse;
USE cineVerse;
CREATE TABLE IF NOT EXISTS users(
	dni VARCHAR(9) NOT NULL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	username VARCHAR(50) NOT NULL UNIQUE,
	birth_date DATE NOT NULL,
	email VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(20) NOT NULL,
	role ENUM('admin', 'user') DEFAULT 'user',
	profile JSON
);

CREATE TABLE IF NOT EXISTS profiles (
	id_profile INT AUTO_INCREMENT PRIMARY KEY,
	id_user VARCHAR(9) NOT NULL,
	name VARCHAR(100) NOT NULL,
	FOREIGN KEY (id_user) REFERENCES users(dni)
);

CREATE TABLE IF NOT EXISTS movies (
	id_movie INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	title VARCHAR(255) NOT NULL UNIQUE,
	description VARCHAR(500) NOT NULL,
	release_date DATE NOT NULL,
	genre VARCHAR(50) NOT NULL,
	minimum_age INT NOT NULL,
	duration_minutes INT NOT NULL,
	actors JSON
);

CREATE TABLE IF NOT EXISTS series (
	id_series INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	title VARCHAR(255) NOT NULL UNIQUE,
	description VARCHAR(500) NOT NULL,
	release_date DATE NOT NULL,
	genre VARCHAR(50) NOT NULL,
	minimum_age INT NOT NULL,
	seasons INT NOT NULL,
	actors JSON
);

CREATE TABLE IF NOT EXISTS seasons (
	id_season INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	id_series INT NOT NULL,
	season_number INT NOT NULL,
	chapters INT NOT NULL,
	FOREIGN KEY (id_series) REFERENCES series(id_series)
);

CREATE TABLE IF NOT EXISTS chapters (
	id_chapter INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	id_series INT NOT NULL,
	chapter_number INT NOT NULL UNIQUE,
	title VARCHAR(255) NOT NULL,
	duration_minutes INT,
	FOREIGN KEY (id_series) REFERENCES seasons(id_series)
);

CREATE TABLE IF NOT EXISTS likes (
	id_like INT AUTO_INCREMENT PRIMARY KEY,
	id_profile INT NOT NULL,
	id_movie INT,
	id_series INT,
	FOREIGN KEY (id_profile) REFERENCES profiles(id_profile),
	FOREIGN KEY (id_movie) REFERENCES movies(id_movie),
	FOREIGN KEY (id_series) REFERENCES series(id_series)
);

CREATE TABLE IF NOT EXISTS favorites (
	id_favorite INT AUTO_INCREMENT PRIMARY KEY,
	id_profile INT NOT NULL,
	id_movie INT,
	id_series INT,
	FOREIGN KEY (id_profile) REFERENCES profiles(id_profile),
	FOREIGN KEY (id_movie) REFERENCES movies(id_movie),
	FOREIGN KEY (id_series) REFERENCES series(id_series)
);