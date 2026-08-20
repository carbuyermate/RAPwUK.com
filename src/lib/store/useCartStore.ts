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
    // Ticket tier info (optional)
    ticket_tier_id?: string;
    ticket_tier_name?: string;
}

// Unique cart key: combines product id + tier id (so you can have VIP + General Admission in same cart)
export function getCartKey(id: string, ticket_tier_id?: string): string {
    return ticket_tier_id ? `${id}::${ticket_tier_id}` : id;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (cartKey: string) => void;
    updateQuantity: (cartKey: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            
            addItem: (newItem) => set((state) => {
                const cartKey = getCartKey(newItem.id, newItem.ticket_tier_id);
                const existingItem = state.items.find(item => 
                    getCartKey(item.id, item.ticket_tier_id) === cartKey
                );
                if (existingItem) {
                    const newQty = Math.min(existingItem.quantity + 1, newItem.stock);
                    return {
                        items: state.items.map(item => 
                            getCartKey(item.id, item.ticket_tier_id) === cartKey
                                ? { ...item, quantity: newQty }
                                : item
                        )
                    };
                }
                return { items: [...state.items, { ...newItem, quantity: 1 }] };
            }),

            removeItem: (cartKey) => set((state) => ({
                items: state.items.filter(item => getCartKey(item.id, item.ticket_tier_id) !== cartKey)
            })),

            updateQuantity: (cartKey, quantity) => set((state) => ({
                items: state.items.map(item => 
                    getCartKey(item.id, item.ticket_tier_id) === cartKey
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
