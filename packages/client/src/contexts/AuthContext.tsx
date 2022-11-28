import React, {
  createContext,
  useState,
  useEffect,
  FC,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as api from '../services/api';
import { UserAndToken, User } from '../types/user';
import { TOKEN_KEY } from '../constants';
import { FacebookAuthUser, GoogleAuthUser } from '../types/user';

export type AuthState = {
  //token: string;
  authenticated: boolean;
  user: User;
  loading: boolean;
  loginWithGoogle: (data: GoogleAuthUser) => Promise<void>;
  loginWithFacebook: (data: FacebookAuthUser) => Promise<void>;
  onAuthSuccess: (data: UserAndToken) => void;
  login: (email: string, password: string) => Promise<UserAndToken>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({} as AuthState);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  // true, because we first try to get the stored token
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, password: string) {
    return api.login(email, password).then(
      (data: UserAndToken) => {
        onAuthSuccess(data);
        return data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  const onAuthSuccess = ({ user: userData, token }: UserAndToken) => {
    setToken(token);
    setUser(userData);
    return AsyncStorage.setItem(TOKEN_KEY, token).then(() =>
      setAuthenticated(true)
    );
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
      .catch(() => setLoading(false))
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
      } else {
        setToken(null);
        setAuthenticated(false);
        setUser(null);
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
        onAuthSuccess,
        user: user as unknown as User
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
