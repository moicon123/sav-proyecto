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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Premios de la Ruleta</h1>
      <p className="text-gray-600 mb-6">Configura los premios, colores y probabilidades. La suma de probabilidades debería ser 1 (100%).</p>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="font-semibold mb-4">Agregar premio</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="0.01 BOB" className="px-4 py-2 rounded-xl border" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Valor</label>
            <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.01" className="px-4 py-2 rounded-xl border" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Probabilidad (0-1)</label>
            <input type="number" step="0.01" min="0" max="1" value={probabilidad} onChange={(e) => setProbabilidad(e.target.value)} placeholder="0.1" className="px-4 py-2 rounded-xl border" />
          </div>
          <button onClick={agregar} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#1a1f36] text-white font-bold shadow-lg active:scale-95 transition-all">
            <Plus size={20} /> Agregar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Color</th>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Valor</th>
              <th className="p-4 text-left">Probabilidad</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {premios.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-4">
                  <input type="color" value={p.color || '#999'} onChange={(e) => actualizar(p.id, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                </td>
                <td className="p-4">
                  <input type="text" defaultValue={p.nombre} onBlur={(e) => { const v = e.target.value; if (v !== p.nombre) actualizar(p.id, { nombre: v }); }} className="px-2 py-1 rounded border w-24" />
                </td>
                <td className="p-4">
                  <input type="number" step="0.01" defaultValue={p.valor} onBlur={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v !== p.valor) actualizar(p.id, { valor: v }); }} className="px-2 py-1 rounded border w-20" />
                </td>
                <td className="p-4">
                  <input type="number" step="0.01" min="0" max="1" defaultValue={p.probabilidad} onBlur={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v !== p.probabilidad) actualizar(p.id, { probabilidad: v }); }} className="px-2 py-1 rounded border w-20" />
                </td>
                <td className="p-4">
                  <button onClick={() => eliminar(p.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="p-4 text-sm text-gray-600">Total probabilidad: {(totalProb * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}
