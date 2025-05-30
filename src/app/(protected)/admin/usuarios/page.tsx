'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: string;
  nombreusuario: string;
  email: string;
  contraseña: string;
  identificadorubicacion: string;
  rol: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Estado para el formulario de nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombreusuario: '',
    email: '',
    contraseña: '',
    identificadorubicacion: '',
    rol: 'usuario' // valor por defecto
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [creandoUsuario, setCreandoUsuario] = useState(false);

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombreusuario');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreandoUsuario(true);

      // Validaciones básicas
      if (!nuevoUsuario.nombreusuario || !nuevoUsuario.email || !nuevoUsuario.contraseña || !nuevoUsuario.identificadorubicacion) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Validar formato de email
      if (!/\S+@\S+\.\S+/.test(nuevoUsuario.email)) {
        throw new Error('El formato del email no es válido');
      }

      const { data, error } = await supabase
        .from('usuarios')
        .insert([nuevoUsuario])
        .select()
        .single();

      if (error) throw error;

      setUsuarios(prevUsuarios => [...prevUsuarios, data]);
      setMostrarFormulario(false);
      setNuevoUsuario({
        nombreusuario: '',
        email: '',
        contraseña: '',
        identificadorubicacion: '',
        rol: 'usuario'
      });
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert(error instanceof Error ? error.message : 'Error al crear el usuario');
    } finally {
      setCreandoUsuario(false);
    }
  };

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      router.push('/login');
      return;
    }

    cargarUsuarios();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('usuarios-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuarios'
        },
        (payload) => {
          console.log('Cambio detectado en usuarios:', payload);

          if (payload.eventType === 'INSERT') {
            setUsuarios(usuarios => [...usuarios, payload.new as Usuario]);
          } else if (payload.eventType === 'UPDATE') {
            setUsuarios(usuarios => usuarios.map(usuario =>
              usuario.id === payload.new.id ? payload.new as Usuario : usuario
            ));
          } else if (payload.eventType === 'DELETE') {
            setUsuarios(usuarios => usuarios.filter(usuario =>
              usuario.id !== payload.old.id
            ));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {mostrarFormulario ? 'Cancelar' : 'Agregar Usuario'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Nuevo Usuario</h2>
          <form onSubmit={crearUsuario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <input
                type="text"
                value={nuevoUsuario.nombreusuario}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombreusuario: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                value={nuevoUsuario.contraseña}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, contraseña: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Identificador de Ubicación
              </label>
              <input
                type="text"
                value={nuevoUsuario.identificadorubicacion}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, identificadorubicacion: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                value={nuevoUsuario.rol}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creandoUsuario}
                className={`${
                  creandoUsuario ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-4 py-2 rounded transition-colors flex items-center justify-center min-w-[200px]`}
              >
                {creandoUsuario ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {usuario.nombreusuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.identificadorubicacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.rol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 