'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const CartIndicator = dynamic(() => import('./CartIndicator'), {
  ssr: false,
  loading: () => null
});

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.rol === 'admin';
  
  const navigation = isAdmin
    ? [
        { name: 'Administración de Pedidos', href: '/admin/pedidos' },
        { name: 'Administración de Usuarios', href: '/admin/usuarios' },
      ]
    : [
        { name: 'Hacer Pedido', href: '/pedidos/nuevo' },
        { name: 'Mis Pedidos', href: '/pedidos' },
      ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">TodoLimpio</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {!isAdmin && <CartIndicator />}
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.nombreusuario}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 