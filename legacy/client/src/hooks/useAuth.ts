import { useContext } from 'react';

import { AuthContext, AuthState } from '../contexts/AuthContext';

export const useAuth = () => useContext<AuthState>(AuthContext);
