import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function CambiarContrasenaFondo() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const tieneFondo = !!user?.tiene_password_fondo;
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [nueva2, setNueva2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (nueva !== nueva2) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (tieneFondo && !actual) {
      setError('Debes escribir la contraseña actual del fondo');
      return;
    }
    setLoading(true);
    try {
      const body = { password_nueva: nueva };
      if (tieneFondo) body.password_actual = actual;
      await api.users.changeFundPassword(body);
      await refreshUser?.();
      alert('Contraseña del fondo actualizada');
      navigate('/seguridad');
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Contraseña del fondo" />
      <form onSubmit={submit} className="p-4 space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-800 text-sm">{error}</div>}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm text-gray-600">
            Para retirar necesitas esta contraseña.
            {tieneFondo
              ? ' Escribe primero la contraseña actual del fondo y luego la nueva.'
              : ' Puedes crear tu primera contraseña del fondo aquí.'}
          </p>
          {tieneFondo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual del fondo</label>
              <input
                type="password"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                required
                autoComplete="current-password"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña del fondo (mín. 6)</label>
            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
            <input
              type="password"
              value={nueva2}
              onChange={(e) => setNueva2(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
              minLength={6}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-4 rounded-full bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </Layout>
  );
}
