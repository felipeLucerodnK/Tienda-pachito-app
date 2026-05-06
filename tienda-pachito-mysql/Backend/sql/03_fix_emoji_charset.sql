-- ============================================================
-- Tienda Pachito – Fix charset emoji (ejecutar si ya hiciste migrate)
-- Esto garantiza que la columna emoji soporte emojis en MySQL
-- ============================================================

USE tienda_pachito;

ALTER TABLE productos
  MODIFY COLUMN emoji VARCHAR(10)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  DEFAULT '📦';

SELECT 'Columna emoji corregida ✅' AS resultado;
