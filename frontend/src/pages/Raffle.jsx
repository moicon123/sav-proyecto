import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { Trophy, History, Coins, Info, Play, Sparkles } from 'lucide-react';

export default function Raffle() {
  const [premios, setPremios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [oportunidades, setOportunidades] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [ganador, setGanador] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const wheelRef = useRef(null);

  useEffect(() => {
    api.sorteo.premios().then(setPremios).catch(() => []);
    api.sorteo.historial().then(setHistorial).catch(() => []);
    api.sorteo.oportunidades().then((r) => setOportunidades(r.oportunidades)).catch(() => setOportunidades(0));
  }, []);

  const girar = async () => {
    if (spinning || oportunidades <= 0) return;
    setSpinning(true);
    setGanador(null);
    setShowWinModal(false);
    
    try {
      const { premio, indice, oportunidades_restantes } = await api.sorteo.girar();
      
      // Cálculo de rotación más dinámico
      const segmentAngle = 360 / (premios.length || 8);
      const randomOffset = (Math.random() * 0.8 + 0.1) * segmentAngle; // Evitar bordes
      const extraSpins = 8 + Math.floor(Math.random() * 5); // Entre 8 y 12 vueltas
      const finalRotation = rotation + (extraSpins * 360) + (360 - (indice * segmentAngle)) - randomOffset;
      
      setRotation(finalRotation);
      
      setTimeout(() => {
        setSpinning(false);
        setGanador(premio);
        setShowWinModal(true);
        setOportunidades(oportunidades_restantes);
        setHistorial((h) => [{ 
          premio_nombre: premio.nombre, 
          premio_valor: premio.valor, 
          premio_color: premio.color, 
          created_at: new Date().toISOString(),
          usuario_masked: 'T├║'
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
        title="Ruleta de la Suerte" 
        rightAction={
          <button className="p-2 rounded-full bg-sav-primary/5 text-sav-primary">
            <Info size={20} />
          </button>
        } 
      />
      
      <div className="p-4 max-w-4xl mx-auto space-y-8 pb-24">
        {/* Banner de Oportunidades */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sav-primary to-slate-900 p-8 text-white shadow-2xl group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sav-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Coins className="text-sav-accent animate-pulse" size={32} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sav-accent/80 mb-1">Intentos Disponibles</p>
              <p className="text-5xl font-black tracking-tighter">{oportunidades}</p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Gira para ganar bonos increíbles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Sección Ruleta */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Puntero Superior */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                <div className="w-10 h-12 bg-sav-accent rounded-b-full rounded-t-lg relative flex items-center justify-center border-x-4 border-b-4 border-white">
                  <div className="w-2 h-2 bg-sav-primary rounded-full" />
                </div>
              </div>

              {/* Contenedor Ruleta 3D */}
              <div className="relative p-6 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border-8 border-white">
                <div 
                  className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden transition-transform duration-[5000ms] ease-[cubic-bezier(0.15,0,0.15,1)] shadow-inner"
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
                        
                        // Posición del texto
                        const midAngle = startAngle + segAngle / 2;
                        const tx = 50 + 32 * Math.cos((midAngle * Math.PI) / 180);
                        const ty = 50 + 32 * Math.sin((midAngle * Math.PI) / 180);

                        return (
                          <g key={s.id}>
                            <path d={d} fill={s.color || '#999'} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                            <text 
                              x={tx} 
                              y={ty} 
                              fill="white" 
                              fontSize="4" 
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
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Cargando...</span>
                    </div>
                  )}
                  {/* Centro de la ruleta */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.2)] z-20 flex items-center justify-center border-4 border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-sav-primary flex items-center justify-center shadow-lg">
                      <div className="w-4 h-4 rounded-full bg-sav-accent animate-ping" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Giro Flotante */}
              <button
                onClick={girar}
                disabled={spinning || oportunidades <= 0}
                className={`
                  mt-12 px-12 py-5 rounded-[2rem] bg-gradient-to-r from-sav-accent to-yellow-600 text-sav-primary font-black uppercase tracking-[0.2em] text-sm
                  shadow-[0_15px_30px_-5px_rgba(212,175,55,0.4)] active:scale-90 transition-all border-b-4 border-yellow-800
                  disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center gap-3
                `}
              >
                {spinning ? 'Girando...' : (
                  <>
                    <Play size={18} fill="currentColor" />
                    Girar Ahora
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Listas Laterales */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sav-accent/10 flex items-center justify-center text-sav-accent">
                  <Trophy size={20} />
                </div>
                <h3 className="font-black text-gray-800 uppercase tracking-tighter">Premios Disponibles</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {premios.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-sav-accent/30 transition-colors group">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                    <span className="text-xs font-black text-gray-700 uppercase tracking-tighter group-hover:text-sav-primary">{p.nombre} BOB</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <History size={20} />
                </div>
                <h3 className="font-black text-gray-800 uppercase tracking-tighter">Últimos Ganadores</h3>
              </div>
              <div className="space-y-3">
                {historial.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-black text-[10px]">
                        {h.usuario_masked?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{h.usuario_masked || 'Usuario'}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Premio Recibido</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sav-primary text-sm">{h.premio_valor?.toFixed(2)}</p>
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">BOB</p>
                    </div>
                  </div>
                ))}
                {historial.length === 0 && (
                  <div className="text-center py-10 opacity-30 grayscale">
                    <Trophy size={40} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin registros</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Promocional */}
        <div className="bg-gradient-to-r from-sav-accent/10 to-transparent p-6 rounded-3xl border-l-4 border-sav-accent">
          <p className="text-xs font-bold text-sav-primary leading-relaxed uppercase tracking-tighter flex items-center gap-2">
            <Sparkles size={14} className="text-sav-accent" />
            ¡Empieza a generar ingresos hoy mismo! 100% real y garantizado.
          </p>
        </div>
      </div>

      {/* Modal de Ganador */}
      {showWinModal && ganador && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-sav-primary/40 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sav-accent via-yellow-400 to-sav-accent" />
            
            <div className="mb-6 relative">
              <div className="w-24 h-24 bg-sav-accent/20 rounded-full mx-auto flex items-center justify-center animate-bounce">
                <Trophy size={48} className="text-sav-accent" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-sav-accent/20 rounded-full animate-ping" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-sav-primary uppercase tracking-tighter mb-2">¡Increíble!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Has ganado un premio especial</p>
            
            <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 border border-gray-100">
              <p className="text-5xl font-black text-sav-primary tracking-tighter mb-1">
                {ganador.valor?.toFixed(2)}
              </p>
              <p className="text-xs font-black text-sav-accent uppercase tracking-[0.4em]">BOB</p>
            </div>

            <button
              onClick={() => setShowWinModal(false)}
              className="w-full py-5 rounded-2xl bg-sav-primary text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
            >
              Cerrar y Reclamar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
