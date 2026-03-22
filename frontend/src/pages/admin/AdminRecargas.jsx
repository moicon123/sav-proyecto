import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function AdminRecargas() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.admin.recargas().then(setList).catch(() => []);
  }, []);

  const handleAprobar = async (id) => {
    await api.admin.aprobarRecarga(id);
    setList((l) => l.map((r) => (r.id === id ? { ...r, estado: 'aprobada' } : r)));
  };

  const handleRechazar = async (id) => {
    await api.admin.rechazarRecarga(id);
    setList((l) => l.map((r) => (r.id === id ? { ...r, estado: 'rechazada' } : r)));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Recargas</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Monto</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-4 text-sm text-gray-500">{r.id?.slice(0, 8)}</td>
                <td className="p-4 font-medium">{r.monto} BOB</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    r.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                    r.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.estado}
                  </span>
                </td>
                <td className="p-4 text-sm">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                <td className="p-4">
                  {r.estado === 'pendiente' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAprobar(r.id)} className="px-3 py-1 rounded bg-green-500 text-white text-sm">Aprobar</button>
                      <button onClick={() => handleRechazar(r.id)} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-gray-500">No hay recargas</p>}
      </div>
    </div>
  );
}
