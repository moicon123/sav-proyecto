import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { X, Play, Check } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canAnswer, setCanAnswer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);

  useEffect(() => {
    api.tasks.get(id)
      .then(t => {
        setTask(t);
        const url = t.video_url || '';
        const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/) || url.includes('youtube.com') || url.includes('youtu.be');
        
        if (isVideo) {
          setTimeLeft(10);
          setTimerActive(true);
        } else {
          setTimeLeft(3);
          setTimerActive(true);
        }
      })
      .catch(() => navigate('/tareas'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeLeft === 0) {
      setCanAnswer(true);
      setShowQuestion(true);
      setTimerActive(false);
    }
  }, [timeLeft, timerActive]);

  const handleSubmit = async () => {
    if (!selected) return;
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

  if (loading) {
    return (
      <Layout>
        <Header title="Detalles de la tarea" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white">
          <div className="w-12 h-12 border-4 border-[#1a1f36] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-[10px]">Cargando video...</p>
        </div>
      </Layout>
    );
  }

  if (!task) return null;

  const opciones = task.opciones || [task.respuesta_correcta];
  const showResult = result !== null;

  const renderVideo = () => {
    let url = task.video_url || '';
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isDrive = url.includes('drive.google.com');
    const isVideoFile = url.match(/\.(mp4|webm|ogg|mov)$/);
    
    // Soporte para Google Drive (Conversión automática a stream directo)
    if (isDrive) {
      const fileId = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1]?.split('&')[0];
      if (fileId) {
        return (
          <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl shadow-inner">
            <iframe
              className="absolute top-[-10%] left-0 w-full h-[120%]"
              src={`https://drive.google.com/file/d/${fileId}/preview`}
              allow="autoplay"
              loading="lazy"
            ></iframe>
            <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
              <div className="w-2 h-2 bg-[#00C853] rounded-full animate-pulse" />
              <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Optimized Stream</span>
            </div>
          </div>
        );
      }
    }

    if (isYouTube) {
      const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return (
        <div className="relative w-full aspect-video bg-black overflow-hidden group">
          <iframe
            className="absolute top-[-10%] left-0 w-full h-[120%] pointer-events-none"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&showinfo=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
          ></iframe>
          <div className="absolute inset-0 z-10" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Global HD Stream</span>
          </div>
        </div>
      );
    }

    if (isVideoFile) {
      return (
        <div className="relative w-full aspect-video bg-black">
          <video
            className="w-full h-full object-cover"
            src={url}
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadStart={(e) => {
              const loader = e.target.parentElement.querySelector('.video-loader');
              if (loader) loader.style.display = 'flex';
            }}
            onCanPlay={(e) => {
              const loader = e.target.parentElement.querySelector('.video-loader');
              if (loader) loader.style.display = 'none';
              e.target.play().catch(() => {});
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const img = e.target.parentElement.querySelector('.fallback-img');
              if (img) img.style.display = 'block';
            }}
          />
          <div className="video-loader absolute inset-0 flex items-center justify-center bg-black/50 z-10 hidden">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-[8px] text-white font-black uppercase tracking-widest">Loading...</span>
            </div>
          </div>
          <img
            src="/imag/logo.jpeg"
            alt=""
            className="fallback-img absolute inset-0 w-full h-full object-cover hidden"
          />
        </div>
      );
    }

    return (
      <img
        className="w-full aspect-video object-cover"
        src={url || '/imag/logo.jpeg'}
        alt=""
        onError={(e) => { e.target.src = '/imag/logo.jpeg'; }}
      />
    );
  };

  return (
    <Layout>
      <div className="page-transition animate-fade-in bg-white min-h-screen">
        <Header title="Detalles de la tarea" />
        <div className="p-4 space-y-4">
          <div className="rounded-[2rem] overflow-hidden bg-black mb-4 shadow-xl border border-gray-100 relative animate-scale-in">
            {renderVideo()}
          {/* Logo de la plataforma sobre el video (esquina superior derecha) */}
          <div className="absolute top-4 right-4 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full p-1.5 border border-white/30 shadow-lg pointer-events-none transition-transform hover:scale-110">
            <img 
              src="/imag/logo.jpeg" 
              alt="SAV Logo" 
              className="w-full h-full object-contain rounded-full shadow-sm opacity-80"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=SAV&background=1a1f36&color=fff';
              }}
            />
          </div>
        </div>

        {/* Nueva sección de redacción del producto con logo */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 mb-6 transition-all hover:border-[#1a1f36]/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1a1f36]/5 flex items-center justify-center p-1.5 shadow-inner border border-gray-100">
              <img 
                src="/imag/logo.jpeg" 
                alt="SAV Logo" 
                className="w-full h-full object-contain grayscale opacity-70"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?name=S&background=1a1f36&color=fff';
                }}
              />
            </div>
            <div>
              <h3 className="font-black text-[#1a1f36] text-[10px] uppercase tracking-[0.2em]">SAV Publicidad</h3>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Contenido Verificado</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed font-medium italic border-l-2 border-[#1a1f36] pl-4 py-1">
            {task.descripcion || 'Descubre la calidad y exclusividad de este producto a través de nuestra plataforma publicitaria.'}
          </p>
        </div>

        <p className="text-[10px] font-black text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-widest px-1">
          <span className="w-1 h-3 bg-[#1a1f36] rounded-full" />
          Requisitos de la tarea
        </p>

        {task.completada_hoy && (
          <div className="bg-[#00C853]/5 p-8 rounded-[2rem] border border-[#00C853]/10 mb-6 text-center shadow-inner animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00C853]/10 flex items-center justify-center mb-4 text-[#00C853] shadow-lg border border-[#00C853]/20">
              <Play size={32} fill="currentColor" />
            </div>
            <h3 className="font-black text-[#1a1f36] text-sm uppercase tracking-widest mb-2">Tarea completada</h3>
            <p className="text-[10px] font-bold text-gray-400 mb-8 leading-relaxed uppercase tracking-wide">
              Ya has completado esta tarea con éxito el día de hoy. ¡Vuelve mañana para seguir ganando!
            </p>
            <button 
              onClick={() => navigate('/tareas')}
              className="w-full py-4 bg-[#1a1f36] text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl border border-white/5 active:scale-95 transition-all"
            >
              Ver otras tareas
            </button>
          </div>
        )}

        {!task.completada_hoy && !canAnswer && (
          <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 mb-4 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#1a1f36]/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <p className="font-black text-[#1a1f36] text-xs uppercase tracking-widest relative z-10">Mira el video por <span className="text-[#1a1f36] text-lg mx-1">{timeLeft}</span> segundos más...</p>
          </div>
        )}

        {!task.completada_hoy && canAnswer && !showResult && (
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 animate-slideUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1a1f36]/5 flex items-center justify-center text-[#1a1f36] border border-gray-100">
                <Play size={20} fill="currentColor" />
              </div>
              <h3 className="text-sm font-black text-[#1a1f36] uppercase tracking-tighter">Responde para ganar</h3>
            </div>
            
            <p className="text-sm font-bold text-gray-600 mb-6 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {task.pregunta || '¿Qué te pareció el contenido del video publicitario?'}
            </p>
            
            <div className="grid grid-cols-1 gap-3 mb-8">
              {opciones.map((opc, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(opc)}
                  className={`
                    w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group
                    ${selected === opc 
                      ? 'bg-[#1a1f36] text-white shadow-xl translate-x-2' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100 hover:border-[#1a1f36]/30 hover:text-gray-600'}
                  `}
                >
                  <span>{opc}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected === opc ? 'border-white bg-white/20' : 'border-gray-200'}`}>
                    {selected === opc && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#1a1f36]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? 'Enviando...' : 'Confirmar Respuesta'}
            </button>
          </div>
        )}

        {showResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-[#1a1f36]/40 animate-fade-in">
            <div className={`
              w-full max-w-sm rounded-[3rem] p-10 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 animate-scale-in relative overflow-hidden
              ${result.correcta ? 'bg-white' : 'bg-white'}
            `}>
              {result.correcta ? (
                <>
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#00C853]" />
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-[#00C853]/10 rounded-full mx-auto flex items-center justify-center animate-bounce">
                      <div className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center shadow-lg border-4 border-white/20">
                        <Check className="text-white" size={32} strokeWidth={4} />
                      </div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex items-center justify-center">
                      <div className="w-32 h-32 border-4 border-[#00C853]/20 rounded-full animate-ping" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-[#1a1f36] uppercase tracking-tighter mb-2">¡Éxito Total!</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">Has ganado una recompensa de</p>
                  <div className="bg-gray-50 py-4 px-6 rounded-2xl border border-gray-100 mb-8 inline-block">
                    <span className="text-4xl font-black text-[#00C853] tracking-tighter">+{task.recompensa}</span>
                    <span className="text-sm font-black text-gray-400 ml-2 uppercase">BOB</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center border-4 border-rose-100 shadow-xl">
                      <X size={48} strokeWidth={3} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-[#1a1f36] uppercase tracking-tighter mb-2">Respuesta Incorrecta</h2>
                  <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8">
                    {result.error || 'Lo sentimos, esa no era la respuesta correcta. Vuelve a intentarlo mañana.'}
                  </p>
                </>
              )}
              
              <button
                onClick={() => navigate('/tareas')}
                className={`
                  w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all
                  ${result.correcta ? 'bg-[#1a1f36] text-white shadow-[#1a1f36]/20' : 'bg-gray-100 text-gray-500 border border-gray-200'}
                `}
              >
                Volver a la sala
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
