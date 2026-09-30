import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProduct, Product } from '../data';
import { DeliveryArea } from '../config';
import { newId } from '../utils';

export type CartItem = { product: Product; quantity: number };

export type Profile = { name: string; phone: string; email: string };

export type Address = {
  fullName: string;
  phone: string;
  area: DeliveryArea;
  city: string;
  line: string;
  note: string;
};

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  productId: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
};

export type PaymentMethod = 'cod' | 'bkash';

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  address: Address;
  payment: { method: PaymentMethod; trxId?: string };
  status: OrderStatus;
};

export type Appointment = {
  id: string;
  createdAt: string;
  serviceName: string;
  price: number;
  date: string;
  slot: string;
  name: string;
  phone: string;
  status: 'requested' | 'cancelled';
};

export type Notice = {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  read: boolean;
};

type PersistedState = {
  cart: { productId: string; quantity: number }[];
  wishlist: string[];
  orders: Order[];
  appointments: Appointment[];
  profile: Profile | null;
  address: Address | null;
  notices: Notice[];
};

const STORAGE_KEY = 'rupsuhana:store:v1';

const welcomeNotices = (): Notice[] => [
  {
    id: 'welcome',
    createdAt: new Date().toISOString(),
    title: 'Welcome to Rupsuhana ✨',
    body: 'Discover bridal jewellery, makeup and more — delivered across Bangladesh.',
    read: false,
  },
  {
    id: 'promo-bride10',
    createdAt: new Date().toISOString(),
    title: 'Bridal offer: 10% off',
    body: 'Use code BRIDE10 at checkout to get 10% off your order.',
    read: false,
  },
];

const initialState = (): PersistedState => ({
  cart: [],
  wishlist: [],
  orders: [],
  appointments: [],
  profile: null,
  address: null,
  notices: welcomeNotices(),
});

type NewOrder = Omit<Order, 'id' | 'createdAt' | 'status' | 'items'>;
type NewAppointment = Omit<Appointment, 'id' | 'createdAt' | 'status'>;

type StoreValue = {
  hydrated: boolean;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  wishlist: string[];
  orders: Order[];
  appointments: Appointment[];
  profile: Profile | null;
  address: Address | null;
  notices: Notice[];
  unreadCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  placeOrder: (order: NewOrder) => Order;
  cancelOrder: (orderId: string) => void;
  addAppointment: (appointment: NewAppointment) => Appointment;
  cancelAppointment: (id: string) => void;
  saveProfile: (profile: Profile) => void;
  saveAddress: (address: Address) => void;
  signOut: () => void;
  markNoticesRead: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Load saved data once on launch.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) {
          setState({ ...initialState(), ...JSON.parse(raw) });
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Save after every change (only once loading has finished, so the empty
  // initial state never overwrites saved data).
  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, hydrated]);

  const update = useCallback(
    (fn: (s: PersistedState) => Partial<PersistedState>) =>
      setState(s => ({ ...s, ...fn(s) })),
    [],
  );

  const addNotice = (s: PersistedState, title: string, body: string) => [
    {
      id: newId('N'),
      createdAt: new Date().toISOString(),
      title,
      body,
      read: false,
    },
    ...s.notices,
  ];

  const value = useMemo<StoreValue>(() => {
    const cart = state.cart
      .map(i => ({ product: getProduct(i.productId), quantity: i.quantity }))
      .filter((i): i is CartItem => !!i.product);

    return {
      hydrated,
      cart,
      cartCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      cartTotal: cart.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
      wishlist: state.wishlist,
      orders: state.orders,
      appointments: state.appointments,
      profile: state.profile,
      address: state.address,
      notices: state.notices,
      unreadCount: state.notices.filter(n => !n.read).length,

      addToCart: (product, quantity = 1) =>
        update(s => {
          const existing = s.cart.find(i => i.productId === product.id);
          return {
            cart: existing
              ? s.cart.map(i =>
                  i.productId === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i,
                )
              : [...s.cart, { productId: product.id, quantity }],
          };
        }),

      updateQuantity: (productId, delta) =>
        update(s => ({
          cart: s.cart
            .map(i =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + delta }
                : i,
            )
            .filter(i => i.quantity > 0),
        })),

      removeFromCart: productId =>
        update(s => ({ cart: s.cart.filter(i => i.productId !== productId) })),

      toggleWishlist: productId =>
        update(s => ({
          wishlist: s.wishlist.includes(productId)
            ? s.wishlist.filter(id => id !== productId)
            : [...s.wishlist, productId],
        })),

      isWishlisted: productId => state.wishlist.includes(productId),

      placeOrder: input => {
        const order: Order = {
          ...input,
          id: newId('RS'),
          createdAt: new Date().toISOString(),
          status: 'placed',
          items: cart.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            subtitle: i.product.subtitle,
            price: i.product.price,
            quantity: i.quantity,
          })),
        };
        update(s => ({
          orders: [order, ...s.orders],
          cart: [],
          notices: addNotice(
            s,
            'Order placed',
            `Your order #${order.id} has been placed. We'll call you to confirm.`,
          ),
        }));
        return order;
      },

      cancelOrder: orderId =>
        update(s => ({
          orders: s.orders.map(o =>
            o.id === orderId ? { ...o, status: 'cancelled' } : o,
          ),
          notices: addNotice(
            s,
            'Order cancelled',
            `Your order #${orderId} has been cancelled.`,
          ),
        })),

      addAppointment: input => {
        const appointment: Appointment = {
          ...input,
          id: newId('AP'),
          createdAt: new Date().toISOString(),
          status: 'requested',
        };
        update(s => ({
          appointments: [appointment, ...s.appointments],
          notices: addNotice(
            s,
            'Appointment requested',
            `${appointment.serviceName} at ${appointment.slot}. Our team will call you to confirm.`,
          ),
        }));
        return appointment;
      },

      cancelAppointment: id =>
        update(s => ({
          appointments: s.appointments.map(a =>
            a.id === id ? { ...a, status: 'cancelled' } : a,
          ),
        })),

      saveProfile: profile => update(() => ({ profile })),
      saveAddress: address => update(() => ({ address })),
      signOut: () => update(() => ({ profile: null, address: null })),
      markNoticesRead: () =>
        update(s => ({ notices: s.notices.map(n => ({ ...n, read: true })) })),
    };
  }, [state, hydrated, update]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
