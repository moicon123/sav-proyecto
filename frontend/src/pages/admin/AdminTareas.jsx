import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function AdminTareas() {
  const [tareas, setTareas] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: '',
    nivel_id: '',
    video_url: '',
    respuesta_correcta: '',
    opciones: '',
    recompensa: 0
  });

  useEffect(() => {
    Promise.all([
      api.admin.tareas(),
      api.levels.list()
    ]).then(([t, n]) => {
      setTareas(t.map(item => ({ ...item, opciones: Array.isArray(item.opciones) ? item.opciones.join(', ') : item.opciones })));
      setNiveles(n);
      if (n.length > 0) setForm(f => ({ ...f, nivel_id: n[0].id }));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        opciones: form.opciones.split(',').map(o => o.trim()).filter(o => o) 
      };
      const nueva = await api.admin.crearTarea(payload);
      setTareas([...tareas, { ...nueva, opciones: nueva.opciones.join(', ') }]);
      setForm({ ...form, nombre: '', video_url: '', respuesta_correcta: '', opciones: '', recompensa: 0 });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.admin.eliminarTarea(id);
      setTareas(tareas.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = { 
        ...editing, 
        opciones: typeof editing.opciones === 'string' ? editing.opciones.split(',').map(o => o.trim()).filter(o => o) : editing.opciones 
      };
      const updated = await api.admin.actualizarTarea(editing.id, payload);
      setTareas(tareas.map(t => t.id === updated.id ? { ...updated, opciones: updated.opciones.join(', ') } : t));
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Tareas</h1>

      {/* Formulario Crear */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="font-semibold mb-4">Nueva Tarea</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nombre de la tarea"
            className="px-4 py-2 rounded-xl border"
            value={form.nombre}
            onChange={e => setForm({...form, nombre: e.target.value})}
            required
          />
          <select
            className="px-4 py-2 rounded-xl border"
            value={form.nivel_id}
            onChange={e => setForm({...form, nivel_id: e.target.value})}
          >
            {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
          </select>
          <input
            type="url"
            placeholder="URL del video (YouTube/Vimeo)"
            className="px-4 py-2 rounded-xl border"
            value={form.video_url}
            onChange={e => setForm({...form, video_url: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Opciones (separadas por coma)"
            className="px-4 py-2 rounded-xl border"
            value={form.opciones}
            onChange={e => setForm({...form, opciones: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Respuesta Correcta"
            className="px-4 py-2 rounded-xl border"
            value={form.respuesta_correcta}
            onChange={e => setForm({...form, respuesta_correcta: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Recompensa (BOB)"
            className="px-4 py-2 rounded-xl border"
            value={form.recompensa}
            onChange={e => setForm({...form, recompensa: parseFloat(e.target.value)})}
            required
          />
          <button type="submit" className="bg-sav-accent text-sav-primary font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2">
            <Plus size={20} /> Crear Tarea
          </button>
        </form>
      </div>

      {/* Lista de Tareas */}
      <div className="grid gap-4">
        {tareas.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            {editing?.id === t.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  className="px-4 py-1 rounded-lg border"
                  value={editing.nombre}
                  onChange={e => setEditing({...editing, nombre: e.target.value})}
                />
                <select
                  className="px-4 py-1 rounded-lg border"
                  value={editing.nivel_id}
                  onChange={e => setEditing({...editing, nivel_id: e.target.value})}
                >
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
                <input
                  type="text"
                  className="px-4 py-1 rounded-lg border"
                  value={editing.video_url}
                  onChange={e => setEditing({...editing, video_url: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Opciones (separadas por coma)"
                  className="px-4 py-1 rounded-lg border"
                  value={editing.opciones}
                  onChange={e => setEditing({...editing, opciones: e.target.value})}
                />
                <input
                  type="text"
                  className="px-4 py-1 rounded-lg border"
                  value={editing.respuesta_correcta}
                  onChange={e => setEditing({...editing, respuesta_correcta: e.target.value})}
                />
                <input
                  type="number"
                  className="px-4 py-1 rounded-lg border"
                  value={editing.recompensa}
                  onChange={e => setEditing({...editing, recompensa: parseFloat(e.target.value)})}
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="bg-green-500 text-white p-2 rounded-lg"><Save size={20}/></button>
                  <button onClick={() => setEditing(null)} className="bg-gray-400 text-white p-2 rounded-lg"><X size={20}/></button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={t.video_url} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/64x64?text=Video'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{t.nombre}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        {niveles.find(n => n.id === t.nivel_id)?.nombre || 'Nivel desconocido'}
                      </span>
                      <span className="text-xs bg-sav-accent/20 text-sav-primary px-2 py-0.5 rounded-full">
                        +{t.recompensa} BOB
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-500">Respuesta correcta:</p>
                    <p className="text-sm font-medium">{t.respuesta_correcta}</p>
                    <p className="text-[10px] text-gray-400">Opciones: {t.opciones}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
