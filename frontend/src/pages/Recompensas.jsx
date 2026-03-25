import { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import { Gift, Star, Trophy, ArrowRight, CheckCircle2, Sparkles, Clock } from 'lucide-react';

const mockRewards = [
  { id: 1, title: 'Bono de Bienvenida', description: 'Completa tu perfil y obtén tu primer bono.', amount: 10, status: 'completed' },
  { id: 2, title: 'Primer Depósito', description: 'Realiza tu primera recarga y duplica tus ganancias.', amount: 50, status: 'available' },
  { id: 3, title: 'Invitado Estrella', description: 'Invita a 5 amigos y recibe una recompensa especial.', amount: 100, status: 'pending' },
  { id: 4, title: 'Nivel VIP 1', description: 'Alcanza el nivel S1 para desbloquear beneficios exclusivos.', amount: 200, status: 'locked' },
];

export default function Recompensas() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f36] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pb-24">
        {/* Hero Section */}
        <div className="bg-[#1a1f36] pt-12 pb-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Trophy className="text-amber-400" size={24} />
              </div>
              <span className="text-xs font-black text-white/60 uppercase tracking-[0.3em]">Centro de Premios</span>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              Tus <span className="text-indigo-400">Recompensas</span>
            </h1>
            <p className="text-white/40 text-sm font-medium max-w-md uppercase tracking-wider leading-relaxed">
              Completa desafíos y desbloquea beneficios exclusivos diseñados para potenciar tu crecimiento.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 -mt-12 max-w-4xl mx-auto space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Ganado</span>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-[#1a1f36]">10.00</span>
                <span className="text-xs font-bold text-gray-400 mb-1.5 uppercase">BOB</span>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Disponibles</span>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-indigo-600">1</span>
                <span className="text-xs font-bold text-gray-400 mb-1.5 uppercase">Reto</span>
              </div>
            </div>
          </div>

          {/* Rewards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-[#1a1f36] uppercase tracking-[0.2em]">Desafíos Activos</h2>
              <Sparkles size={16} className="text-indigo-500 animate-pulse" />
            </div>

            {mockRewards.map((reward) => (
              <div 
                key={reward.id}
                className={`group relative overflow-hidden bg-white rounded-[2rem] p-6 border transition-all duration-300 ${
                  reward.status === 'locked' ? 'opacity-60 grayscale' : 'hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1'
                } ${reward.status === 'available' ? 'border-indigo-100 ring-1 ring-indigo-50' : 'border-gray-50'}`}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                      reward.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                      reward.status === 'available' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                      'bg-gray-50 border-gray-100 text-gray-400'
                    }`}>
                      {reward.status === 'completed' ? <CheckCircle2 size={28} /> : 
                       reward.status === 'locked' ? <Clock size={28} /> : <Gift size={28} />}
                    </div>
                    <div>
                      <h3 className="font-black text-[#1a1f36] uppercase tracking-tight text-base mb-1">{reward.title}</h3>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[200px] uppercase tracking-wide">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black block leading-none ${
                      reward.status === 'completed' ? 'text-emerald-500' : 'text-[#1a1f36]'
                    }`}>
                      +{reward.amount}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">BOB</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      reward.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      reward.status === 'available' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {reward.status === 'completed' ? 'Reclamado' :
                       reward.status === 'available' ? 'Disponible' :
                       reward.status === 'pending' ? 'En Progreso' : 'Bloqueado'}
                    </div>
                  </div>
                  
                  {reward.status === 'available' && (
                    <button className="flex items-center gap-2 bg-[#1a1f36] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors group/btn">
                      Reclamar Ahora
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Decorative background elements for available rewards */}
                {reward.status === 'available' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                )}
              </div>
            ))}
          </div>

          {/* Pro Tip Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-amber-300 fill-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tip del Experto</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2 leading-tight">
                Maximiza tus ingresos invitando
              </h3>
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider leading-relaxed mb-6 opacity-80">
                Los usuarios con más referidos desbloquean recompensas especiales cada semana. ¡No te quedes atrás!
              </p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                Ir a Invitaciones
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pb-8 text-center px-6">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            SAV Rewards • Transparencia y Crecimiento
          </p>
        </div>
      </div>
    </Layout>
  );
}
