import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const getDeviceId = useCallback(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }, []);

  const loadUser = useCallback(async (force = false) => {
    // Evitar múltiples llamadas simultáneas
    if (isUpdating && !force) return;
    setIsUpdating(true);

    const token = localStorage.getItem('token');
    const deviceId = getDeviceId();
    
    // Al cargar por primera vez, intentar recuperar del localStorage para evitar el flicker
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    if (!token) {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
      setIsUpdating(false);
      return;
    }
    try {
      const u = await api.users.me();
      
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      if (err.status === 401 || err.status === 404) {
        console.warn('Sesión inválida o usuario no encontrado, cerrando sesión...', err.message);
        logout();
      } else {
        console.warn('Error de red al cargar usuario, manteniendo sesión previa:', err.message);
      }
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, [getDeviceId, logout, isUpdating, user]);

  useEffect(() => {
    loadUser(true); // Carga inicial forzada
    
    // Polling inteligente: usar setTimeout en lugar de setInterval para evitar solapamientos
    let timeoutId;
    const poll = async () => {
      if (localStorage.getItem('token') && document.visibilityState === 'visible') {
        await loadUser();
      }
      timeoutId = setTimeout(poll, 30000); // Aumentado a 30s para dar margen a Render
    };

    timeoutId = setTimeout(poll, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        loadUser();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadUser]);

  const login = useCallback(async (telefono, password) => {
    const deviceId = getDeviceId();
    const { user: u, token } = await api.auth.login(telefono, password, deviceId);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  }, [getDeviceId]);

  const register = useCallback(async (data) => {
    const deviceId = getDeviceId();
    const { user: u, token } = await api.auth.register({ ...data, deviceId });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  }, [getDeviceId]);

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
