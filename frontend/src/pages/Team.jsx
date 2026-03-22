import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, TrendingUp, UserPlus, ShieldAlert, ChevronRight, PieChart, Info, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Team() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.nivel_codigo !== 'internar') {
      api.users.team().then(setData).catch(() => setData(null));
    }
  }, [user]);

  const handleCopy = () => {
    if (!user?.codigo_invitacion) return;
    navigator.clipboard.writeText(user.codigo_invitacion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (user?.nivel_codigo === 'internar') {
    return (
      <Layout>
        <Header title="Informe del equipo" />
        <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/10 border border-amber-100 animate-bounce">
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Función Bloqueada</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
              Como <span className="text-amber-600 font-bold uppercase tracking-widest">Pasante</span>, aún no puedes invitar a otras personas.
            </p>
          </div>
          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 text-left">
            <p className="text-xs text-amber-800 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info size={14} /> Requisito:
            </p>
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              Sube a nivel <span className="font-bold">S1</span> o superior para desbloquear el sistema de referidos y empezar a ganar comisiones por cada tarea de tu equipo.
            </p>
          </div>
          <Link 
            to="/vip"
            className="w-full py-5 rounded-[2rem] bg-sav-primary text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
          >
            Subir de Nivel Ahora
          </Link>
        </div>
      </Layout>
    );
  }

  const resumen = data?.resumen || {};
  const niveles = data?.niveles || [];

  return (
    <Layout>
      <Header title="Mi Equipo" />
      <div className="p-5 space-y-8 pb-24">
        {/* Banner de Invitación Rápida */}
        <div className="bg-gradient-to-br from-sav-primary to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sav-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <UserPlus className="text-sav-accent" size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sav-accent/80">Invitar Amigos</p>
                <h3 className="text-xl font-black tracking-tight">Gana comisiones diarias</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-black text-sav-accent tracking-widest">{user?.codigo_invitacion || '---'}</span>
                <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white/40" />}
                </button>
              </div>
              <Link to="/usuario" className="p-4 rounded-2xl bg-sav-accent text-sav-primary active:scale-90 transition-all shadow-lg shadow-sav-accent/20">
                <ChevronRight size={24} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas de Ingresos de Equipo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-sav-accent/10 flex items-center justify-center text-sav-accent mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ganancia Total</p>
            <p className="text-xl font-black text-sav-primary">{(resumen.ingresos_totales || 0).toFixed(2)} <span className="text-[10px] text-gray-400">BOB</span></p>
          </div>
          <div className="p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
              <Users size={20} />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Miembros</p>
            <p className="text-xl font-black text-gray-800">{resumen.total_miembros || 0}</p>
          </div>
        </div>

        {/* Desglose por Niveles */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <PieChart size={20} />
            </div>
            <h3 className="font-black text-gray-800 uppercase tracking-tighter">Detalles de Red</h3>
          </div>
          
          <div className="space-y-4">
            {niveles.map((n) => (
              <div key={n.nivel} className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sav-primary text-white flex items-center justify-center text-[10px] font-black">
                      L{n.nivel}
                    </div>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">Nivel {n.nivel}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest uppercase">
                    +{n.porcentaje}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Miembros Activos</p>
                    <p className="text-sm font-black text-gray-800">{n.total_miembros}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Comisión Acum.</p>
                    <p className="text-sm font-black text-sav-primary">{(n.monto_recarga || 0).toFixed(2)} BOB</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección Informativa */}
        <div className="p-6 rounded-[2rem] bg-sav-accent/10 border-l-4 border-sav-accent">
          <p className="text-xs font-bold text-sav-primary leading-relaxed uppercase tracking-tighter flex items-center gap-2 mb-2">
            <Info size={14} className="text-sav-accent" />
            ¿Cómo funcionan las comisiones?
          </p>
          <p className="text-[10px] text-sav-primary/70 font-medium leading-relaxed">
            Recibes comisiones por cada tarea que completen tus invitados. Entre más alto sea tu nivel VIP, mayor será el porcentaje de beneficio de tu red.
          </p>
        </div>
      </div>
    </Layout>
  );
}
