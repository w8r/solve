import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as AuthSession from 'expo-auth-session';
import * as api from '../services/api';

type AuthState = {
  token: string;
  authenticated: boolean;
  currentUserId: string;
  loading: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
};

const AuthContext = createContext<AuthState>({} as AuthState);
