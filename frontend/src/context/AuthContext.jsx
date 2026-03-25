import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isUpdatingRef = useRef(false);

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
    // Evitar múltiples llamadas simultáneas usando un ref
    if (isUpdatingRef.current && !force) return;
    
    // Si no es forzado, evitar llamadas demasiado frecuentes (ej: render loops)
    const lastUpdate = localStorage.getItem('lastUserUpdate');
    const now = Date.now();
    if (!force && lastUpdate && now - parseInt(lastUpdate) < 2000) {
      return;
    }

    isUpdatingRef.current = true;
    localStorage.setItem('lastUserUpdate', now.toString());
    
    const token = localStorage.getItem('token');
    const deviceId = getDeviceId();
    
    // Al cargar por primera vez, intentar recuperar del localStorage para evitar el flicker
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    if (!token) {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
      isUpdatingRef.current = false;
      return;
    }

    try {
      console.log(`[Auth] Solicitando /me... (Forzado: ${force})`);
      const u = await api.users.me();
      
      if (u && typeof u === 'object') {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      }
    } catch (err) {
      if (err.status === 401 || err.status === 404) {
        console.warn('Sesión inválida o usuario no encontrado, cerrando sesión...', err.message);
        logout();
      } else {
        console.warn('Error de red al cargar usuario, manteniendo sesión previa:', err.message);
      }
    } finally {
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, [getDeviceId, logout, user]);

  useEffect(() => {
    // Carga inicial solo si no tenemos usuario o ha pasado tiempo
    const lastUpdate = localStorage.getItem('lastUserUpdate');
    const now = Date.now();
    if (!user || !lastUpdate || now - parseInt(lastUpdate) > 5000) {
      loadUser(true);
    }
    
    // Polling inteligente: usar setTimeout en lugar de setInterval para evitar solapamientos
    let timeoutId;
    const poll = async () => {
      if (localStorage.getItem('token') && document.visibilityState === 'visible') {
        await loadUser();
      }
      timeoutId = setTimeout(poll, 30000); // 30s es suficiente para polling
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
  }, [loadUser, user]);

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
