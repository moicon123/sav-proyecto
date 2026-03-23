import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

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

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    const deviceId = getDeviceId();
    
    if (!token) {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }
    try {
      const u = await api.users.me();
      
      // Verificación de dispositivo único
      if (u.last_device_id && u.last_device_id !== deviceId) {
        alert('Se ha iniciado sesión en otro dispositivo. Tu sesión se cerrará en este equipo.');
        logout();
        return;
      }

      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      // Cerramos sesión si el servidor nos dice que el token no vale (401) 
      // O si el usuario ya no existe en el sistema (404), esto ocurre al reiniciar el seed del servidor
      if (err.status === 401 || err.status === 404) {
        console.warn('Sesión inválida o usuario no encontrado, cerrando sesión...', err.message);
        logout();
      } else {
        console.warn('Error de red al cargar usuario, manteniendo sesión previa:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [getDeviceId, logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (telefono, password) => {
    const deviceId = getDeviceId();
    const { user: u, token } = await api.auth.login(telefono, password, deviceId);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const deviceId = getDeviceId();
    const { user: u, token } = await api.auth.register({ ...data, deviceId });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const refreshUser = () => loadUser();

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
