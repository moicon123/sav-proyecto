import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Wallet, CreditCard, Image, QrCode, Gift, Bell, Play } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { to: '/admin/recargas', icon: CreditCard, label: 'Recargas' },
    { to: '/admin/retiros', icon: Wallet, label: 'Retiros' },
    { to: '/admin/tareas', icon: Play, label: 'Tareas' },
    { to: '/admin/metodos-qr', icon: QrCode, label: 'Imágenes Recarga' },
    { to: '/admin/banners', icon: Image, label: 'Banners' },
    { to: '/admin/premios-ruleta', icon: Gift, label: 'Premios Ruleta' },
    { to: '/admin/contenido-home', icon: Bell, label: 'Contenido y horarios' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-sav-primary text-white p-4">
        <div className="flex items-center gap-2 mb-8">
          <Logo variant="header" className="h-8" />
          <span className="font-bold text-lg text-white/90">Admin</span>
        </div>
        <nav className="space-y-1">
          {menu.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t border-white/20">
          <p className="text-sm text-white/80">{user?.nombre_usuario}</p>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="mt-2 text-sm text-red-300 hover:text-red-200"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
