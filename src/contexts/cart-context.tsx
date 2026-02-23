"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";

export type CartItem = {
    productId: number;
    slug: string;
    name: string;
    price: number;
    image: string | null;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
};

const CART_STORAGE_KEY = "sierra_cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setItems(loadCart());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) saveCart(items);
    }, [items, mounted]);

    const addItem = useCallback(
        (item: Omit<CartItem, "quantity">, quantity = 1) => {
            setItems((prev) => {
                const existing = prev.find((i) => i.productId === item.productId);
                if (existing) {
                    return prev.map((i) =>
                        i.productId === item.productId
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    );
                }
                return [...prev, { ...item, quantity }];
            });
        },
        []
    );

    const removeItem = useCallback((productId: number) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        setItems((prev) =>
            prev
                .map((i) => (i.productId === productId ? { ...i, quantity } : i))
                .filter((i) => i.quantity > 0)
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                itemCount,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
