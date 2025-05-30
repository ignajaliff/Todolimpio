'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Producto } from '@/types';
import { useCartStore } from '@/store/cartStore';

export default function NuevoPedidoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const cargarProductos = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('identificadorubicacion', user.identificadorubicacion);

        if (error) {
          console.error('Error detallado de Supabase:', error);
          throw error;
        }

        setProductos(data || []);
        const cantidadesIniciales = (data || []).reduce((acc, producto) => ({
          ...acc,
          [producto.id]: 1
        }), {});
        setCantidades(cantidadesIniciales);
      } catch (error) {
        console.error('Error completo al cargar productos:', error);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [user, router]);

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad > 0) {
      setCantidades(prev => ({
        ...prev,
        [productoId]: nuevaCantidad
      }));
    }
  };

  const agregarAlCarrito = (producto: Producto) => {
    addItem({
      id: producto.id,
      nombreproducto: producto.nombreproducto,
      cantidad: cantidades[producto.id],
      descripcion: producto.descripcion
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Productos Disponibles</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div 
            key={producto.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">
                  {producto.nombreproducto}
                </h3>
                {producto.descripcion && (
                  <p className="text-gray-600 mb-4">
                    {producto.descripcion}
                  </p>
                )}
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor={`cantidad-${producto.id}`} className="text-sm font-medium text-gray-700">
                    Cantidad:
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => actualizarCantidad(producto.id, cantidades[producto.id] - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                    >
                      -
                    </button>
                    <input
                      id={`cantidad-${producto.id}`}
                      type="number"
                      min="1"
                      value={cantidades[producto.id]}
                      onChange={(e) => actualizarCantidad(producto.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center border rounded-md py-1 px-2"
                    />
                    <button
                      onClick={() => actualizarCantidad(producto.id, cantidades[producto.id] + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📋</span>
                  <span>Agregar a hoja de pedido</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && !error && (
        <div className="text-center text-gray-600 mt-8">
          No hay productos disponibles para tu ubicación en este momento.
        </div>
      )}
    </div>
  );
} 