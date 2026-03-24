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
    variantId: number;
    slug: string;
    name: string;
    price: number;
    image: string | null;
    quantity: number;
};

function lineKey(productId: number, variantId: number) {
    return `${productId}:${variantId}`;
}

type CartContextValue = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (productId: number, variantId: number) => void;
    updateQuantity: (
        productId: number,
        variantId: number,
        quantity: number,
    ) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
};

const CART_STORAGE_KEY = "sierra_cart";

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCartItem(raw: unknown): CartItem | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const productId = Number(o.productId);
    const quantity = Number(o.quantity);
    const variantId = Number(o.variantId);
    if (
        !Number.isFinite(productId) ||
        !Number.isFinite(quantity) ||
        quantity < 1
    ) {
        return null;
    }
    if (!Number.isFinite(variantId)) return null;
    const slug = typeof o.slug === "string" ? o.slug : "";
    const name = typeof o.name === "string" ? o.name : "";
    const price = Number(o.price);
    const image = o.image === null || typeof o.image === "string" ? o.image : null;
    if (!Number.isFinite(price)) return null;
    return {
        productId,
        variantId,
        slug,
        name,
        price,
        image,
        quantity,
    };
}

function loadCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map(normalizeCartItem)
            .filter(Boolean) as CartItem[];
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
        // Hydrate after mount so server HTML (empty cart) matches first client paint.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional SSR/client cart sync
        setItems(loadCart());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) saveCart(items);
    }, [items, mounted]);

    const addItem = useCallback(
        (item: Omit<CartItem, "quantity">, quantity = 1) => {
            setItems((prev) => {
                const k = lineKey(item.productId, item.variantId);
                const existing = prev.find(
                    (i) => lineKey(i.productId, i.variantId) === k,
                );
                if (existing) {
                    return prev.map((i) =>
                        lineKey(i.productId, i.variantId) === k
                            ? { ...i, quantity: i.quantity + quantity }
                            : i,
                    );
                }
                return [...prev, { ...item, quantity }];
            });
        },
        [],
    );

    const removeItem = useCallback((productId: number, variantId: number) => {
        setItems((prev) =>
            prev.filter(
                (i) => lineKey(i.productId, i.variantId) !== lineKey(productId, variantId),
            ),
        );
    }, []);

    const updateQuantity = useCallback(
        (productId: number, variantId: number, quantity: number) => {
            setItems((prev) =>
                prev
                    .map((i) =>
                        lineKey(i.productId, i.variantId) ===
                        lineKey(productId, variantId)
                            ? { ...i, quantity }
                            : i,
                    )
                    .filter((i) => i.quantity > 0),
            );
        },
        [],
    );

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
