import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { Play, TrendingUp } from 'lucide-react';

export default function TaskRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = () => {
    setLoading(true);
    setError(null);
    api.tasks.list()
      .then(setData)
      .catch((err) => {
        console.error('Error cargando tareas:', err);
        setError(err.message || 'No se pudieron cargar las tareas. Intentalo de nuevo.');
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
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-sav-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-[10px]">Cargando tareas...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <Header title="sala de tareas" />
        <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-500/10 border border-rose-100">
            <TrendingUp size={40} className="rotate-180" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Ocurrió un error</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
              {error || 'No se pudo conectar con el servidor.'}
            </p>
          </div>
          <button 
            onClick={fetchTasks}
            className="px-8 py-4 rounded-2xl bg-sav-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  const total = data.tareas_completadas + data.tareas_restantes || 1;
  const progress = total ? (data.tareas_completadas / total) * 100 : 0;

  return (
    <Layout>
      <Header title="sala de tareas" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{data.nivel}</h2>
          <p className="text-gray-500 text-sm mt-1">
            restantes {data.tareas_restantes} · completadas {data.tareas_completadas}
          </p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {data.mensaje && (
            <div className="mt-6 p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[2rem] shadow-lg shadow-orange-500/20 relative overflow-hidden group">
              <div className="absolute -right-5 -top-5 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Aviso Importante</p>
                  <p className="text-sm font-black leading-relaxed">{data.mensaje}</p>
                </div>
              </div>
              <Link 
                to="/vip"
                className="mt-4 w-full py-3 bg-white text-orange-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Subir de Nivel Ahora
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {data.tareas.length > 0 ? (
            data.tareas.map((t) => (
              <Link
                key={t.id}
                to={`/tareas/${t.id}`}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                  <img
                    src={t.video_url || t.imagen_url || '/imag/logo.jpeg'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="text-white" size={32} fill="white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-teal-500 text-white text-xs font-medium">
                    {t.nivel}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">Precio de recompensa</p>
                  <p className="text-sav-accent font-bold">+{t.recompensa} BOB</p>
                </div>
              </Link>
            ))
          ) : (
            !data.mensaje && (
              <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400">No hay tareas disponibles por hoy.</p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
