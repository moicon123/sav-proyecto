import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Send } from 'lucide-react';

export default function AdminRecargas() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.admin.recargas().then(setList).catch(() => []);
  }, []);

  const handleAprobar = async (id) => {
    if (!confirm('¿Seguro que quieres aprobar esta recarga?')) return;
    try {
      await api.admin.aprobarRecarga(id);
      setList((l) => l.map((r) => (r.id === id ? { ...r, estado: 'aprobada' } : r)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = prompt('Motivo del rechazo:');
    if (motivo === null) return;
    try {
      await api.admin.rechazarRecarga(id, motivo);
      setList((l) => l.map((r) => (r.id === id ? { ...r, estado: 'rechazada' } : r)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Recargas</h1>
        <a 
          href="https://t.me/BotFather" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
        >
          <Send size={18} /> Configurar Bot Telegram
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Usuario / ID</th>
              <th className="p-4 font-semibold text-gray-600">Monto</th>
              <th className="p-4 font-semibold text-gray-600">Comprobante</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600">Fecha</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">{r.usuario_id?.slice(0, 8)}...</div>
                  <div className="text-xs text-gray-500">{r.modo}</div>
                </td>
                <td className="p-4 font-bold text-sav-primary">{r.monto} BOB</td>
                <td className="p-4">
                  {r.comprobante_url ? (
                    <a href={r.comprobante_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm font-medium">Ver Imagen</a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Sin imagen</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    r.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                    r.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {r.estado}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-4">
                  {r.estado === 'pendiente' && (
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => handleAprobar(r.id)} className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition shadow-sm">Aprobar</button>
                      <button onClick={() => handleRechazar(r.id)} className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition shadow-sm">Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Send size={24} />
            </div>
            <p className="text-gray-500 font-medium">No hay recargas registradas aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
