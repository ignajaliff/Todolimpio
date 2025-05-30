import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  nombreproducto: string;
  cantidad: number;
  descripcion?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const formattedItem = {
            ...item,
            nombreproducto: item.nombreproducto.toLowerCase()
          };
          
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i
              ),
            };
          }
          return { items: [...state.items, formattedItem] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, cantidad } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
); 