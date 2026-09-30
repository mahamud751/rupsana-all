import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken, setUnauthorizedHandler } from '../api/client';
import { AuthResponse, User } from '../api/types';

const TOKEN_KEY = 'rupsuhana:token';

type AuthValue = {
  ready: boolean;
  user: User | null;
  signIn: (phone: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    // Drop everything that belonged to the previous account.
    queryClient.removeQueries({ queryKey: ['me'] });
  }, [queryClient]);

  // Restore the session on launch.
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          setUser(await api<User>('/auth/me'));
        }
      } catch (e) {
        // Only forget the token if the server rejected it, not when offline.
        if ((e as { status?: number }).status === 401) {
          await signOut();
        }
      } finally {
        setReady(true);
      }
    })();
  }, [signOut]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthValue>(() => {
    const finish = async (res: AuthResponse) => {
      setAuthToken(res.accessToken);
      await AsyncStorage.setItem(TOKEN_KEY, res.accessToken);
      queryClient.removeQueries({ queryKey: ['me'] });
      setUser(res.user);
    };
    return {
      ready,
      user,
      signIn: async (phone, password) =>
        finish(
          await api<AuthResponse>('/auth/login', {
            method: 'POST',
            body: { phone, password },
          }),
        ),
      register: async input =>
        finish(
          await api<AuthResponse>('/auth/register', {
            method: 'POST',
            body: { ...input, email: input.email || undefined },
          }),
        ),
      signOut,
      setUser,
    };
  }, [ready, user, signOut, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
