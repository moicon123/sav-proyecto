const VITE_API_URL = import.meta.env.VITE_API_URL || '/api';
const API = VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}, retries = 1) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  
  try {
    const finalUrl = API + normalizedUrl;
    const res = await fetch(finalUrl, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      console.error(`[API Error] ${res.status} ${finalUrl}`, data);
      const error = new Error(data.error || 'Error de red');
      error.status = res.status;

      // Manejador global de errores de autenticación
      if (error.status === 401 || error.status === 404) {
        const isAuthRoute = normalizedUrl.includes('/auth/');
        if (!isAuthRoute) {
          console.warn('Redirigiendo al login por error de autenticación...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          // Detener la ejecución para evitar más errores
          return new Promise(() => {}); 
        }
      }

      throw error;
    }
    return data;
  } catch (err) {
    // No reintentar en errores de cliente (4xx)
    if (err.status >= 400 && err.status < 500) {
      throw err;
    }

    if (retries > 0 && (options.method === 'GET' || !options.method)) {
      console.warn(`Error en ${url}, reintentando... (${retries} restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return request(url, options, retries - 1);
    }
    throw err;
  }
}

export const api = {
  auth: {
    login: (telefono, password, deviceId) => request('/auth/login', { method: 'POST', body: JSON.stringify({ telefono, password, deviceId }) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    me: () => request('/users/me'),
    update: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    stats: () => request('/users/stats'),
    team: () => request('/users/team'),
    tarjetas: () => request('/users/tarjetas'),
    addTarjeta: (data) => request('/users/tarjetas', { method: 'POST', body: JSON.stringify(data) }),
    deleteTarjeta: (id) => request(`/users/tarjetas/${id}`, { method: 'DELETE' }),
    notificaciones: () => request('/users/notificaciones'),
    changePassword: (data) => request('/users/change-password', { method: 'POST', body: JSON.stringify(data) }),
    changeFundPassword: (data) => request('/users/change-fund-password', { method: 'POST', body: JSON.stringify(data) }),
  },
  tasks: {
    list: () => request('/tasks'),
    get: (id) => request(`/tasks/${id}`),
    responder: (id, respuesta) => request(`/tasks/${id}/responder`, { method: 'POST', body: JSON.stringify({ respuesta }) }),
  },
  levels: {
    list: () => request('/levels'),
    ganancias: () => request('/levels/ganancias'),
  },
  recharges: {
    metodos: () => request('/recharges/metodos'),
    list: () => request('/recharges'),
    create: (data) => request('/recharges', { method: 'POST', body: JSON.stringify(data) }),
  },
  withdrawals: {
    montos: () => request('/withdrawals/montos'),
    list: () => request('/withdrawals'),
    create: (data) => request('/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
  },
  banners: () => request('/banners'),
  publicContent: () => request('/public-content'),
  sorteo: {
    premios: () => request('/sorteo/premios'),
    historial: () => request('/sorteo/historial'),
    oportunidades: () => request('/sorteo/oportunidades'),
    girar: () => request('/sorteo/girar', { method: 'POST' }),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    usuarios: () => request('/admin/usuarios'),
    updateUsuario: (id, updates) => request(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    changePassword: (id, data) => request(`/admin/usuarios/${id}/password`, { method: 'POST', body: JSON.stringify(data) }),
    recargas: () => request('/admin/recargas'),
    retiros: () => request('/admin/retiros'),
    banners: () => request('/admin/banners'),
    crearBanner: (data) => request('/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
    eliminarBanner: (id) => request(`/admin/banners/${id}`, { method: 'DELETE' }),
    tareas: () => request('/admin/tareas'),
    crearTarea: (data) => request('/admin/tareas', { method: 'POST', body: JSON.stringify(data) }),
    actualizarTarea: (id, data) => request(`/admin/tareas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarTarea: (id) => request(`/admin/tareas/${id}`, { method: 'DELETE' }),
    aprobarRecarga: (id) => request(`/admin/recargas/${id}/aprobar`, { method: 'POST' }),
    rechazarRecarga: (id, motivo) => request(`/admin/recargas/${id}/rechazar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
    aprobarRetiro: (id) => request(`/admin/retiros/${id}/aprobar`, { method: 'POST' }),
    rechazarRetiro: (id, motivo) => request(`/admin/retiros/${id}/rechazar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
    metodosQr: () => request('/admin/metodos-qr'),
    crearMetodoQr: (data) => request('/admin/metodos-qr', { method: 'POST', body: JSON.stringify(data) }),
    actualizarMetodoQr: (id, data) => request(`/admin/metodos-qr/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarMetodoQr: (id) => request(`/admin/metodos-qr/${id}`, { method: 'DELETE' }),
    premiosRuleta: () => request('/admin/premios-ruleta'),
    crearPremioRuleta: (data) => request('/admin/premios-ruleta', { method: 'POST', body: JSON.stringify(data) }),
    actualizarPremioRuleta: (id, data) => request(`/admin/premios-ruleta/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarPremioRuleta: (id) => request(`/admin/premios-ruleta/${id}`, { method: 'DELETE' }),
    publicContent: () => request('/admin/public-content'),
    updatePublicContent: (data) => request('/admin/public-content', { method: 'PUT', body: JSON.stringify(data) }),
  },
};
