import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { Play, Check, Info, ShieldCheck, X, Clock } from 'lucide-react';

/**
 * SAV v3.0.0 - RECONSTRUCCIÓN ARQUITECTÓNICA TOTAL
 * 
 * ESPECIFICACIONES TÉCNICAS:
 * 1. Independencia total de versiones anteriores.
 * 2. Estructura: [Header] -> [Video (Static Top)] -> [Info] -> [Encuesta (Bottom dynamic)].
 * 3. Lógica de Activación: Cronómetro interno de 10s tras montado.
 * 4. Lógica de Pago: Encuesta Respondida + Video Finalizado.
 * 5. Destino de Fondos: Saldo Principal (Activos).
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

  // 2. Lógica del temporizador (Independiente del reproductor para mayor estabilidad)
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
        <div className="w-12 h-12 border-[6px] border-[#1a1f36]/10 border-t-[#1a1f36] rounded-full animate-spin mb-6" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1a1f36]">Iniciando Motor v3.0.0</h2>
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
      <div className="bg-[#fcfcfc] min-h-screen pb-32">
        <Header title="Tarea en curso" />
        
        <div className="max-w-xl mx-auto p-4 space-y-6">
          
          {/* --- NIVEL 1: REPRODUCTOR DE VIDEO (SIN OVERLAYS) --- */}
          <section className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            {isYouTube ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop()}?autoplay=1&controls=1&rel=0`} allow="autoplay; encrypted-media" />
            ) : isDrive ? (
              <iframe className="w-full h-full" src={`https://drive.google.com/file/d/${videoUrl.split('/d/')[1]?.split('/')[0] || videoUrl.split('id=')[1]?.split('&')[0]}/preview`} allow="autoplay" />
            ) : isDirect ? (
              <video className="w-full h-full object-cover" src={api.getMediaUrl(videoUrl)} controls autoPlay playsInline onEnded={() => setVideoFinished(true)} onCanPlay={(e) => { e.target.muted = false; e.target.play().catch(()=>{}); }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <img src="/imag/logo.jpeg" className="w-20 h-20 opacity-20" alt="SAV" />
              </div>
            )}
          </section>

          {/* --- NIVEL 1.5: ESTADO DE VALIDACIÓN (DEBAJO DEL VIDEO) --- */}
          {!task.completada_hoy && !surveyVisible && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C853]/10 flex items-center justify-center">
                  <Clock size={16} className="text-[#00C853]" />
                </div>
                <span className="text-[10px] text-[#1a1f36] font-black uppercase tracking-widest">Validación en curso...</span>
              </div>
              <span className="text-sm font-black text-[#1a1f36] bg-[#1a1f36]/5 px-3 py-1 rounded-lg">{timer}s</span>
            </div>
          )}

          {/* --- NIVEL 2: INFORMACIÓN --- */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1f36]/5 flex items-center justify-center shrink-0 border border-[#1a1f36]/5">
              <ShieldCheck className="text-[#1a1f36]" size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-[#1a1f36] uppercase tracking-[0.2em] mb-1">SAV Content Engine</h3>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic border-l-2 border-[#1a1f36] pl-3">
                {task.descripcion || 'Por favor, observa el video publicitario para completar el registro de visualización.'}
              </p>
            </div>
          </section>

          {/* --- NIVEL 3: ENCUESTA (DEBAJO DEL VIDEO) --- */}
          {!task.completada_hoy && surveyVisible && !isCorrect && (
            <section className="bg-white rounded-[2.5rem] p-8 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.15)] border-2 border-[#1a1f36]/5 animate-slideUp">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#1a1f36] flex items-center justify-center text-white shadow-lg">
                  <Play size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1a1f36] uppercase tracking-tighter">Validación de Marca</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">v3.0.0 - Reconstrucción Total</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(opt)}
                    className={`
                      w-full py-5 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border-2
                      ${selectedOption === opt 
                        ? 'bg-[#1a1f36] text-white border-[#1a1f36] shadow-xl translate-x-2' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-[#1a1f36]/30 hover:text-[#1a1f36]'}
                    `}
                  >
                    <span>{opt}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === opt ? 'border-white' : 'border-gray-200'}`}>
                      {selectedOption === opt && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </div>
                  </button>
                ))}
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={onConfirmResponse}
                disabled={!selectedOption || isSubmitting}
                className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verificando...' : 'Confirmar y Recibir Pago'}
              </button>
            </section>
          )}

          {/* --- NIVEL 4: ESTADOS DE ÉXITO --- */}
          {(task.completada_hoy || isCorrect) && (
            <section className="bg-white p-10 rounded-[3rem] border-4 border-[#00C853]/20 text-center animate-fade-in shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#00C853]" />
              
              <div className="w-20 h-20 bg-[#00C853] rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-[#00C853]/20 border-4 border-white">
                <Check className="text-white" size={40} strokeWidth={3} />
              </div>
              
              <h3 className="font-black text-[#1a1f36] text-xl uppercase mb-2 tracking-tighter">¡Tarea Completada!</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 italic">El pago se ha acreditado en tu billetera de activos.</p>
              
              <div className="bg-[#fcfcfc] py-4 px-8 rounded-3xl border border-gray-100 inline-block mb-8">
                <span className="text-4xl font-black text-[#1a1f36] tracking-tighter">+{task.recompensa}</span>
                <span className="text-sm font-black text-gray-400 ml-2 uppercase">BOB</span>
              </div>
              
              {isCorrect && videoFinished ? (
                <button 
                  onClick={() => navigate('/tareas')}
                  className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all animate-bounce"
                >
                  Finalizar y Volver
                </button>
              ) : (
                <p className="text-[9px] font-black text-[#1a1f36]/40 uppercase tracking-widest animate-pulse">
                  Espera a que el video finalice para salir...
                </p>
              )}
            </section>
          )}

        </div>
      </div>
    </Layout>
  );
}
