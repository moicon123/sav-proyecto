import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { X } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canAnswer, setCanAnswer] = useState(false);

  useEffect(() => {
    api.tasks.get(id).then(setTask).catch(() => navigate('/tareas'));
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanAnswer(true);
    }
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const r = await api.tasks.responder(id, selected);
      setResult(r);
    } catch (e) {
      setResult({ correcta: false, error: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  const opciones = task.opciones || [task.respuesta_correcta];
  const showResult = result !== null;

  const renderVideo = () => {
    const url = task.video_url || '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return (
        <iframe
          className="w-full aspect-video"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      );
    }
    return (
      <video
        className="w-full aspect-video object-cover"
        src={url}
        controls
        autoPlay
        onEnded={() => setCanAnswer(true)}
      />
    );
  };

  return (
    <Layout>
      <Header title="Detalles de la tarea" />
      <div className="p-4">
        <div className="rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-lg border border-gray-200">
          {renderVideo()}
        </div>
        <p className="text-gray-500 text-sm mb-2">[Introducción a Anuncios]</p>
        <p className="bg-gray-100 rounded-xl p-3 text-gray-700 mb-4">
          {task.descripcion || 'Contenido del video.'}
        </p>
        <p className="font-medium text-gray-800 mb-2">Requisitos de la tarea</p>

        {!canAnswer && (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl border border-amber-100 mb-4 text-center">
            <p className="font-bold text-lg">Mira el video por {timeLeft} segundos más...</p>
          </div>
        )}

        {canAnswer && (
          !showResult ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-30">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
                <button
                  onClick={() => navigate('/tareas')}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-sav-accent flex items-center justify-center"
                >
                  <X className="text-sav-primary" size={20} />
                </button>
                <p className="text-gray-700 mb-4 pr-12">
                  {task.pregunta || 'Luego de ver el contenido del video, por favor responda qué marca se promociona.'}
                </p>
                <div className="space-y-3">
                  {opciones.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelected(opt)}
                      className={`w-full py-3 rounded-full font-semibold transition ${
                        selected === opt
                          ? 'bg-sav-accent text-sav-primary'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!selected || submitting}
                  className="w-full mt-6 py-3 rounded-full bg-sav-accent text-sav-primary font-semibold disabled:opacity-50"
                >
                  Enviar Respuesta
                </button>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-30">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                <p className={`text-lg font-bold ${result.correcta ? 'text-green-600' : 'text-gray-600'}`}>
                  {result.correcta ? '¡Correcto! +' + result.recompensa + ' BOB' : 'Respuesta incorrecta'}
                </p>
                <button
                  onClick={() => navigate('/tareas')}
                  className="mt-4 w-full py-3 rounded-full bg-sav-accent text-sav-primary font-semibold"
                >
                  Volver a tareas
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </Layout>
  );
}
