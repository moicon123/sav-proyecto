import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminPremiosRuleta() {
  const [premios, setPremios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [valor, setValor] = useState('');
  const [color, setColor] = useState('#f59e0b');
  const [probabilidad, setProbabilidad] = useState('0.1');

  useEffect(() => {
    api.admin.premiosRuleta().then(setPremios).catch(() => []);
  }, []);

  const agregar = async () => {
    try {
      const p = await api.admin.crearPremioRuleta({
        nombre: nombre || 'Premio',
        valor: parseFloat(valor) || 0,
        color: color || '#f59e0b',
        probabilidad: parseFloat(probabilidad) || 0.1,
      });
      setPremios((prev) => [...prev, p]);
      setNombre('');
      setValor('');
      setColor('#f59e0b');
      setProbabilidad('0.1');
    } catch (e) {
      alert(e.message || 'Error');
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

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este premio?')) return;
    await api.admin.eliminarPremioRuleta(id);
    setPremios((prev) => prev.filter((p) => p.id !== id));
  };

  const totalProb = premios.reduce((s, p) => s + (p.probabilidad || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Premios de la Ruleta</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px] mt-1">Configura los premios y probabilidades del sorteo</p>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Agregar nuevo premio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nombre</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Ej. 0.50 BOB" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-50 text-gray-800 font-bold text-sm focus:border-sav-primary/20 transition-all outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Valor (Saldo)</label>
            <input 
              type="number" 
              step="0.01" 
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              placeholder="0.50" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-50 text-gray-800 font-bold text-sm focus:border-sav-primary/20 transition-all outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Color</label>
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3.5 border-2 border-gray-50">
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent" 
              />
              <span className="text-xs font-bold text-gray-500 uppercase">{color}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Probabilidad (0-1)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="1" 
              value={probabilidad} 
              onChange={(e) => setProbabilidad(e.target.value)} 
              placeholder="0.1" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-50 text-gray-800 font-bold text-sm focus:border-sav-primary/20 transition-all outline-none" 
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button 
              onClick={agregar} 
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#1a1f36] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#1a1f36]/20 active:scale-[0.98] transition-all"
            >
              <Plus size={18} /> Registrar Premio
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Premios actuales</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${Math.abs(totalProb - 1) < 0.01 ? 'bg-green-500' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-black text-gray-500 uppercase">Probabilidad: {(totalProb * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {premios.map((p) => (
            <div key={p.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col gap-4 relative">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl shrink-0 shadow-inner" 
                  style={{ backgroundColor: p.color || '#999' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 text-sm uppercase tracking-tighter truncate">{p.nombre}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.probabilidad * 100}% de probabilidad</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Color</span>
                  <input 
                    type="color" 
                    value={p.color || '#999'} 
                    onChange={(e) => actualizar(p.id, { color: e.target.value })} 
                    className="w-full h-8 rounded-lg cursor-pointer border-0 p-0" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Valor</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    defaultValue={p.valor} 
                    onBlur={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v !== p.valor) actualizar(p.id, { valor: v }); }} 
                    className="w-full h-8 px-2 rounded-lg border border-gray-100 text-[10px] font-bold" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Prob.</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="1" 
                    defaultValue={p.probabilidad} 
                    onBlur={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v !== p.probabilidad) actualizar(p.id, { probabilidad: v }); }} 
                    className="w-full h-8 px-2 rounded-lg border border-gray-100 text-[10px] font-bold" 
                  />
                </div>
              </div>

              <button 
                onClick={() => eliminar(p.id)} 
                className="absolute top-4 right-4 p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
