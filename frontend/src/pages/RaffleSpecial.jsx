import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, History, Coins, Info, Play, Sparkles } from 'lucide-react';

export default function RaffleSpecial() {
  const { refreshUser } = useAuth();
  const [premios, setPremios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [oportunidades, setOportunidades] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [ganador, setGanador] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    api.sorteo.premiosEspecial().then(setPremios).catch(() => []);
    api.sorteo.oportunidadesEspecial().then((r) => setOportunidades(r.oportunidades)).catch(() => setOportunidades(0));
    
    const fetchHistorial = () => {
      api.sorteo.historialEspecial().then(setHistorial).catch(() => []);
    };

    fetchHistorial();
    const interval = setInterval(fetchHistorial, 10000); // Actualizar cada 10 seg
    return () => clearInterval(interval);
  }, []);

  const girar = async () => {
    if (spinning || oportunidades <= 0) return;
    setSpinning(true);
    setGanador(null);
    setShowWinModal(false);
    
    try {
      const { premio, indice, oportunidades_restantes } = await api.sorteo.girarEspecial();
      
      const segmentAngle = 360 / (premios.length || 10);
      const randomOffset = (Math.random() * 0.8 + 0.1) * segmentAngle;
      const extraSpins = 8 + Math.floor(Math.random() * 5);
      const finalRotation = rotation + (extraSpins * 360) + (360 - (indice * segmentAngle)) - randomOffset;
      
      setRotation(finalRotation);
      
      setTimeout(() => {
        setSpinning(false);
        setGanador(premio);
        setShowWinModal(true);
        setOportunidades(oportunidades_restantes);
        
        // Refrescar los activos del usuario en el contexto global
        refreshUser();
        
        // Actualizar historial localmente para feedback inmediato
        setHistorial((h) => [{ 
          id: Math.random(),
          premio_nombre: premio.nombre, 
          monto: premio.valor, 
          created_at: new Date().toISOString(),
          usuario_masked: 'Tú'
        }, ...h]);
      }, 5000);
    } catch (e) {
      setSpinning(false);
      alert(e.message || 'Error al girar');
    }
  };

  return (
    <Layout>
      <Header 
        title="Sorteo Especial SAV" 
        rightAction={
          <button className="p-2 rounded-xl bg-white/10 text-white active:scale-90 transition-transform">
            <Info size={20} />
          </button>
        } 
      />
      
      <div className="p-5 max-w-4xl mx-auto space-y-8 pb-28 bg-gray-50/30 min-h-screen relative overflow-hidden">
        {/* Fondos decorativos con colores más "Premium/Especiales" */}
        <div className="absolute top-40 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1a1f36] via-[#2a2f46] to-[#1a1f36] p-10 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] border border-white/10 group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-[2000ms]" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-md animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-2xl relative z-10">
                <Sparkles className="text-amber-400 animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" size={40} />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-200/50">Oportunidades Especiales</p>
              <p className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">{oportunidades}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">Gira la ruleta de recompensas exclusivas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start relative z-10">
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Indicador superior */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]">
                <div className="w-12 h-14 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b-full rounded-t-xl relative flex items-center justify-center border-x-4 border-b-4 border-white">
                  <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse" />
                </div>
              </div>

              <div className="relative p-6 rounded-full bg-gradient-to-b from-white to-gray-50 shadow-xl border-8 border-white overflow-hidden group/ruleta">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover/ruleta:opacity-100 transition-opacity duration-700" />
                <div 
                  className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden transition-transform duration-[5000ms] ease-[cubic-bezier(0.15,0,0.15,1)] shadow-inner"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {premios.length > 0 ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {premios.map((s, i) => {
                        const segAngle = 360 / premios.length;
                        const startAngle = i * segAngle;
                        const endAngle = (i + 1) * segAngle;
                        const r = 50;
                        const x1 = 50 + r * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 50 + r * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 50 + r * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = 50 + r * Math.sin((endAngle * Math.PI) / 180);
                        const d = `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                        
                        const midAngle = startAngle + segAngle / 2;
                        const tx = 50 + 32 * Math.cos((midAngle * Math.PI) / 180);
                        const ty = 50 + 32 * Math.sin((midAngle * Math.PI) / 180);

                        return (
                          <g key={s.id || i}>
                            <path d={d} fill={s.color || (i % 2 === 0 ? '#1a1f36' : '#2a2f46')} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                            <text 
                              x={tx} 
                              y={ty} 
                              fill="white" 
                              fontSize="3" 
                              fontWeight="900" 
                              textAnchor="middle" 
                              transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                              className="uppercase tracking-tighter"
                            >
                              {s.nombre}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {/* Centro de la ruleta */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/80 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2),inset_0_2px_5px_white] z-20 flex items-center justify-center border-4 border-white">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl border-2 border-white/20">
                      <div className="w-4 h-4 rounded-full bg-white animate-ping shadow-[0_0_10px_white]" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={girar}
                disabled={spinning || oportunidades <= 0}
                className={`
                  mt-12 px-16 py-6 rounded-[2.5rem] bg-gradient-to-r from-amber-500 to-amber-700 text-white font-black uppercase tracking-[0.3em] text-xs
                  shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] active:scale-90 transition-all border-b-8 border-amber-900
                  disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center gap-4 relative overflow-hidden group
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1500ms]" />
                {spinning ? 'Sorteando...' : (
                  <>
                    <Play size={20} fill="currentColor" className="drop-shadow-[0_0_5px_white]" />
                    Girar Ruleta Especial
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Lista de premios */}
            <div className="bg-white rounded-[3rem] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 blur-2xl transition-transform group-hover:scale-150" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-600 border border-amber-500/10 shadow-inner">
                  <Trophy size={24} />
                </div>
                <h3 className="font-black text-[#1a1f36] uppercase tracking-[0.2em] text-sm">Beneficios Especiales</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {premios.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100 hover:border-amber-500/30 transition-all group/item shadow-sm">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-transform group-hover/item:scale-125" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover/item:text-amber-600">{p.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial de ganadores especial */}
            <div className="bg-white rounded-[3rem] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 blur-2xl" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-inner">
                  <History size={24} />
                </div>
                <h3 className="font-black text-[#1a1f36] uppercase tracking-[0.2em] text-sm">Ganadores Especiales</h3>
              </div>
              <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col gap-4">
                  {historial.slice(0, 15).map((h, i) => (
                    <div 
                      key={h.id || i} 
                      className="flex items-center justify-between p-5 rounded-[2rem] bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 group/winner animate-ladder-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-sm group-winner:scale-125 transition-transform" />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center text-amber-800 font-black text-xs relative z-10 border-2 border-white shadow-md">
                            {h.usuario_masked?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-[#1a1f36] uppercase tracking-tighter">{h.usuario_masked || 'Usuario'}</p>
                          <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-widest mt-0.5">Sorteo Especial</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#00C853] text-lg tracking-tighter">+{Number(h.premio_valor || h.monto || 0).toFixed(2)}</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">BOB</p>
                      </div>
                    </div>
                  ))}
                </div>
                {historial.length === 0 && (
                  <div className="text-center py-12 opacity-20 grayscale">
                    <Trophy size={50} className="mx-auto mb-4" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">Esperando ganadores</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse" />
          <p className="text-[11px] font-black text-white leading-relaxed uppercase tracking-[0.2em] flex items-center justify-center gap-4 relative z-10 text-center">
            <Sparkles size={20} className="text-amber-300 animate-pulse" />
            ¡La Ruleta Especial tiene los premios más altos del sistema!
            <Sparkles size={20} className="text-amber-300 animate-pulse" />
          </p>
        </div>
      </div>

      {/* Modal de Ganador Especial */}
      {showWinModal && ganador && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-amber-900/60 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-[4rem] p-12 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-white/20 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />
            
            <div className="mb-10 relative">
              <div className="w-32 h-32 bg-amber-500/10 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-inner">
                <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl border-8 border-white/20">
                  <Trophy size={48} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 border-4 border-amber-500/20 rounded-full animate-ping" />
              </div>
            </div>

            <div className="space-y-2 mb-10">
              <h2 className="text-4xl font-black text-[#1a1f36] uppercase tracking-tighter">¡INCREÍBLE!</h2>
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.4em]">Ganaste un premio especial</p>
            </div>

            <div className="bg-amber-50 py-8 px-10 rounded-[3rem] border border-amber-100 mb-10 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl" />
              <p className="text-5xl font-black text-amber-600 tracking-tighter drop-shadow-sm">+{ganador.valor}</p>
              <p className="text-xs font-black text-gray-300 uppercase tracking-[0.4em] mt-2">BOB</p>
            </div>

            <button
              onClick={() => setShowWinModal(false)}
              className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-amber-500 to-amber-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] active:scale-95 transition-all hover:shadow-[0_25px_45px_-10px_rgba(245,158,11,0.5)]"
            >
              Cosechar Premio
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
