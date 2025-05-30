import { create } from 'zustand';

interface ProductInCart {
  id: string;
  nombreProducto: string;
  cantidad: number;
  descripcion?: string;
}

interface CartStore {
  items: ProductInCart[];
  addItem: (product: ProductInCart) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, cantidad: item.cantidad + product.cantidad }
              : item
          ),
        };
      }
      return { items: [...state.items, product] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),
  updateQuantity: (productId, cantidad) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, cantidad } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
})); 