import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Users, 
  FileText, 
  ClipboardList, 
  Gift, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight 
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { to: '/equipo', icon: Users, label: 'Informe del equipo', color: 'bg-blue-500' },
    { to: '/registro-facturacion', icon: FileText, label: 'Registro de facturación', color: 'bg-emerald-500' },
    { to: '/registro-tareas', icon: ClipboardList, label: 'Registro de tareas', color: 'bg-purple-500' },
    { to: '/sorteo', icon: Gift, label: 'Sorteo de suerte', color: 'bg-rose-500' },
    { to: '/seguridad', icon: ShieldCheck, label: 'Seguridad de la cuenta', color: 'bg-amber-500' },
    { to: '/vincular-tarjeta', icon: CreditCard, label: 'Vincular tarjeta bancaria', color: 'bg-cyan-500' },
  ];

  return (
    <Layout>
      <div className="bg-sav-primary text-white pt-8 pb-12 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sav-accent to-yellow-600 p-1 shadow-lg">
            <div className="w-full h-full rounded-xl bg-sav-primary flex items-center justify-center">
              <User className="text-sav-accent" size={40} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{user?.nombre_usuario}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-0.5 rounded-full bg-sav-accent text-sav-primary text-[10px] font-black uppercase tracking-wider shadow-sm">
                {user?.nivel_id === 'l1' ? 'Pasante' : user?.nivel_id?.toUpperCase()}
              </span>
              <span className="text-white/60 text-xs font-medium">ID: {user?.id?.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo de Tareas</p>
            <p className="text-xl font-black">{(user?.saldo_principal || 0).toFixed(2)} <span className="text-xs font-normal opacity-60">BOB</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo de Comisiones</p>
            <p className="text-xl font-black">{(user?.saldo_comisiones || 0).toFixed(2)} <span className="text-xs font-normal opacity-60">BOB</span></p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-20 space-y-4">
        <div className="bg-white rounded-[2.5rem] shadow-[0_15px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-50 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white shadow-sm group-active:scale-90 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-sav-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full py-5 rounded-[2rem] bg-rose-50 text-rose-600 font-black text-sm uppercase tracking-[0.2em] shadow-sm active:scale-[0.98] transition-all border border-rose-100"
        >
          Cerrar Sesión
        </button>
      </div>
    </Layout>
  );
}
