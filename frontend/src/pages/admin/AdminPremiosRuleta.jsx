import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminPremiosRuleta() {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await api.admin.premiosRuleta();
      setPremios(data);
      const h = await api.sorteo.historial();
      setHistorial(h.slice(0, 10)); // Solo los 10 más recientes
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sync10 = async () => {
    if (!confirm('Esto restablecerá la ruleta a 10 segmentos predeterminados. ¿Continuar?')) return;
    setLoading(true);
    try {
      // Necesitamos añadir esta función a la API
      const res = await api.post('/admin/premios-ruleta/sync-10');
      setPremios(res);
      alert('Ruleta sincronizada a 10 segmentos con éxito.');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizar = async (id, updates) => {
    try {
      const p = premios.find((x) => x.id === id);
      await api.admin.actualizarPremioRuleta(id, { ...p, ...updates });
      setPremios((prev) => prev.map((x) => (x.id === id ? { ...x, ...updates } : x)));
    } catch (e) {
      alert(e.message || 'Error');
    }
  };

  const totalProb = premios.reduce((s, p) => s + (parseFloat(p.probabilidad) || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1f36] uppercase tracking-tighter">Configuración Avanzada de Ruleta</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestiona los 10 segmentos, premios y probabilidades en tiempo real</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={sync10}
            disabled={loading}
            className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            Sincronizar 10 Segmentos
          </button>
        </div>
      </div>

      {/* Indicador de Probabilidad Total */}
      <div className={`p-6 rounded-[2rem] border-2 transition-all ${Math.abs(totalProb - 100) < 0.1 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${Math.abs(totalProb - 100) < 0.1 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Estado de Probabilidades</p>
              <p className="text-xl font-black tracking-tighter mt-1">Suma Total: {totalProb.toFixed(1)}%</p>
            </div>
          </div>
          {Math.abs(totalProb - 100) > 0.1 && (
            <p className="text-[10px] font-bold uppercase hidden md:block">⚠️ Se recomienda que la suma sea exactamente 100%</p>
          )}
        </div>
      </div>

      {/* Grid de Segmentos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {premios.map((p, idx) => (
          <div key={p.id} className={`group bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all relative overflow-hidden ${!p.activo ? 'opacity-60 grayscale' : ''}`}>
            {/* Numero de Segmento */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gray-50 flex items-center justify-center font-black text-gray-200 text-2xl italic group-hover:text-gray-100 transition-colors">
              {idx + 1}
            </div>

            <div className="space-y-6 relative">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer border-4 border-white"
                  style={{ backgroundColor: p.color || '#ddd' }}
                >
                  <input 
                    type="color" 
                    value={p.color || '#ddd'} 
                    onChange={(e) => actualizar(p.id, { color: e.target.value })}
                    className="opacity-0 absolute w-20 h-20 cursor-pointer"
                  />
                  <span className="text-white drop-shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.21 0 4-1.79 4-4.01 0-1.67-1.34-3.03-3-3.03Z"/></svg>
                  </span>
                </div>
                <div className="text-center">
                  <input 
                    type="text" 
                    defaultValue={p.nombre}
                    onBlur={(e) => actualizar(p.id, { nombre: e.target.value })}
                    className="bg-transparent text-center font-black text-[#1a1f36] uppercase tracking-tighter text-sm w-full outline-none focus:text-indigo-600 transition-colors"
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Nombre del Premio</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="w-1/2 pr-2">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Valor BOB</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      defaultValue={p.valor}
                      onBlur={(e) => actualizar(p.id, { valor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-black text-indigo-600 outline-none focus:ring-2 ring-indigo-100"
                    />
                  </div>
                  <div className="w-1/2 pl-2">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Prob. %</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      defaultValue={p.probabilidad}
                      onBlur={(e) => actualizar(p.id, { probabilidad: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-black text-emerald-600 outline-none focus:ring-2 ring-emerald-100"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => actualizar(p.id, { activo: !p.activo })}
                  className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${p.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  {p.activo ? '✓ Activo' : '✗ Inactivo'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historial de Ganadores */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-[#1a1f36] uppercase tracking-tighter">Ganadores Recientes</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Historial en vivo de la ruleta</p>
          </div>
          <button 
            onClick={cargarDatos}
            className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Premio</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historial.map((h) => (
                <tr key={h.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <span className="text-xs font-black text-gray-800 uppercase tracking-tighter">{h.usuario_masked || '****'}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{h.premios_ruleta?.nombre || 'Premio'}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-black text-emerald-600">{h.monto} BOB</span>
                  </td>
                  <td className="py-4 text-[10px] font-medium text-gray-400">
                    {new Date(h.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">No hay registros recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
