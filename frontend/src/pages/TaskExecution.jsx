import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { X, Play, Check, Info, ShieldCheck } from 'lucide-react';

/**
 * SAV v2.0.0 - REESCRITURA TOTAL
 * REQUERIMIENTOS CUMPLIDOS:
 * 1. Encuesta DEBAJO del video (NUNCA overlay).
 * 2. Video continuo sin interrupciones.
 * 3. Aparece automáticamente a los 10s.
 * 4. Ganancias a Billetera de Activos.
 * 5. Registro persistente.
 */

export default function TaskExecution() {
  console.log("%c SAV v2.0.0 - SISTEMA INICIADO ", "background: #00C853; color: #fff; font-weight: bold;");
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  // Estados de Tarea
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de Flujo
  const [timeLeft, setTimeLeft] = useState(10);
  const [canAnswer, setCanAnswer] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  
  // Estados de Respuesta
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // 1. Carga inicial
  useEffect(() => {
    let active = true;
    api.tasks.get(id)
      .then(t => {
        if (!active) return;
        setTask(t);
        setLoading(false);
      })
      .catch(() => navigate('/tareas'));
    return () => { active = false; };
  }, [id, navigate]);

  // 2. Temporizador de 10 segundos
  useEffect(() => {
    if (!loading && task && !task.completada_hoy && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanAnswer(true);
    }
  }, [timeLeft, loading, task]);

  // 3. Redirección final
  useEffect(() => {
    if (videoEnded && result?.correcta) {
      const timer = setTimeout(() => navigate('/tareas'), 3000);
      return () => clearTimeout(timer);
    }
  }, [videoEnded, result, navigate]);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const r = await api.tasks.responder(id, selected);
      setResult(r);
      if (r.correcta) refreshUser();
    } catch (e) {
      setResult({ correcta: false, error: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#1a1f36] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Iniciando v2.0.0</p>
      </div>
    </Layout>
  );

  if (!task) return null;

  const opciones = task.opciones || [task.respuesta_correcta];
  const videoUrl = task.video_url || '';
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isDrive = videoUrl.includes('drive.google.com');
  const isVideoFile = videoUrl.match(/\.(mp4|webm|ogg|mov)$/);

  return (
    <Layout>
      <div className="bg-[#f8f9fa] min-h-screen pb-32">
        <Header title="Reproductor de Tareas" />
        
        <div className="p-4 max-w-2xl mx-auto space-y-6">
          
          {/* --- BLOQUE 1: VIDEO (NADA PUEDE ESTAR ENCIMA) --- */}
          <div className="relative w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white animate-scale-in">
            {isDrive ? (
              <iframe className="w-full h-full" src={`https://drive.google.com/file/d/${videoUrl.split('/d/')[1]?.split('/')[0] || videoUrl.split('id=')[1]?.split('&')[0]}/preview`} allow="autoplay" />
            ) : isYouTube ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop()}?autoplay=1&controls=1&modestbranding=1`} allow="autoplay; encrypted-media" />
            ) : isVideoFile ? (
              <video className="w-full h-full object-cover" src={api.getMediaUrl(videoUrl)} controls autoPlay playsInline onEnded={() => setVideoEnded(true)} onCanPlay={(e) => { e.target.muted = false; e.target.play().catch(()=>{}); }} />
            ) : (
              <img src={videoUrl || '/imag/logo.jpeg'} className="w-full h-full object-cover" alt="" />
            )}

            {/* Solo un contador minimalista para no estorbar */}
            {!task.completada_hoy && !canAnswer && (
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[10px] text-white font-black uppercase tracking-widest">Validación en {timeLeft}s</p>
              </div>
            )}
          </div>

          {/* --- BLOQUE 2: INFO --- */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1f36]/5 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-[#1a1f36]" size={24} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#1a1f36] uppercase tracking-widest mb-1">Información de Campaña</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                {task.descripcion || 'Analiza el contenido publicitario para validar tu participación y recibir la recompensa.'}
              </p>
            </div>
          </div>

          {/* --- BLOQUE 3: ENCUESTA (DEBAJO DEL VIDEO) --- */}
          {!task.completada_hoy && canAnswer && !result && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 animate-slideUp">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1f36] flex items-center justify-center text-white shadow-lg">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1a1f36] uppercase">Confirmar Marca</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">v2.0.0 - Estable</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {opciones.map((opc, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(opc)}
                    className={`
                      w-full py-5 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border-2
                      ${selected === opc 
                        ? 'bg-[#1a1f36] text-white border-[#1a1f36] shadow-xl translate-x-2' 
                        : 'bg-white text-gray-400 border-gray-50 hover:border-[#1a1f36]/20 hover:text-[#1a1f36]'}
                    `}
                  >
                    <span>{opc}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === opc ? 'border-white' : 'border-gray-200'}`}>
                      {selected === opc && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Procesando...' : 'Reclamar Recompensa'}
              </button>
            </div>
          )}

          {/* --- BLOQUE 4: ESTADOS FINALES --- */}
          {task.completada_hoy && (
            <div className="bg-[#00C853]/5 p-10 rounded-[3rem] border-2 border-[#00C853]/10 text-center">
              <div className="w-20 h-20 bg-[#00C853] rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-[#00C853]/20">
                <Check className="text-white" size={40} strokeWidth={3} />
              </div>
              <h3 className="font-black text-[#1a1f36] text-lg uppercase mb-2">¡Completado con Éxito!</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tus activos han sido actualizados.</p>
            </div>
          )}

          {result && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-[#1a1f36]/80 animate-fade-in">
              <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${result.correcta ? 'bg-[#00C853]' : 'bg-rose-500'}`} />
                {result.correcta ? (
                  <>
                    <div className="w-24 h-24 bg-[#00C853]/10 rounded-full mx-auto flex items-center justify-center mb-6">
                      <Check className="text-[#00C853]" size={48} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-black text-[#1a1f36] uppercase tracking-tighter mb-2">¡Pago Acreditado!</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Billetera de Activos</p>
                    <div className="text-4xl font-black text-[#00C853] mb-10">+{task.recompensa} BOB</div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-rose-50 rounded-full mx-auto flex items-center justify-center mb-6">
                      <X className="text-rose-500" size={48} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-black text-[#1a1f36] uppercase mb-4">Error de Validación</h2>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed mb-10">{result.error || 'La respuesta no coincide con el contenido.'}</p>
                  </>
                )}
                <button 
                  onClick={() => { if (result.correcta) navigate('/tareas'); else { setResult(null); setSelected(''); } }}
                  className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  {result.correcta ? 'Finalizar Tarea' : 'Intentar de Nuevo'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
