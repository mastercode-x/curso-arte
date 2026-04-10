-- 1. Eliminar solicitudes de prueba
DELETE FROM solicitudes_acceso
WHERE email NOT IN ('cristophergonzalezok@gmail.com', 'profesor@poetica.com');

-- 2. Eliminar pagos de usuarios de prueba
DELETE FROM pagos
WHERE estudiante_id IN (
  SELECT e.id FROM estudiantes e
  JOIN users u ON e.user_id = u.id
  WHERE u.email NOT IN ('cristophergonzalezok@gmail.com', 'profesor@poetica.com')
);

-- 3. Eliminar progreso de usuarios de prueba
DELETE FROM progreso_estudiante
WHERE estudiante_id IN (
  SELECT e.id FROM estudiantes e
  JOIN users u ON e.user_id = u.id
  WHERE u.email NOT IN ('cristophergonzalezok@gmail.com', 'profesor@poetica.com')
);

-- 4. Eliminar estudiantes de prueba
DELETE FROM estudiantes
WHERE user_id IN (
  SELECT id FROM users
  WHERE email NOT IN ('cristophergonzalezok@gmail.com', 'profesor@poetica.com')
);

-- 5. Eliminar usuarios de prueba
DELETE FROM users
WHERE email NOT IN ('cristophergonzalezok@gmail.com', 'profesor@poetica.com');