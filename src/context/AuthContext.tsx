'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Usuario } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para guardar el usuario en localStorage
const saveUserToStorage = (user: Usuario) => {
  try {
    localStorage.setItem('todoLimpioUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error al guardar usuario en localStorage:', error);
  }
};

// Función para obtener el usuario de localStorage
const getUserFromStorage = (): Usuario | null => {
  try {
    const userStr = localStorage.getItem('todoLimpioUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error al obtener usuario de localStorage:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = getUserFromStorage();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Validar entrada
      if (!email || !password) {
        throw new Error('Por favor, ingresa email y contraseña');
      }

      // Verificar si el usuario existe
      const { data: usuarios, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          throw new Error('Usuario no encontrado');
        }
        console.error('Error al buscar usuario:', userError);
        throw new Error('Error al verificar credenciales');
      }

      if (!usuarios) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar la contraseña
      if (usuarios.contraseña !== password) {
        throw new Error('Contraseña incorrecta');
      }

      // Guardar usuario en localStorage y estado
      saveUserToStorage(usuarios);
      setUser(usuarios);

      console.log('Inicio de sesión exitoso:', usuarios);

      if (usuarios.rol === 'admin') {
        router.push('/admin/pedidos');
      } else {
        router.push('/pedidos/nuevo');
      }
    } catch (error) {
      console.error('Error en login:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Error desconocido al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('todoLimpioUser');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
} 