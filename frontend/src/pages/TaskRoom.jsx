import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { Play } from 'lucide-react';

export default function TaskRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tasks.list().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <Layout>
        <Header title="sala de tareas" />
        <div className="p-4 flex justify-center">
          <div className="animate-pulse text-gray-400">Cargando...</div>
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
            <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-sm rounded-xl border border-amber-100">
              {data.mensaje}
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
                    src={t.video_url || t.imagen_url || 'https://placehold.co/96x96?text=Video'}
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
