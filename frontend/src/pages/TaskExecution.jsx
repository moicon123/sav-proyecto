import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { X, Play, Check, Info } from 'lucide-react';

/**
 * TaskDetail v1.6.1 - FINAL STABLE VERSION
 * FIX: Remueve definitivamente el overlay y fuerza la encuesta debajo del video.
 */

export default function TaskExecution() {
  console.log("%c SAV v1.6.2 - EXECUTING ", "background: #1a1f36; color: #fff; font-weight: bold;");
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const videoRef = useRef(null);
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canAnswer, setCanAnswer] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.tasks.get(id)
      .then(t => {
        if (!isMounted) return;
        setTask(t);
        setTimeLeft(10);
      })
      .catch(() => navigate('/tareas'))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && task && !task.completada_hoy && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanAnswer(true);
    }
  }, [timeLeft, loading, task]);

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
      <Header title="Detalles" />
      <div className="p-20 flex flex-col items-center bg-white min-h-screen">
        <div className="w-10 h-10 border-4 border-[#1a1f36] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cargando v1.6.1...</p>
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
      <div className="bg-gray-50 min-h-screen pb-24">
        <Header title="Área de Tareas" />
        
        <div className="p-4 max-w-xl mx-auto space-y-4">
          
          {/* SECCIÓN 1: VIDEO (SIN NADA ENCIMA) */}
          <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
            {isDrive ? (
              <iframe className="w-full h-full" src={`https://drive.google.com/file/d/${videoUrl.split('/d/')[1]?.split('/')[0] || videoUrl.split('id=')[1]?.split('&')[0]}/preview`} allow="autoplay" />
            ) : isYouTube ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop()}?autoplay=1&controls=0&modestbranding=1&rel=0`} allow="autoplay; encrypted-media" />
            ) : isVideoFile ? (
              <video ref={videoRef} className="w-full h-full object-cover" src={api.getMediaUrl(videoUrl)} controls controlsList="nodownload noplaybackrate" autoPlay playsInline onEnded={() => setVideoEnded(true)} onCanPlay={(e) => { e.target.muted = false; e.target.play().catch(()=>{}); }} />
            ) : (
              <img src={videoUrl || '/imag/logo.jpeg'} className="w-full h-full object-cover" alt="" />
            )}

            {/* Contador flotante pequeño y discreto */}
            {!task.completada_hoy && !canAnswer && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <p className="text-[9px] text-white font-black uppercase tracking-widest">Pregunta en {timeLeft}s</p>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: DESCRIPCIÓN */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                <Info size={14} className="text-[#1a1f36]" />
              </div>
              <h3 className="text-[9px] font-black text-[#1a1f36] uppercase tracking-[0.2em]">Descripción SAV</h3>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-[#1a1f36] pl-3">
              {task.descripcion || 'Verifica el contenido para ganar.'}
            </p>
          </div>

          {/* SECCIÓN 3: ENCUESTA (DEBAJO DEL VIDEO) */}
          {!task.completada_hoy && canAnswer && !result && (
            <div className="bg-white rounded-[2rem] p-6 shadow-2xl border-2 border-[#1a1f36]/5 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1a1f36] flex items-center justify-center text-white shadow-lg">
                    <Play size={14} fill="currentColor" />
                  </div>
                  <h3 className="text-xs font-black text-[#1a1f36] uppercase tracking-tighter">Validación v1.6.1</h3>
                </div>
                <span className="text-[8px] font-black text-gray-300 uppercase">Estable</span>
              </div>

              <p className="text-xs font-bold text-[#1a1f36] mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {task.pregunta || '¿Qué marca se promociona?'}
              </p>

              <div className="grid grid-cols-1 gap-2 mb-6">
                {opciones.map((opc, i) => (
                  <button key={i} onClick={() => setSelected(opc)} className={`w-full py-4 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border ${selected === opc ? 'bg-[#1a1f36] text-white shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-[#1a1f36]/20'}`}>
                    <span>{opc}</span>
                    <div className={`w-4 h-4 rounded-full border-2 ${selected === opc ? 'border-white' : 'border-gray-200'}`}>
                      {selected === opc && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleSubmit} disabled={!selected || submitting} className="w-full py-4 rounded-xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50">
                {submitting ? 'Verificando...' : 'Confirmar y Recibir Pago'}
              </button>
            </div>
          )}

          {/* MENSAJES DE ÉXITO/ERROR */}
          {task.completada_hoy && (
            <div className="bg-[#00C853]/5 p-8 rounded-[2rem] border border-[#00C853]/20 text-center shadow-inner">
              <Check className="mx-auto text-[#00C853] mb-4" size={40} />
              <h3 className="font-black text-[#1a1f36] text-sm uppercase mb-1">Tarea Completada</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Pago enviado a activos</p>
            </div>
          )}

          {result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a1f36]/80 animate-fade-in">
              <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${result.correcta ? 'bg-[#00C853]' : 'bg-rose-500'}`} />
                {result.correcta ? (
                  <>
                    <div className="w-20 h-20 bg-[#00C853]/10 rounded-full mx-auto flex items-center justify-center mb-6"><Check className="text-[#00C853]" size={32} /></div>
                    <h2 className="text-2xl font-black text-[#1a1f36] uppercase mb-1 tracking-tighter">¡Pago Exitoso!</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-6">Acreditado en Billetera de Activos</p>
                    <div className="text-3xl font-black text-[#00C853] mb-8">+{task.recompensa} BOB</div>
                  </>
                ) : (
                  <>
                    <X className="mx-auto text-rose-500 mb-6" size={48} />
                    <h2 className="text-xl font-black text-[#1a1f36] uppercase mb-4">Error de Validación</h2>
                    <p className="text-gray-400 text-xs font-bold mb-8">{result.error || 'Respuesta incorrecta.'}</p>
                  </>
                )}
                <button onClick={() => { if (result.correcta) navigate('/tareas'); else { setResult(null); setSelected(''); } }} className="w-full py-4 rounded-xl bg-[#1a1f36] text-white font-black uppercase text-[10px] tracking-widest shadow-xl">{result.correcta ? 'Finalizar' : 'Reintentar'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
