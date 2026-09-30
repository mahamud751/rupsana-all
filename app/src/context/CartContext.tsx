import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../api/types';

/**
 * The bag lives on the device (like most shops) and is priced by the server
 * at checkout, so prices and stock are always current when ordering.
 */
export type CartItem = {
  productId: string;
  name: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

const CART_KEY = 'rupsuhana:cart:v2';

type CartValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number) => void;
  change: (productId: string, delta: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Refresh stored names/prices from a server quote */
  sync: (
    lines: {
      productId: string;
      price: number;
      name: string;
      subtitle: string;
      imageUrl: string;
    }[],
  ) => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then(raw => raw && setItems(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
    }
  }, [items, loaded]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.price, 0),
      add: (product, quantity = 1) =>
        setItems(prev => {
          const existing = prev.find(i => i.productId === product.id);
          if (existing) {
            return prev.map(i =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            );
          }
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              subtitle: product.subtitle,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity,
            },
          ];
        }),
      change: (productId, delta) =>
        setItems(prev =>
          prev
            .map(i =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + delta }
                : i,
            )
            .filter(i => i.quantity > 0),
        ),
      remove: productId =>
        setItems(prev => prev.filter(i => i.productId !== productId)),
      clear: () => setItems([]),
      sync: lines =>
        setItems(prev => {
          let changed = false;
          const next = prev.map(i => {
            const l = lines.find(x => x.productId === i.productId);
            if (!l?.name || (l.price === i.price && l.name === i.name)) {
              return i;
            }
            changed = true;
            return {
              ...i,
              price: l.price,
              name: l.name,
              subtitle: l.subtitle,
              imageUrl: l.imageUrl,
            };
          });
          return changed ? next : prev;
        }),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
