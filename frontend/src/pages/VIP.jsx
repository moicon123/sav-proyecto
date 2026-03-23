import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Crown, CheckCircle2, Lock } from 'lucide-react';

export default function VIP() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [niveles, setNiveles] = useState([]);

  useEffect(() => {
    api.levels.list().then(setNiveles).catch(() => []);
  }, []);

  const handleUpgrade = (nivel) => {
    // Redirigir a recarga con el monto y modo pre-configurados
    navigate('/recargar', {
      state: {
        monto: nivel.deposito || nivel.costo,
        modo: 'Compra VIP',
        nivelId: nivel.id,
        nivelNombre: nivel.nombre
      }
    });
  };

  // Función para determinar si un nivel es superior al actual
  const esNivelSuperior = (nivel) => {
    const currentNivel = niveles.find(n => n.id === user?.nivel_id);
    if (!currentNivel) return true; // Si no hay nivel, permitir subir a cualquiera
    return (nivel.orden || 0) > (currentNivel.orden || 0);
  };

  return (
    <Layout>
      <Header title="Centro VIP" />
      <div className="p-5 space-y-6 pb-24 bg-gray-50/30 min-h-screen relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-40 -left-20 w-64 h-64 bg-[#1a1f36]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Hero VIP con Estilo Premium */}
        <div className="bg-gradient-to-br from-[#1a1f36] to-[#2a2f46] text-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-15px_rgba(26,31,54,0.4)] relative overflow-hidden text-center border border-white/10 group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border-2 border-white/30 shadow-2xl relative z-10">
                <Crown className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" size={40} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Tu Estatus Actual</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-xl">
              {user?.nivel_codigo === 'internar' ? 'PASANTE' : user?.nivel_codigo || user?.nivel}
            </h2>
            <div className="mt-4 w-12 h-1 bg-[#00C853] rounded-full shadow-[0_0_10px_#00C853]" />
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-1.5 bg-[#1a1f36] h-5 rounded-full shadow-[0_0_10px_rgba(26,31,54,0.3)]" />
            <h3 className="text-xs font-black text-[#1a1f36] uppercase tracking-[0.2em]">Niveles de Inversión</h3>
          </div>

          {niveles.map((nivel) => {
            const esActual = nivel.id === user?.nivel_id;
            const esSuperior = esNivelSuperior(nivel);
            const estaBloqueadoAdmin = ['S4', 'S5', 'S6', 'S7', 'S8', 'S9'].includes(nivel.codigo);

            return (
              <div
                key={nivel.id}
                className={`rounded-[2rem] p-6 border transition-all relative overflow-hidden group ${
                  esActual ? 'border-[#00C853] bg-white shadow-[0_20px_40px_-10px_rgba(0,200,83,0.1)]' :
                  esSuperior && !estaBloqueadoAdmin ? 'border-gray-100 bg-white hover:border-[#1a1f36]/30 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_-10px_rgba(26,31,54,0.1)]' :
                  'border-gray-50 bg-gray-50/50 opacity-60 grayscale'
                }`}
              >
                {/* Decoración de fondo de tarjeta */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none transition-transform group-hover:scale-150" />

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-transform group-hover:scale-110 duration-500 ${
                      esActual ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20' : 'bg-[#1a1f36]/5 text-[#1a1f36] border-white'
                    }`}>
                      <Crown size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-black text-[#1a1f36] uppercase tracking-tighter text-lg">{nivel.nombre}</h4>
                      <p className="text-[#1a1f36] font-black text-2xl tracking-tighter mt-0.5">
                        {(nivel.deposito || nivel.costo)?.toFixed(0)} 
                        <span className="text-[10px] text-gray-400 font-bold ml-1.5 uppercase tracking-widest">BOB</span>
                      </p>
                    </div>
                  </div>

                  {esActual ? (
                    <div className="flex items-center gap-1.5 bg-[#00C853] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,200,83,0.3)]">
                      <CheckCircle2 size={14} strokeWidth={3} /> Activo
                    </div>
                  ) : esSuperior && !estaBloqueadoAdmin ? (
                    <button
                      onClick={() => handleUpgrade(nivel)}
                      className="bg-[#1a1f36] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(26,31,54,0.3)] active:scale-90 transition-all hover:shadow-[0_15px_30px_rgba(26,31,54,0.4)]"
                    >
                      Unirse
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 border border-gray-200">
                      <Lock size={14} /> {estaBloqueadoAdmin ? 'Pronto' : 'Cerrado'}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 transition-all group-hover:bg-white group-hover:border-[#1a1f36]/10">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tareas diarias</p>
                    <p className="text-sm font-black text-gray-700">{(nivel.num_tareas_diarias || nivel.tareas_diarias)} <span className="text-[10px] text-gray-400 uppercase font-bold ml-1">Videos</span></p>
                  </div>
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 transition-all group-hover:bg-white group-hover:border-[#1a1f36]/10">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ingreso diario</p>
                    <p className="text-sm font-black text-[#00C853]">
                      +{( (nivel.num_tareas_diarias || nivel.tareas_diarias) * (nivel.comision_por_tarea || nivel.recompensa_tarea) ).toFixed(2)} 
                      <span className="text-[10px] font-bold ml-1 uppercase">BOB</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
