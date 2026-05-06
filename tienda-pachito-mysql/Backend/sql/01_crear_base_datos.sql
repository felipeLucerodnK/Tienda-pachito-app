-- ============================================================
-- Tienda Pachito – Paso 1: Crear base de datos
-- Ejecutar este script en MySQL Workbench ANTES de migrate
-- ============================================================

CREATE DATABASE IF NOT EXISTS tienda_pachito
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_pachito;

-- Confirmar
SELECT 'Base de datos tienda_pachito creada correctamente ✅' AS resultado;
