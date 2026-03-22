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
      <div className="p-4 space-y-6 pb-10">

        {/* Nivel Actual */}
        <div className="bg-sav-primary text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sav-accent/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-sav-accent/20 flex items-center justify-center mb-4 border border-sav-accent/30">
              <Crown className="text-sav-accent" size={40} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Tu Rango Actual</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {user?.nivel_codigo === 'internar' ? 'Pasante' : user?.nivel_codigo || user?.nivel}
            </h2>
          </div>
        </div>

        {/* Selección Rápida */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2 text-center">Acceso Rápido Recarga</p>
          <div className="grid grid-cols-3 gap-2">
            {niveles
              .filter(n => ['S1', 'S2', 'S3'].includes(n.codigo))
              .map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleUpgrade(n)}
                  className="py-3 rounded-2xl bg-sav-primary/5 text-sav-primary border border-sav-primary/10 active:scale-95 transition-all flex flex-col items-center"
                >
                  <span className="text-xs font-black">{n.codigo}</span>
                  <span className="text-[9px] font-bold opacity-60">{(n.deposito || n.costo)} BS</span>
                </button>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Subir de Nivel</h3>

          {niveles.map((nivel) => {
            const esActual = nivel.id === user?.nivel_id;
            const esSuperior = esNivelSuperior(nivel);
            const estaBloqueadoAdmin = ['S4', 'S5', 'S6', 'S7', 'S8', 'S9'].includes(nivel.codigo);

            return (
              <div
                key={nivel.id}
                className={`rounded-[2.5rem] p-6 border-2 transition-all relative overflow-hidden ${
                  esActual ? 'border-sav-accent bg-sav-accent/5' :
                  esSuperior && !estaBloqueadoAdmin ? 'border-gray-100 bg-white' :
                  'border-gray-50 bg-gray-50/50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      esActual ? 'bg-sav-accent text-sav-primary' : 'bg-sav-primary/5 text-sav-primary'
                    }`}>
                      <Crown size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tighter text-gray-800">{nivel.nombre}</h4>
                      <p className="text-sav-accent font-black">{(nivel.deposito || nivel.costo)?.toFixed(2)} BOB</p>
                    </div>
                  </div>

                  {esActual ? (
                    <div className="flex items-center gap-1 bg-sav-accent text-sav-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={14} /> Actual
                    </div>
                  ) : esSuperior && !estaBloqueadoAdmin ? (
                    <button
                      onClick={() => handleUpgrade(nivel)}
                      className="bg-sav-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sav-primary/20 active:scale-95 transition-all"
                    >
                      Mejorar
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Lock size={14} /> {estaBloqueadoAdmin ? 'Muy Pronto' : 'Bloqueado'}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-2xl p-3 border border-gray-50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tareas Diarias</p>
                    <p className="text-sm font-black text-gray-700">{(nivel.num_tareas_diarias || nivel.tareas_diarias)} Videos</p>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-3 border border-gray-50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ganancia Diaria</p>
                    <p className="text-sm font-black text-sav-accent">{( (nivel.num_tareas_diarias || nivel.tareas_diarias) * (nivel.comision_por_tarea || nivel.recompensa_tarea) ).toFixed(2)} BOB</p>
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
