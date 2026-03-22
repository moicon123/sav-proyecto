import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Copy, Settings, Bookmark } from 'lucide-react';
import Logo from '../components/Logo';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.users.stats().then(setStats).catch(() => setStats({}));
  }, []);

  const copyCode = () => {
    if (user?.codigo_invitacion) {
      navigator.clipboard.writeText(user.codigo_invitacion);
    }
  };

  const s = stats || {};
  const activos = (s.activos_totales ?? user?.saldo_principal ?? 0) + (user?.saldo_comisiones ?? 0);

  return (
    <Layout>
      <Header title="Usuario" />
      <div className="bg-sav-primary/90 text-white p-6 rounded-b-3xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Logo variant="header" className="h-12" />
          </div>
          <div>
            <p className="text-white/80 text-sm">{user?.telefono?.slice(-6).padStart(10, '*')}</p>
            {user?.nivel_id !== 'l1' && (
              <p className="flex items-center gap-2 text-sm">
                Código de invitación
                <button onClick={copyCode} className="flex items-center gap-1 font-mono bg-white/20 px-2 py-1 rounded">
                  {user?.codigo_invitacion}
                  <Copy size={14} />
                </button>
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 p-4 rounded-2xl bg-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/90">Activos totales (BOB)</span>
            <span className="text-2xl font-bold">{activos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/80">Nivel actual</span>
            <span className="font-medium capitalize">{user?.nivel || 'pasante'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link to="/recargar" className="py-2.5 rounded-xl bg-sav-success text-sav-primary font-medium text-center">
              Recargar
            </Link>
            <Link to="/retiro" className="py-2.5 rounded-xl bg-sav-success text-sav-primary font-medium text-center">
              Retirada
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Ingresos de ayer', s.ingresos_ayer],
            ['Ingresos de hoy', s.ingresos_hoy],
            ['Ingresos de esta semana', s.ingresos_semana],
            ['Ingresos de este mes', s.ingresos_mes],
            ['Ingresos totales', s.ingresos_totales],
            ['Comisión subordinados', s.comision_subordinados],
            ['Recompensa invitación', s.recompensa_invitacion],
          ].map(([label, val]) => (
            <div key={label} className="p-4 rounded-2xl bg-sav-success/50 border border-sav-success/50">
              <p className="font-bold text-gray-800">{(val ?? 0).toFixed(2)}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-sav-success/30 border border-sav-success/50">
          <p className="font-medium text-orange-600">Recibe un bono aleatorio con un código</p>
          <p className="text-sm text-gray-600">Introduce el código para recibir un bono aleatorio</p>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Link
            to="/seguridad"
            className="flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Settings className="text-gray-600" size={22} />
              <span className="font-medium">Seguridad de la Cuenta</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
          <Link
            to="/registro-tareas"
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="text-gray-600" size={22} />
              <span className="font-medium">Registro de tareas</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="mt-6 block w-full text-center text-xs text-gray-500 hover:text-gray-700"
        >
          cerrar sesion
        </button>
      </div>
    </Layout>
  );
}
