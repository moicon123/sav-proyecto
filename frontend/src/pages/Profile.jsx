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
  ChevronRight, 
  UploadCloud,
  TrendingUp
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { to: '/vip', icon: TrendingUp, label: 'Subir de Nivel VIP', color: 'bg-sav-accent', isHot: true },
    { to: '/recargar', icon: UploadCloud, label: 'Subir Comprobante de Pago', color: 'bg-indigo-600' },
    { to: '/equipo', icon: Users, label: 'Informe del equipo', color: 'bg-blue-500' },
    { to: '/registro-facturacion', icon: FileText, label: 'Registro de facturación', color: 'bg-emerald-500' },
    { to: '/registro-tareas', icon: ClipboardList, label: 'Registro de tareas', color: 'bg-purple-500' },
    { to: '/sorteo', icon: Gift, label: 'Sorteo de suerte', color: 'bg-rose-500' },
    { to: '/seguridad', icon: ShieldCheck, label: 'Seguridad de la cuenta', color: 'bg-amber-500' },
    { to: '/vincular-tarjeta', icon: CreditCard, label: 'Vincular tarjeta bancaria', color: 'bg-cyan-500' },
  ];

  return (
    <Layout>
      <div className="bg-sav-primary text-white pt-8 pb-14 px-6 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sav-accent/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-sav-accent to-yellow-600 p-1 shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full rounded-[1.4rem] bg-sav-primary flex items-center justify-center">
              <User className="text-sav-accent" size={44} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">{user?.nombre_usuario}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-sav-accent text-sav-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
                {user?.nivel_codigo === 'internar' ? 'Pasante' : user?.nivel_codigo || user?.nivel}
              </span>
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">ID: {user?.id?.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-inner">
            <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Saldo Tareas</p>
            <p className="text-2xl font-black">{(user?.saldo_principal || 0).toFixed(2)} <span className="text-xs font-medium opacity-40">BOB</span></p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-inner">
            <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Comisiones</p>
            <p className="text-2xl font-black">{(user?.saldo_comisiones || 0).toFixed(2)} <span className="text-xs font-medium opacity-40">BOB</span></p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20 space-y-6 pb-10">
        <Link 
          to="/recargar"
          className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[2.5rem] text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-[0.97] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <UploadCloud size={28} className="animate-bounce" />
            </div>
            <div>
              <p className="font-black text-lg leading-tight uppercase tracking-tighter">Subir Comprobante</p>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Reportar pago realizado</p>
            </div>
          </div>
          <ChevronRight size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>

        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-50 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {menuItems.filter(i => !i.isHot).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between p-6 hover:bg-gray-50 active:bg-gray-100 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)] group-active:scale-90 transition-transform`}>
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-black text-gray-700 uppercase tracking-tighter">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-sav-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if(confirm('¿Cerrar sesión?')) { logout(); navigate('/login'); } }}
          className="w-full py-6 rounded-[2.5rem] bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-[0.3em] shadow-sm active:scale-[0.98] transition-all border border-rose-100 mb-4"
        >
          Cerrar Sesión Segura
        </button>
      </div>
    </Layout>
  );
}
