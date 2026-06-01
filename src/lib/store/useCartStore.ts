import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image_url?: string;
    quantity: number;
    category: string;
    slug: string;
    stock: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            
            addItem: (newItem) => set((state) => {
                const existingItem = state.items.find(item => item.id === newItem.id);
                if (existingItem) {
                    const newQty = Math.min(existingItem.quantity + 1, newItem.stock);
                    return {
                        items: state.items.map(item => 
                            item.id === newItem.id 
                                ? { ...item, quantity: newQty }
                                : item
                        )
                    };
                }
                return { items: [...state.items, { ...newItem, quantity: 1 }] };
            }),

            removeItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),

            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(item => 
                    item.id === id 
                        ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
                        : item
                )
            })),

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'rapwuk-shop-cart', // name of the item in the storage (must be unique)
        }
    )
);
