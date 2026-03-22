import { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Share2, Copy, Check, Users, Gift, Star, ShieldCheck, Zap, Lock, Info, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Invite() {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLink = `${window.location.origin}/registro?ref=${user?.codigo_invitacion || ''}`;

  const handleCopyCode = () => {
    if (!user?.codigo_invitacion || user?.nivel_codigo === 'internar') return;
    navigator.clipboard.writeText(user.codigo_invitacion);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (user?.nivel_codigo === 'internar') return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (user?.nivel_codigo === 'internar') {
    return (
      <Layout>
        <Header title="Invitar Amigos" />
        <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/10 border border-indigo-100 animate-pulse">
            <Lock size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Invitación No Disponible</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
              Como <span className="text-indigo-600 font-bold uppercase tracking-widest">Pasante</span>, el sistema de referidos está desactivado para tu cuenta.
            </p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 text-left w-full">
            <p className="text-xs text-indigo-800 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info size={14} /> Beneficio VIP:
            </p>
            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
              Sube a nivel <span className="font-bold">S1</span> para activar tu código de invitación y empezar a ganar el <span className="font-bold">15% de comisión</span> por cada amigo que invites.
            </p>
          </div>
          <Link 
            to="/vip"
            className="w-full py-5 rounded-[2.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp size={16} />
            Activar Invitación Ahora
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Invitar Amigos" />
      
      <div className="p-5 space-y-8 pb-24">
        {/* Banner Principal Hero */}
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-700 to-sav-primary p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-sav-accent/20 rounded-full -ml-20 -mb-20 blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/30 shadow-inner">
              <Gift className="text-sav-accent animate-bounce" size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase">¡Comparte y Gana!</h2>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-[0.2em] opacity-80">Gana hasta un 15% de comisión</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Código y Enlace */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-50 -mt-16 relative z-20 mx-2">
          <div className="space-y-8">
            {/* Código */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Tu Código de Invitación</p>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="flex-1 text-center py-3">
                  <span className="text-3xl font-black text-sav-primary tracking-[0.3em]">{user?.codigo_invitacion || '------'}</span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className={`p-4 rounded-xl transition-all ${copiedCode ? 'bg-emerald-500 text-white' : 'bg-sav-primary text-white active:scale-90'}`}
                >
                  {copiedCode ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Enlace */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Enlace de Registro Directo</p>
              <div className="flex items-center gap-3 p-2 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="flex-1 truncate pl-4">
                  <span className="text-xs font-bold text-indigo-600/60">{inviteLink}</span>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white active:scale-90'}`}
                >
                  {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                  {copiedLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest px-2">¿Por qué invitar?</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Star, title: 'Comisiones de Tareas', desc: 'Gana un % de cada video que vean tus amigos diariamente.', color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Zap, title: 'Bonos de Nivel', desc: 'Recibe bonos instantáneos cuando tus referidos suban a VIP.', color: 'text-sav-primary', bg: 'bg-sav-primary/5' },
              { icon: ShieldCheck, title: 'Red Segura', desc: 'Construye tu propio equipo y asegura ingresos pasivos.', color: 'text-emerald-500', bg: 'bg-emerald-50' }
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl ${b.bg} ${b.color} flex items-center justify-center flex-shrink-0`}>
                  <b.icon size={24} />
                </div>
                <div>
                  <p className="font-black text-gray-800 text-sm uppercase tracking-tighter">{b.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1 font-medium">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pasos */}
        <div className="bg-sav-primary/5 rounded-[2.5rem] p-8 border-2 border-dashed border-sav-primary/10">
          <h3 className="text-center font-black text-sav-primary uppercase tracking-widest text-xs mb-6">3 Pasos para el éxito</h3>
          <div className="flex justify-between items-start gap-2">
            {[
              { n: '1', t: 'Copia' },
              { n: '2', t: 'Comparte' },
              { n: '3', t: 'Gana' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-sav-primary text-white flex items-center justify-center font-black text-sm shadow-lg shadow-sav-primary/20">
                  {s.n}
                </div>
                <p className="text-[10px] font-black text-sav-primary uppercase tracking-tighter">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
