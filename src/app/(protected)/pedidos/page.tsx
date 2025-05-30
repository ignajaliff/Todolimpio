'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Producto {
  nombreproducto: string;
  cantidad: number;
}

interface HojaDePedido {
  productos: Producto[];
}

interface Pedido {
  id: string;
  nombreusuario: string;
  hojadepedido: HojaDePedido;
  estadopedido: string;
  fechacreacion: string;
  identificadorubicacion: string;
}

export default function MisPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const cargarPedidos = async () => {
    try {
      if (!user?.nombreusuario) return;

      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('nombreusuario', user.nombreusuario)
        .order('fechacreacion', { ascending: false });

      if (error) {
        console.error('Error detallado:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No se recibieron datos de los pedidos');
      }

      // Asegurarse de que los datos tengan el formato correcto
      const pedidosFormateados = data.map(pedido => {
        let hojadepedido;
        try {
          if (typeof pedido.hojadepedido === 'string') {
            hojadepedido = JSON.parse(pedido.hojadepedido);
          } else {
            hojadepedido = pedido.hojadepedido;
          }
        } catch (e) {
          console.error('Error al parsear hojadepedido:', e);
          hojadepedido = { productos: [] };
        }

        return {
          ...pedido,
          hojadepedido
        };
      });

      setPedidos(pedidosFormateados);
      setError(null);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    cargarPedidos();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pedidos',
          filter: `nombreusuario=eq.${user.nombreusuario}`
        }, 
        (payload) => {
          console.log('Cambio detectado:', payload);
          
          // Actualizar la lista de pedidos según el tipo de cambio
          if (payload.eventType === 'INSERT') {
            setPedidos(pedidos => [payload.new as Pedido, ...pedidos]);
          } else if (payload.eventType === 'UPDATE') {
            setPedidos(pedidos => pedidos.map(pedido => 
              pedido.id === payload.new.id ? payload.new as Pedido : pedido
            ));
          } else if (payload.eventType === 'DELETE') {
            setPedidos(pedidos => pedidos.filter(pedido => 
              pedido.id !== payload.old.id
            ));
          }
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, router]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'esperando confirmación':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pedido confirmado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pedido enviado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pedido entregado':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pedido cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center text-gray-600 bg-white p-6 rounded-lg shadow">
          No tienes pedidos realizados.
        </div>
      ) : (
        <div className="grid gap-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Fecha: {formatearFecha(pedido.fechacreacion)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID del pedido: {pedido.id}
                    </p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estadopedido)}`}>
                      {pedido.estadopedido}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Productos:</h3>
                  <div className="space-y-2">
                    {pedido.hojadepedido?.productos?.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cantidad
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {pedido.hojadepedido.productos.map((producto, index) => {
                              // Verificar si el producto tiene nombre (puede estar como nombreproducto o nombreProducto)
                              const nombreProducto = producto.nombreproducto || producto['nombreProducto'] || 'Producto sin nombre';
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {nombreProducto}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {producto.cantidad}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay productos disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 