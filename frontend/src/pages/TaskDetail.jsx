import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { X, Play, Check, Info } from 'lucide-react';

/**
 * TaskDetail v1.5.0 - CLEAN VERSION
 * Requisitos:
 * 1. Encuesta DEBAJO del video (no overlay).
 * 2. Video continuo sin interrupciones.
 * 3. Encuesta aparece tras 10 segundos automáticamente.
 * 4. Redirección solo tras finalizar video y responder correctamente.
 * 5. Ganancias a billetera de activos (saldo_principal).
 */

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  // Estados principales
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canAnswer, setCanAnswer] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  
  // Estados de respuesta
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Cargar tarea al inicio
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    api.tasks.get(id)
      .then(t => {
        if (!isMounted) return;
        setTask(t);
        // Iniciar temporizador de 10 segundos
        setTimeLeft(10);
      })
      .catch(err => {
        console.error("Error cargando tarea:", err);
        navigate('/tareas');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [id, navigate]);

  // Manejador del temporizador
  useEffect(() => {
    if (!loading && task && !task.completada_hoy && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanAnswer(true);
    }
  }, [timeLeft, loading, task]);

  // Redirección automática al finalizar todo con éxito
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
      if (r.correcta) {
        refreshUser();
      }
    } catch (e) {
      setResult({ correcta: false, error: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  if (loading) {
    return (
      <Layout>
        <Header title="Detalles de la tarea" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white">
          <div className="w-12 h-12 border-4 border-[#1a1f36] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Cargando experiencia...</p>
        </div>
      </Layout>
    );
  }

  if (!task) return null;

  const opciones = task.opciones || [task.respuesta_correcta];
  const videoUrl = task.video_url || '';
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isDrive = videoUrl.includes('drive.google.com');
  const isVideoFile = videoUrl.match(/\.(mp4|webm|ogg|mov)$/);

  const renderVideoPlayer = () => {
    if (isDrive) {
      const fileId = videoUrl.split('/d/')[1]?.split('/')[0] || videoUrl.split('id=')[1]?.split('&')[0];
      return (
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl shadow-2xl">
          <iframe
            className="absolute top-[-10%] left-0 w-full h-[120%]"
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            allow="autoplay"
          ></iframe>
          <div className="absolute inset-0 z-10 pointer-events-none" />
        </div>
      );
    }

    if (isYouTube) {
      const id = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop();
      return (
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl shadow-2xl">
          <iframe
            className="absolute top-[-10%] left-0 w-full h-[120%] pointer-events-none"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&showinfo=0`}
            allow="autoplay; encrypted-media"
          ></iframe>
          <div className="absolute inset-0 z-10" />
        </div>
      );
    }

    if (isVideoFile) {
      return (
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl shadow-2xl">
          <video
            className="w-full h-full object-cover"
            src={api.getMediaUrl(videoUrl)}
            controls
            controlsList="nodownload noplaybackrate nopictureinpicture noremoteplayback"
            disablePictureInPicture
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            onCanPlay={(e) => {
               e.target.muted = false;
               e.target.play().catch(() => {
                 console.log("Autoplay con sonido bloqueado, el usuario debe interactuar.");
               });
            }}
          />
        </div>
      );
    }

    return (
      <img src={videoUrl || '/imag/logo.jpeg'} className="w-full aspect-video object-cover rounded-2xl" alt="" />
    );
  };

  return (
    <Layout key="task-detail-v1.5.0">
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header title="Área de Tareas" />
        
        <div className="p-4 max-w-2xl mx-auto space-y-6">
          
          {/* 1. REPRODUCTOR DE VIDEO (SIEMPRE ARRIBA) */}
          <div className="relative">
            {renderVideoPlayer()}
            
            {/* Indicador de Temporizador (Overlay discreto) */}
            {!task.completada_hoy && !canAnswer && (
              <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00C853] rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Publicidad en curso</span>
                  </div>
                  <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">
                    Pregunta en <span className="text-white text-xs ml-1">{timeLeft}s</span>
                  </p>
                </div>
              </div>
            )}

            {/* Logo SAV Flotante */}
            <div className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full p-1.5 border border-white/20 shadow-lg pointer-events-none">
              <img src="/imag/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full opacity-80" />
            </div>
          </div>

          {/* 2. DESCRIPCIÓN DEL CONTENIDO */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a1f36]/5 flex items-center justify-center border border-gray-50">
                <Info size={16} className="text-[#1a1f36]" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-[#1a1f36] uppercase tracking-widest">Descripción del Video</h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Contenido verificado por SAV</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic border-l-2 border-[#1a1f36] pl-4">
              {task.descripcion || 'Observa el video con atención para identificar la marca o producto publicitado.'}
            </p>
          </div>

          {/* 3. ENCUESTA (APARECE DEBAJO A LOS 10S) */}
          {!task.completada_hoy && canAnswer && !result && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-slideUp">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1a1f36] flex items-center justify-center text-white shadow-lg shadow-[#1a1f36]/20">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1a1f36] uppercase tracking-tighter">Encuesta de Validación</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Responde para recibir tu pago</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">v1.5.0</span>
              </div>

              <p className="text-sm font-bold text-[#1a1f36] mb-8 leading-relaxed p-5 bg-gray-50 rounded-2xl border border-gray-100">
                {task.pregunta || '¿A qué marca o contenido se refiere este video publicitario?'}
              </p>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {opciones.map((opc, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(opc)}
                    className={`
                      w-full py-5 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border
                      ${selected === opc 
                        ? 'bg-[#1a1f36] text-white border-[#1a1f36] shadow-xl translate-x-2' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-[#1a1f36]/30 hover:text-[#1a1f36]'}
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
                className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#1a1f36]/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Verificando...' : 'Confirmar y Ganar'}
              </button>
            </div>
          )}

          {/* 4. MENSAJES DE ESTADO */}
          {task.completada_hoy && (
            <div className="bg-[#00C853]/5 p-10 rounded-[2.5rem] border border-[#00C853]/20 text-center shadow-inner animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#00C853] flex items-center justify-center mb-6 text-white shadow-xl border-4 border-white">
                <Check size={40} strokeWidth={3} />
              </div>
              <h3 className="font-black text-[#1a1f36] text-lg uppercase tracking-widest mb-2">¡Tarea Realizada!</h3>
              <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest">Ya has recibido tu recompensa por este video hoy.</p>
              <button 
                onClick={() => navigate('/tareas')}
                className="w-full py-5 bg-[#1a1f36] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
              >
                Explorar más videos
              </button>
            </div>
          )}

          {result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a1f36]/60 animate-fade-in">
              <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-2xl animate-scale-in relative overflow-hidden border border-white/20">
                <div className={`absolute top-0 left-0 w-full h-2 ${result.correcta ? 'bg-[#00C853]' : 'bg-rose-500'}`} />
                
                {result.correcta ? (
                  <>
                    <div className="w-24 h-24 bg-[#00C853]/10 rounded-full mx-auto flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={32} strokeWidth={4} />
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-[#1a1f36] uppercase tracking-tighter mb-2">¡Completado!</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">Pago acreditado en activos</p>
                    <div className="bg-gray-50 py-4 px-8 rounded-3xl border border-gray-100 mb-8 inline-block">
                      <span className="text-4xl font-black text-[#00C853]">+{task.recompensa}</span>
                      <span className="text-xs font-black text-gray-400 ml-2">BOB</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-rose-100 shadow-lg">
                      <X size={48} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-black text-[#1a1f36] uppercase tracking-tighter mb-4">Reintento necesario</h2>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8">{result.error || 'La respuesta no coincide con el contenido publicitario.'}</p>
                  </>
                )}
                
                <button
                  onClick={() => {
                    if (result.correcta) navigate('/tareas');
                    else { setResult(null); setSelected(''); }
                  }}
                  className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  {result.correcta ? 'Continuar' : 'Intentar de nuevo'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
