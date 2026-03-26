import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { Play, Check, Info, ShieldCheck, X, Clock, Wallet, ArrowRight } from 'lucide-react';

/**
 * SAV v3.1.0 - REFINAMIENTO DE DISEÑO Y UX
 * 
 * ESPECIFICACIONES DE DISEÑO:
 * 1. Video Estático (Top): Sin overlays, borde premium.
 * 2. Status Bar (Below Video): Indica el progreso de validación.
 * 3. Survey Card (Bottom): Opciones grandes, táctiles y modernas.
 * 4. Success State: Feedback visual claro del depósito en "Activos".
 */

export default function TaskWork() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  // Referencias y Estados de Datos
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados del Flujo de Tarea
  const [timer, setTimer] = useState(10);
  const [surveyVisible, setSurveyVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Inicialización limpia de la tarea
  useEffect(() => {
    let isMounted = true;
    
    const loadTaskData = async () => {
      try {
        const data = await api.tasks.get(id);
        if (isMounted) {
          setTask(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error crítico cargando tarea v3:", err);
        navigate('/tareas');
      }
    };

    loadTaskData();
    return () => { isMounted = false; };
  }, [id, navigate]);

  // 2. Lógica del temporizador
  useEffect(() => {
    if (!loading && task && !task.completada_hoy && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setSurveyVisible(true);
    }
  }, [timer, loading, task]);

  // 3. Manejo del envío de respuesta
  const onConfirmResponse = async () => {
    if (!selectedOption || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await api.tasks.responder(id, selectedOption);
      if (response.correcta) {
        setIsCorrect(true);
        refreshUser();
      } else {
        setErrorMessage(response.error || 'Respuesta incorrecta. Inténtalo de nuevo.');
        setSelectedOption('');
      }
    } catch (err) {
      setErrorMessage('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Redirección final automática
  useEffect(() => {
    if (videoFinished && isCorrect) {
      const timeout = setTimeout(() => navigate('/tareas'), 3000);
      return () => clearTimeout(timeout);
    }
  }, [videoFinished, isCorrect, navigate]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10">
        <div className="w-16 h-16 border-[6px] border-[#1a1f36]/10 border-t-[#1a1f36] rounded-full animate-spin mb-8" />
        <div className="text-center">
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-[#1a1f36] mb-2">SAV Engine v3.1</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preparando contenido seguro...</p>
        </div>
      </div>
    </Layout>
  );

  if (!task) return null;

  const videoUrl = task.video_url || '';
  const options = task.opciones || [task.respuesta_correcta];
  
  // Detectores de tipo de video
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isDrive = videoUrl.includes('drive.google.com');
  const isDirect = videoUrl.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <Layout>
      <div className="bg-[#f8f9fc] min-h-screen pb-40">
        <Header title="Ejecución de Tarea" />
        
        <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
          
          {/* --- BLOQUE 1: REPRODUCTOR (TOP - SIN OVERLAYS) --- */}
          <section className="w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border-[6px] border-white ring-1 ring-gray-100">
            {isYouTube ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop()}?autoplay=1&controls=1&rel=0&modestbranding=1`} allow="autoplay; encrypted-media" />
            ) : isDrive ? (
              <iframe className="w-full h-full" src={`https://drive.google.com/file/d/${videoUrl.split('/d/')[1]?.split('/')[0] || videoUrl.split('id=')[1]?.split('&')[0]}/preview`} allow="autoplay" />
            ) : isDirect ? (
              <video className="w-full h-full object-cover" src={api.getMediaUrl(videoUrl)} controls autoPlay playsInline onEnded={() => setVideoFinished(true)} onCanPlay={(e) => { e.target.muted = false; e.target.play().catch(()=>{}); }} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1f36]">
                <img src="/imag/logo.jpeg" className="w-24 h-24 rounded-full opacity-50 mb-4 grayscale" alt="SAV" />
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Sin señal de video</span>
              </div>
            )}
          </section>

          {/* --- BLOQUE 1.5: BARRA DE ESTADO Y VALIDACIÓN --- */}
          {!task.completada_hoy && !surveyVisible && (
            <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00C853]/10 flex items-center justify-center border border-[#00C853]/20">
                  <Clock size={20} className="text-[#00C853]" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Estado de Validación</span>
                  <span className="block text-xs text-[#1a1f36] font-bold">Observa el contenido para activar la encuesta...</span>
                </div>
              </div>
              <div className="bg-[#1a1f36] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                {timer}
              </div>
            </div>
          )}

          {/* --- BLOQUE 2: INFORMACIÓN DE LA MARCA --- */}
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1f36] flex items-center justify-center shrink-0 shadow-lg rotate-3">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[11px] font-black text-[#1a1f36] uppercase tracking-[0.2em]">Verificado por SAV</h3>
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-widest">Premium Ad</span>
              </div>
              <p className="text-[12px] text-gray-500 font-medium leading-snug">
                {task.descripcion || 'Esta marca requiere tu validación visual para procesar la recompensa diaria.'}
              </p>
            </div>
          </section>

          {/* --- BLOQUE 3: ENCUESTA DE VALIDACIÓN (DEBAJO DEL VIDEO) --- */}
          {!task.completada_hoy && surveyVisible && !isCorrect && (
            <section className="bg-white rounded-[3rem] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border-2 border-[#1a1f36]/5 animate-slideUp">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-3xl bg-[#1a1f36] flex items-center justify-center text-white shadow-2xl mx-auto mb-6 rotate-3">
                  <Play size={24} fill="currentColor" />
                </div>
                <h3 className="text-xl font-black text-[#1a1f36] uppercase tracking-tighter mb-1">Validación de Marca</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Responde para recibir tu pago</p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-10">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(opt)}
                    className={`
                      group w-full py-6 px-8 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border-2
                      ${selectedOption === opt 
                        ? 'bg-[#1a1f36] text-white border-[#1a1f36] shadow-[0_15px_30px_-5px_rgba(26,31,54,0.4)] translate-x-3' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-[#1a1f36]/20 hover:text-[#1a1f36] hover:bg-gray-50'}
                    `}
                  >
                    <span>{opt}</span>
                    <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${selectedOption === opt ? 'border-white bg-white/20' : 'border-gray-200 group-hover:border-[#1a1f36]/30'}`}>
                      {selectedOption === opt && <Check size={14} className="text-white animate-scale" />}
                    </div>
                  </button>
                ))}
              </div>

              {errorMessage && (
                <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake flex items-center justify-center gap-3">
                  <X size={14} />
                  {errorMessage}
                </div>
              )}

              <button
                onClick={onConfirmResponse}
                disabled={!selectedOption || isSubmitting}
                className="group w-full py-6 rounded-[2rem] bg-[#1a1f36] text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirmar y Cobrar</span>
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </section>
          )}

          {/* --- BLOQUE 4: ESTADOS DE ÉXITO (DEBAJO DEL VIDEO) --- */}
          {(task.completada_hoy || isCorrect) && (
            <section className="bg-white p-12 rounded-[3.5rem] border-4 border-[#00C853]/20 text-center animate-fade-in shadow-[0_50px_100px_-20px_rgba(0,200,83,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-[#00C853]" />
              
              <div className="w-24 h-24 bg-[#00C853] rounded-[2.5rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-[#00C853]/40 border-4 border-white rotate-6">
                <Check className="text-white" size={48} strokeWidth={4} />
              </div>
              
              <h3 className="font-black text-[#1a1f36] text-2xl uppercase mb-3 tracking-tighter">¡Pago Verificado!</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-10 italic">Acreditado en Billetera de Activos</p>
              
              <div className="bg-[#f8f9fc] py-6 px-10 rounded-[2.5rem] border border-gray-100 inline-flex items-center gap-4 mb-10 shadow-inner">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <Wallet size={20} className="text-[#1a1f36]" />
                </div>
                <div className="text-left">
                  <span className="block text-[36px] font-black text-[#1a1f36] leading-none tracking-tighter">+{task.recompensa}</span>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Moneda: BOB</span>
                </div>
              </div>
              
              {isCorrect && videoFinished ? (
                <button 
                  onClick={() => navigate('/tareas')}
                  className="w-full py-6 rounded-[2rem] bg-[#1a1f36] text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all animate-bounce flex items-center justify-center gap-4"
                >
                  <span>Cerrar Sesión de Tarea</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a1f36] animate-progress" style={{ width: '100%' }} />
                  </div>
                  <p className="text-[10px] font-black text-[#1a1f36]/40 uppercase tracking-[0.3em] animate-pulse italic">
                    Finalizando transmisión de video...
                  </p>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </Layout>
  );
}
