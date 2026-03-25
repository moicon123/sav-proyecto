import { useState, useEffect } from 'react';
import { Gift, Plus, Search, Trash2, Edit2, Star, Trophy, Sparkles } from 'lucide-react';

const mockAdminRewards = [
  { id: 1, title: 'Bono de Bienvenida', description: 'Completa tu perfil y obtén tu primer bono.', amount: 10, type: 'Automático', status: 'Activo' },
  { id: 2, title: 'Primer Depósito', description: 'Realiza tu primera recarga y duplica tus ganancias.', amount: 50, type: 'Manual', status: 'Activo' },
  { id: 3, title: 'Invitado Estrella', description: 'Invita a 5 amigos y recibe una recompensa especial.', amount: 100, type: 'Automático', status: 'Pausado' },
];

export default function AdminRecompensas() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">
            Gestión de <span className="text-indigo-600">Recompensas</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Configura los premios y beneficios para los usuarios</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95">
          <Plus size={18} />
          Nueva Recompensa
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
              <Trophy size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Premios Otorgados</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-gray-900">1,240</span>
              <span className="text-xs font-bold text-gray-400 mb-2 uppercase">BOB</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
              <Sparkles size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Usuarios Premiados</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-gray-900">458</span>
              <span className="text-xs font-bold text-gray-400 mb-2 uppercase">Personas</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
              <Star size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Campañas Activas</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-gray-900">3</span>
              <span className="text-xs font-bold text-gray-400 mb-2 uppercase">Vigentes</span>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Listado de Premios</h2>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar premio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-50 focus:border-indigo-100 focus:bg-white transition-all outline-none text-sm font-bold w-full md:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Recompensa</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockAdminRewards.map((reward) => (
                <tr key={reward.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                        <Gift size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight mb-0.5">{reward.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate max-w-[200px]">{reward.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-gray-900">{reward.amount} BOB</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      reward.type === 'Automático' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {reward.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      reward.status === 'Activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {reward.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-3 rounded-xl hover:bg-white hover:shadow-lg transition-all text-gray-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-3 rounded-xl hover:bg-white hover:shadow-lg transition-all text-gray-400 hover:text-rose-600 border border-transparent hover:border-rose-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
