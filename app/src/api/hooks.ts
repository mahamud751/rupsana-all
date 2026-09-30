import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from './client';
import {
  Address,
  AddressInput,
  Appointment,
  Availability,
  Banner,
  CartLine,
  Category,
  DeliveryArea,
  Faq,
  Notice,
  Order,
  Paginated,
  PaymentMethod,
  Product,
  ProductDetail,
  Quote,
  Service,
  Settings,
  User,
  Wishlist,
} from './types';
import { useAuth } from '../context/AuthContext';

// Everything under ['me', ...] belongs to the signed-in user and is cleared
// on sign-out.

// ---------- Public catalog ----------

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: () => api<Settings>('/settings'),
    staleTime: 10 * 60_000,
  });

export const useFaqs = () =>
  useQuery({ queryKey: ['faqs'], queryFn: () => api<Faq[]>('/faqs') });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/categories'),
    staleTime: 5 * 60_000,
  });

export const useBanners = () =>
  useQuery({ queryKey: ['banners'], queryFn: () => api<Banner[]>('/banners') });

export type ProductFilters = {
  category?: string;
  q?: string;
  bestseller?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
};

export const useProducts = (filters: ProductFilters, enabled = true) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      api<Paginated<Product>>('/products', {
        query: { ...filters, limit: 100 },
      }),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useProduct = (idOrSlug: string) =>
  useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => api<ProductDetail>(`/products/${idOrSlug}`),
  });

export const useServices = () =>
  useQuery({
    queryKey: ['services'],
    queryFn: () => api<Service[]>('/services'),
  });

export const useAvailability = (date: string) =>
  useQuery({
    queryKey: ['availability', date],
    queryFn: () =>
      api<Availability>('/appointments/availability', { query: { date } }),
  });

export const useQuote = (
  items: CartLine[],
  area: DeliveryArea,
  promoCode: string | undefined,
) =>
  useQuery({
    queryKey: ['quote', items, area, promoCode],
    queryFn: () =>
      api<Quote>('/orders/quote', {
        method: 'POST',
        body: { items, area, promoCode },
      }),
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
  });

// ---------- Signed-in user ----------

export const useOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'orders'],
    queryFn: () => api<Order[]>('/orders'),
    enabled: !!user,
  });
};

export const useOrder = (id: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'order', id],
    queryFn: () => api<Order>(`/orders/${id}`),
    enabled: !!user,
  });
};

export const useAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'appointments'],
    queryFn: () => api<Appointment[]>('/appointments'),
    enabled: !!user,
  });
};

export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'notifications'],
    queryFn: () => api<Notice[]>('/notifications'),
    enabled: !!user,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'unread'],
    queryFn: () => api<{ unread: number }>('/notifications/unread-count'),
    enabled: !!user,
    refetchInterval: 60_000,
  });
};

export const useAddresses = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'addresses'],
    queryFn: () => api<Address[]>('/addresses'),
    enabled: !!user,
  });
};

export const useWishlist = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'wishlist'],
    queryFn: () => api<Wishlist>('/wishlist'),
    enabled: !!user,
  });
};

// ---------- Mutations ----------

/** Runs an action if signed in, otherwise opens the Sign In screen. */
export const useRequireAuth = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  return (action: () => void) => {
    if (user) {
      action();
    } else {
      navigation.navigate('SignIn');
    }
  };
};

export const useToggleWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, liked }: { productId: string; liked: boolean }) =>
      api<Wishlist>(`/wishlist/${productId}`, {
        method: liked ? 'DELETE' : 'PUT',
      }),
    // Flip the heart immediately; roll back if the request fails.
    onMutate: async ({ productId, liked }) => {
      await qc.cancelQueries({ queryKey: ['me', 'wishlist'] });
      const previous = qc.getQueryData<Wishlist>(['me', 'wishlist']);
      if (previous) {
        qc.setQueryData<Wishlist>(['me', 'wishlist'], {
          ...previous,
          productIds: liked
            ? previous.productIds.filter(id => id !== productId)
            : [...previous.productIds, productId],
        });
      }
      return { previous };
    },
    onError: (_e, _v, ctx) =>
      ctx?.previous && qc.setQueryData(['me', 'wishlist'], ctx.previous),
    onSuccess: data => qc.setQueryData(['me', 'wishlist'], data),
  });
};

export type PlaceOrderInput = {
  items: CartLine[];
  address: AddressInput;
  saveAddress: boolean;
  paymentMethod: PaymentMethod;
  bkashTrxId?: string;
  promoCode?: string;
};

export const usePlaceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) =>
      api<Order>('/orders', { method: 'POST', body: input }),
    onSuccess: order => {
      qc.setQueryData(['me', 'order', order.id], order);
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
    onSuccess: order => {
      qc.setQueryData(['me', 'order', order.id], order);
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useBookAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      serviceId: string;
      date: string;
      slot: string;
      name: string;
      phone: string;
      note?: string;
    }) => api<Appointment>('/appointments', { method: 'POST', body: input }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useCancelAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<Appointment>(`/appointments/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useMarkNoticesRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ unread: number }>('/notifications/read-all', { method: 'POST' }),
    onSuccess: data => qc.setQueryData(['me', 'unread'], data),
  });
};

export const useUpdateProfile = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (input: { name: string; email: string }) =>
      api<User>('/auth/me', { method: 'PATCH', body: input }),
    onSuccess: setUser,
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api('/auth/me/password', { method: 'PATCH', body: input }),
  });

export const useSaveAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: Partial<AddressInput> & { id?: string; isDefault?: boolean }) =>
      id
        ? api<Address>(`/addresses/${id}`, { method: 'PATCH', body: input })
        : api<Address>('/addresses', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me', 'addresses'] }),
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/addresses/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me', 'addresses'] }),
  });
};
