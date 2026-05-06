-- ============================================================
-- Tienda Pachito – Paso 2: Datos iniciales de ejemplo
-- Ejecutar DESPUÉS de: python manage.py migrate
-- ============================================================

USE tienda_pachito;

-- Limpiar datos anteriores (respeta el orden por FK)
DELETE FROM ventas;
DELETE FROM compras;
DELETE FROM productos;
ALTER TABLE productos AUTO_INCREMENT = 1;
ALTER TABLE ventas    AUTO_INCREMENT = 1;
ALTER TABLE compras   AUTO_INCREMENT = 1;

-- ── Productos ────────────────────────────────────────────────
INSERT INTO productos (nombre, precio, stock, stock_minimo, emoji, creado_en) VALUES
  ('Pan Artesanal',  3500,  120, 30, '🍞', NOW()),
  ('Leche Entera',   4200,   20, 25, '🥛', NOW()),
  ('Manzanas (kg)',  6000,   50, 15, '🍎', NOW()),
  ('Arroz 1kg',      4500,  110, 20, '🌾', NOW()),
  ('Aceite 1L',     12000,   80, 10, '🫙', NOW()),
  ('Huevos x12',     9500,   60, 12, '🥚', NOW());

-- ── Ventas de ejemplo ────────────────────────────────────────
INSERT INTO ventas (producto_id, producto_nombre, cantidad, precio_unitario, total, fecha) VALUES
  (1, 'Pan Artesanal',  5,  3500,  17500, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
  (3, 'Manzanas (kg)',  2,  6000,  12000, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
  (5, 'Aceite 1L',      1, 12000,  12000, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (6, 'Huevos x12',     3,  9500,  28500, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (2, 'Leche Entera',   4,  4200,  16800, CURDATE()),
  (4, 'Arroz 1kg',     10,  4500,  45000, CURDATE());

-- Ajustar stock según ventas insertadas
UPDATE productos SET stock = stock - 5  WHERE id = 1;
UPDATE productos SET stock = stock - 2  WHERE id = 3;
UPDATE productos SET stock = stock - 1  WHERE id = 5;
UPDATE productos SET stock = stock - 3  WHERE id = 6;
UPDATE productos SET stock = stock - 4  WHERE id = 2;
UPDATE productos SET stock = stock - 10 WHERE id = 4;

-- ── Compras de ejemplo ───────────────────────────────────────
INSERT INTO compras (producto_id, producto_nombre, cantidad, costo_unitario, total, fecha) VALUES
  (2, 'Leche Entera', 50, 3200, 160000, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
  (4, 'Arroz 1kg',    80, 3500, 280000, DATE_SUB(CURDATE(), INTERVAL 3 DAY));

SELECT CONCAT('✅ Datos iniciales insertados. Productos: ', COUNT(*)) AS resultado FROM productos;
