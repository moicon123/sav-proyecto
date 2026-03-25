import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Save, RefreshCw, Star } from 'lucide-react';

export default function AdminPremiosRuletaEspecial() {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Necesitaremos estos endpoints en api.js
      const data = await api.get('/admin/premios-ruleta-especial');
      setPremios(data);
      const h = await api.get('/sorteo/historial-especial');
      setHistorial(h.slice(0, 10));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sync10 = async () => {
    if (!confirm('Esto restablecerá la ruleta especial a 10 segmentos predeterminados. ¿Continuar?')) return;
    setLoading(true);
    try {
      const res = await api.post('/admin/premios-ruleta-especial/sync-10');
      setPremios(res);
      alert('Ruleta especial sincronizada con éxito.');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalUpdate = (id, updates) => {
    setPremios((prev) => prev.map((x) => (x.id === id ? { ...x, ...updates } : x)));
  };

  const guardarTodo = async () => {
    setSaving(true);
    try {
      for (const p of premios) {
        await api.put(`/admin/premios-ruleta-especial/${p.id}`, p);
      }
      alert('✅ Cambios en la Ruleta Especial guardados con éxito.');
    } catch (e) {
      alert('❌ Error al guardar: ' + (e.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const agregar = async () => {
    try {
      const p = await api.post('/admin/premios-ruleta-especial', {
        nombre: 'Nuevo Premio Especial',
        valor: 0,
        color: '#6366f1',
        probabilidad: 0,
        orden: premios.length
      });
      setPremios((prev) => [...prev, p]);
    } catch (e) {
      alert(e.message || 'Error');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este premio?')) return;
    try {
      await api.delete(`/admin/premios-ruleta-especial/${id}`);
      setPremios((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message || 'Error');
    }
  };

  const totalProb = premios.reduce((s, p) => s + (parseFloat(p.probabilidad) || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Star className="text-indigo-600 fill-indigo-600" size={24} />
            <h1 className="text-3xl font-black text-[#1a1f36] uppercase tracking-tighter">Ruleta Especial (Admin)</h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Configuración exclusiva para la segunda ruleta del sistema</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={agregar} className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
            <Plus size={14} /> Agregar Segmento
          </button>
          <button onClick={guardarTodo} disabled={saving || loading} className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${saving ? 'bg-gray-400' : 'bg-[#1a1f36] text-white hover:scale-105 active:scale-95 shadow-indigo-200'}`}>
            {saving ? <RefreshCw className="animate-spin" size={12} /> : <Save size={14} />} {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button onClick={sync10} disabled={loading} className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sincronizar 10
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-[2rem] border-2 transition-all ${Math.abs(totalProb - 100) < 0.1 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${Math.abs(totalProb - 100) < 0.1 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Estado de Probabilidades</p>
              <p className="text-xl font-black tracking-tighter mt-1">Suma Total: {totalProb.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {premios.map((p, idx) => (
          <div key={p.id} className={`group bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all relative overflow-hidden ${!p.activo ? 'opacity-60 grayscale' : ''}`}>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gray-50 flex items-center justify-center font-black text-gray-200 text-2xl italic">{idx + 1}</div>
            <div className="space-y-6 relative">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer border-4 border-white" style={{ backgroundColor: p.color || '#ddd' }}>
                  <input type="color" value={p.color || '#ddd'} onChange={(e) => handleLocalUpdate(p.id, { color: e.target.value })} className="opacity-0 absolute w-20 h-20 cursor-pointer" />
                </div>
                <div className="text-center">
                  <input type="text" value={p.nombre} onChange={(e) => handleLocalUpdate(p.id, { nombre: e.target.value })} className="bg-transparent text-center font-black text-[#1a1f36] uppercase tracking-tighter text-sm w-full outline-none focus:text-indigo-600" />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="w-1/2 pr-2">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Valor BOB</label>
                    <input type="number" step="0.01" value={p.valor} onChange={(e) => handleLocalUpdate(p.id, { valor: e.target.value })} onBlur={(e) => handleLocalUpdate(p.id, { valor: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-black text-indigo-600 outline-none" />
                  </div>
                  <div className="w-1/2 pl-2">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Prob. %</label>
                    <input type="number" step="0.1" value={p.probabilidad} onChange={(e) => handleLocalUpdate(p.id, { probabilidad: e.target.value })} onBlur={(e) => handleLocalUpdate(p.id, { probabilidad: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-black text-emerald-600 outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleLocalUpdate(p.id, { activo: !p.activo })} className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${p.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {p.activo ? '✓ Activo' : '✗ Inactivo'}
                  </button>
                  <button onClick={() => eliminar(p.id)} className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
