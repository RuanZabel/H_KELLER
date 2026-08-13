import { createContext, useContext, useMemo, useState } from 'react';
import { authenticateUser } from '../utils/userStorage.js';

const AuthContext = createContext(null);

const defaultUser = {
  name: 'Equipe HK',
  email: 'equipe@helenkeller.local',
  role: 'Administrador'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hk_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(credentials) {
    const authenticated = await authenticateUser(credentials.email, credentials.password);
    if (!authenticated) return false;
    const nextUser = { name: authenticated.name, email: authenticated.login, role: authenticated.role === 'Admin' ? 'Administrador' : authenticated.role };
    localStorage.setItem('hk_user', JSON.stringify(nextUser));
    setUser(nextUser);
    return true;
  }

  function logout() {
    localStorage.removeItem('hk_user');
    setUser(null);
  }

  const value = useMemo(() => ({
    isAuthenticated: Boolean(user),
    login,
    logout,
    user
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
