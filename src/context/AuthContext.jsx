import { createContext, useContext, useMemo, useState } from 'react';

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

  function login(credentials) {
    const nextUser = {
      ...defaultUser,
      email: credentials.email || defaultUser.email
    };
    localStorage.setItem('hk_user', JSON.stringify(nextUser));
    setUser(nextUser);
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
