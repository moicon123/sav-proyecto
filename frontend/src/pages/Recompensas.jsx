import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Trophy, 
  Sparkles, 
  History, 
  Wallet, 
  ChevronRight, 
  Coins,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function Recompensas() {
  const { user, setUser } = useAuth();
  const [premios, setPremios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.sorteo.premios(),
      api.sorteo.historial()
    ]).then(([p, h]) => {
      setPremios(p);
      setHistorial(h);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const spinWheel = async () => {
    if (spinning || premios.length === 0) return;
    
    setError(null);
    setResult(null);
    
    try {
      const res = await api.sorteo.girar();
      if (res.ok) {
        setSpinning(true);
        
        // Calcular rotación
        const premioIndex = premios.findIndex(p => p.id === res.premio.id);
        const segmentAngle = 360 / premios.length;
        const extraRounds = 10 * 360; // 10 vueltas completas
        const targetAngle = extraRounds + (360 - (premioIndex * segmentAngle)) - (segmentAngle / 2);
        
        const newRotation = rotation + targetAngle + (360 - (rotation % 360));
        setRotation(newRotation);

        setTimeout(() => {
          setSpinning(false);
          setResult(res.premio);
          // Actualizar saldo del usuario localmente
          setUser({
            ...user,
            saldo_comisiones: res.nuevo_saldo_comisiones,
            saldo_principal: res.nuevo_saldo_principal
          });
          // Refrescar historial
          api.sorteo.historial().then(setHistorial);
        }, 5000);
      }
    } catch (err) {
      setError(err.message || 'Error al girar la ruleta');
    }
  };

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
        {/* Header Section */}
        <div className="bg-[#1a1f36] pt-12 pb-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Sparkles className="text-amber-400" size={16} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ruleta de la Suerte Premium</span>
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              GIRA Y <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">GANA</span>
            </h1>
            <p className="text-white/40 text-xs font-bold max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
              Prueba tu suerte hoy. Cada giro es una oportunidad de multiplicar tus activos.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 -mt-20 max-w-4xl mx-auto space-y-8">
          {/* Wheel Container */}
          <div className="relative flex flex-col items-center">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30">
              <div className="w-8 h-10 bg-white rounded-b-full shadow-2xl flex items-center justify-center border-x-4 border-b-4 border-[#1a1f36]">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* The Wheel */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-[#1a1f36] shadow-[0_0_50px_rgba(0,0,0,0.2)] overflow-hidden bg-white">
              <div 
                ref={wheelRef}
                className="w-full h-full transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {premios.map((premio, i) => {
                    const angle = 360 / premios.length;
                    const rotationAngle = i * angle;
                    const x1 = 50 + 50 * Math.cos((Math.PI * (rotationAngle - 90)) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * (rotationAngle - 90)) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * (rotationAngle + angle - 90)) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * (rotationAngle + angle - 90)) / 180);
                    
                    return (
                      <g key={premio.id}>
                        <path 
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                          fill={i % 2 === 0 ? '#1a1f36' : '#2a2f46'}
                          stroke="white"
                          strokeWidth="0.2"
                        />
                        <text
                          x="50"
                          y="20"
                          fill="white"
                          fontSize="4"
                          fontWeight="900"
                          textAnchor="middle"
                          transform={`rotate(${rotationAngle + angle/2}, 50, 50)`}
                          style={{ textTransform: 'uppercase' }}
                        >
                          {premio.valor} BOB
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Center Cap */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1a1f36] border-4 border-white shadow-2xl flex items-center justify-center z-20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 animate-pulse flex items-center justify-center">
                  <Coins className="text-white" size={20} />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={spinWheel}
              disabled={spinning}
              className={`mt-10 group relative px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all duration-300 ${
                spinning ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1a1f36] text-white hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(26,31,54,0.3)]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
              {spinning ? 'Girando...' : 'Girar por 5 BOB'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 animate-shake">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}
          </div>

          {/* User Stats Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tu Saldo Disponible</p>
                <p className="text-2xl font-black text-[#1a1f36]">
                  {((user?.saldo_comisiones || 0) + (user?.saldo_principal || 0)).toFixed(2)}
                  <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-tighter">BOB</span>
                </p>
              </div>
            </div>
            <button className="p-4 rounded-2xl bg-gray-50 text-[#1a1f36] hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Winners History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#1a1f36]" />
                <h2 className="text-xs font-black text-[#1a1f36] uppercase tracking-[0.2em]">Ganadores Recientes</h2>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">En Vivo</span>
            </div>

            <div className="space-y-3">
              {historial.length > 0 ? historial.map((win, i) => (
                <div 
                  key={win.id}
                  className="bg-white rounded-2xl p-4 border border-gray-50 shadow-sm flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1a1f36] uppercase tracking-tight">
                        {win.usuario?.nombre_usuario || 'Usuario'}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(win.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-500">+{win.monto} BOB</p>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Premio Ruleta</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aún no hay ganadores hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Win Modal */}
        {result && !spinning && (
          <div className="fixed inset-0 z-50 bg-[#1a1f36]/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-10 text-center animate-scale-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-rose-500" />
              
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-inner relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
              </div>
              
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2">¡Felicidades!</h3>
              <h2 className="text-3xl font-black text-[#1a1f36] uppercase tracking-tighter mb-6 leading-none">
                Has Ganado <span className="text-emerald-500">{result.valor} BOB</span>
              </h2>
              
              <button
                type="button"
                onClick={() => setResult(null)}
                className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all"
              >
                Continuar Jugando
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
