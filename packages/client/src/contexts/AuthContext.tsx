import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
  FC
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as AuthSession from 'expo-auth-session';
import * as api from '../services/api';
import { TOKEN_KEY } from '../constants';
import { FacebookAuthUser, GoogleAuthUser } from '../types/user';

export type AuthState = {
  //token: string;
  authenticated: boolean;
  user: User;
  loading: boolean;
  loginWithGoogle: (data: GoogleAuthUser) => Promise<void>;
  loginWithFacebook: (data: FacebookAuthUser) => Promise<void>;
  login: (email: string, password: string) => void;
  logout: () => void;
};

export type User = {
  name: string;
  email: string;
  uuid: string;
  token?: string;
};

export const AuthContext = createContext<AuthState>({} as AuthState);

export const AuthProvider: FC<{ value?: AuthState }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, password: string) {
    return api.login(email, password).then(
      (user: User) => {
        setToken(user.token as string);
        return user;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  const onAuthSuccess = (user: User) => {
    const token = user.token as string;
    setToken(token);
    setAuthenticated(true);
    setUser(user);
    return AsyncStorage.setItem(TOKEN_KEY, token);
  };

  const loginWithFacebook = (data: FacebookAuthUser) =>
    api
      .facebookAuth(data)
      .then(onAuthSuccess)
      .then(() => setLoading(false));

  const loginWithGoogle = (data: GoogleAuthUser) =>
    api
      .googleAuth(data)
      .then(onAuthSuccess)
      .then(() => setLoading(false));

  const logout = () => {
    setToken(null);
    setAuthenticated(false);
    setUser(null);
    return AsyncStorage.removeItem(TOKEN_KEY);
  };

  useEffect(() => {
    async function loadStorageData() {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        setLoading(true);
        const resp = await api.status();
        setToken(token);
        setAuthenticated(true);
        setUser(resp as User);
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        authenticated,
        loginWithFacebook,
        loginWithGoogle,
        logout,
        loading,
        user: user as unknown as User
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
