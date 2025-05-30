-- Habilitar RLS para la tabla pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para empezar desde cero
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden crear sus propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Administradores pueden ver todos los pedidos" ON pedidos;

-- Política para que los usuarios puedan ver sus propios pedidos
CREATE POLICY "Usuarios pueden ver sus propios pedidos"
ON pedidos
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    nombreusuario = (
      SELECT nombreusuario 
      FROM usuarios 
      WHERE email = auth.email()
    )
  )
);

-- Política para que los usuarios puedan crear sus propios pedidos
CREATE POLICY "Usuarios pueden crear sus propios pedidos"
ON pedidos
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    nombreusuario = (
      SELECT nombreusuario 
      FROM usuarios 
      WHERE email = auth.email()
    )
  )
);

-- Política para que los administradores puedan ver todos los pedidos
CREATE POLICY "Administradores pueden ver todos los pedidos"
ON pedidos
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM usuarios 
    WHERE email = auth.email() 
    AND rol = 'admin'
  )
); 