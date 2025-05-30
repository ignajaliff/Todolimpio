'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  nombreproducto: string;
  cantidad: number;
  descripcion?: string;
}

export default function CartIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.cantidad, 0);

  const confirmarPedido = async () => {
    if (items.length === 0) {
      alert('No hay productos en la hoja de pedido');
      return;
    }

    if (!user) {
      alert('Debes iniciar sesión para realizar un pedido');
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      const pedido = {
        nombreusuario: user.nombreusuario,
        hojadepedido: {
          productos: items.map(item => ({
            nombreproducto: item.nombreproducto,
            cantidad: item.cantidad
          }))
        },
        identificadorubicacion: user.identificadorubicacion,
        estadopedido: 'Esperando confirmación',
        fechacreacion: new Date().toISOString()
      };

      console.log('Datos del pedido a crear:', JSON.stringify(pedido, null, 2));

      const { data, error } = await supabase
        .from('pedidos')
        .insert([pedido])
        .select()
        .single();

      if (error) {
        console.error('Error detallado de Supabase:', error);
        throw new Error(`Error al crear el pedido: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se recibió confirmación del pedido creado');
      }

      console.log('Pedido creado exitosamente:', data);

      clearCart();
      setIsOpen(false);
      router.push('/pedidos');
      alert('Pedido creado exitosamente');
    } catch (error) {
      console.error('Error completo al crear el pedido:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al crear el pedido. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        <span>📋</span>
        <span>{totalItems} productos</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Hoja de Pedido</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                La hoja de pedido está vacía
              </p>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-auto">
                  {items.map((item: CartItem) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <h4 className="font-medium">{item.nombreproducto}</h4>
                        {item.descripcion && (
                          <p className="text-sm text-gray-500">
                            {item.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                          }
                          className="w-16 px-2 py-1 border rounded"
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={clearCart}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Vaciar hoja de pedido
                  </button>
                  <button
                    onClick={confirmarPedido}
                    disabled={isSubmitting}
                    className={`w-full ${
                      isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                    } text-white px-4 py-2 rounded transition-colors flex items-center justify-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 