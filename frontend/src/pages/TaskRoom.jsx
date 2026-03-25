import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { Play, TrendingUp, Info } from 'lucide-react';

export default function TaskRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = () => {
    setLoading(true);
    setError(null);
    api.tasks.list()
      .then(res => {
        // Barajar las tareas aleatoriamente (Fisher-Yates shuffle)
        if (res && res.tareas) {
          const shuffledTasks = [...res.tareas];
          for (let i = shuffledTasks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledTasks[i], shuffledTasks[j]] = [shuffledTasks[j], shuffledTasks[i]];
          }
          res.tareas = shuffledTasks;
        }
        setData(res);
      })
      .catch((err) => {
        console.error('Error cargando tareas:', err);
        setError(err.message || 'No se pudieron cargar las tareas. Inténtalo de nuevo.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Header title="sala de tareas" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white">
          <div className="w-12 h-12 border-4 border-[#1a1f36] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-[10px]">Cargando tareas...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    const isWeekend = error?.includes('lunes a viernes') || data?.es_fin_de_semana;

    return (
      <Layout>
        <Header title="sala de tareas" />
        <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[60vh] bg-white">
          <div className={`w-20 h-20 ${isWeekend ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'} rounded-[2rem] flex items-center justify-center shadow-xl border ${isWeekend ? 'border-amber-100' : 'border-rose-100'}`}>
            {isWeekend ? <Info size={40} /> : <TrendingUp size={40} className="rotate-180" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#1a1f36] uppercase tracking-tighter">
              {isWeekend ? 'Fin de Semana' : 'Ocurrió un error'}
            </h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
              {error || 'No se pudo conectar con el servidor.'}
            </p>
          </div>
          {!isWeekend && (
            <button 
              onClick={fetchTasks}
              className="px-8 py-4 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
            >
              Reintentar
            </button>
          )}
        </div>
      </Layout>
    );
  }

  const total = data.tareas_completadas + data.tareas_restantes || 1;
  const progress = total ? (data.tareas_completadas / total) * 100 : 0;

  return (
    <Layout>
      <Header title="sala de tareas" />
      {/* Pre-carga de videos para mejorar la velocidad de carga al entrar en detalles */}
      <div className="hidden">
        {data.tareas.map(t => (
          <video key={t.id} src={api.getMediaUrl(t.video_url)} preload="auto" muted />
        ))}
      </div>
      <div className="p-4 space-y-4 bg-white min-h-screen">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black text-[#1a1f36] uppercase tracking-tight">{data.nivel}</h2>
            <div className="px-3 py-1 bg-[#00C853]/10 text-[#00C853] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00C853]/10">
              Estado: Activo
            </div>
          </div>
          
          <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2 px-1 uppercase tracking-widest">
            <span>completadas {data.tareas_completadas}</span>
            <span>restantes {data.tareas_restantes}</span>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
            <div
              className="h-full bg-gradient-to-r from-[#1a1f36] to-[#2a2f46] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {data.mensaje && (
            <div className="mt-6 p-5 bg-gray-50 text-[#1a1f36] rounded-2xl shadow-inner border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#1a1f36]/5 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="flex items-start gap-3 relative z-10">
                <TrendingUp className="text-[#1a1f36] shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Aviso del sistema</p>
                  <p className="text-sm font-medium leading-relaxed text-gray-600">{data.mensaje}</p>
                </div>
              </div>
              <Link 
                to="/vip"
                className="mt-5 w-full py-4 bg-[#1a1f36] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Subir de Nivel Ahora
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-3 pb-24">
          {data.tareas.length > 0 ? (
            data.tareas.map((t) => (
              <Link
                key={t.id}
                to={`/tareas/${t.id}`}
                className="flex gap-4 p-3 bg-white rounded-[1.5rem] border border-gray-100 shadow-lg active:scale-[0.98] transition-all group"
              >
                <div className="w-24 h-24 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden relative border border-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/imag/logo.jpeg" alt="" className="w-12 h-12 object-contain grayscale" />
                  </div>
                  <img
                    src={t.video_url || t.imagen_url || '/imag/logo.jpeg'}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-10"
                    onError={(e) => { e.target.src = '/imag/logo.jpeg'; }}
                  />
                  {/* Overlay con Logo y Play */}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1a1f36]/20 group-hover:bg-[#1a1f36]/40 transition-colors z-20">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <Play className="text-white ml-1" size={24} fill="white" />
                    </div>
                  </div>
                  {/* Logo de la plataforma en la esquina del thumbnail */}
                  <div className="absolute bottom-1 right-1 w-7 h-7 rounded-lg overflow-hidden border border-white/20 shadow-lg bg-white/80 backdrop-blur-sm z-30">
                    <img src="/imag/logo.jpeg" alt="SAV" className="w-full h-full object-cover opacity-80" />
                  </div>
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#1a1f36]/5 text-[#1a1f36] text-[9px] font-black uppercase tracking-widest border border-[#1a1f36]/10">
                        {t.nivel}
                      </span>
                      <p className="text-[#1a1f36] font-black text-sm tracking-tight">+{t.recompensa} BOB</p>
                    </div>
                    <p className="text-gray-500 text-[9px] font-medium line-clamp-2 italic leading-tight mt-1">
                      {t.descripcion || 'No description available for this task.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em]">Verify content</p>
                    <div className="flex items-center gap-1 text-[#00C853]">
                      <div className="w-1 h-1 bg-[#00C853] rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase">Online</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            !data.mensaje && (
              <div className="text-center p-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No hay tareas disponibles por hoy.</p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
