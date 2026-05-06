-- ============================================================
-- Tienda Pachito – Schema MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS tienda_pachito
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_pachito;

-- ----------------------------------------------------------
-- Productos
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)   NOT NULL,
  precio      DECIMAL(10,2)  NOT NULL CHECK (precio >= 0),
  stock       INT UNSIGNED   NOT NULL DEFAULT 0,
  stock_minimo INT UNSIGNED  NOT NULL DEFAULT 5,
  activo      TINYINT(1)     NOT NULL DEFAULT 1,
  creado_en   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- Ventas (cabecera)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  total       DECIMAL(10,2)  NOT NULL DEFAULT 0,
  fecha       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP