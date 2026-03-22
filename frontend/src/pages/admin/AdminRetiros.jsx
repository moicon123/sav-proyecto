import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function AdminRetiros() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.admin.retiros().then(setList).catch(() => []);
  }, []);

  const handleAprobar = async (id) => {
    await api.admin.aprobarRetiro(id);
    setList((l) => l.map((r) => (r.id === id ? { ...r, estado: 'pagado' } : r)));
  };

  const handleRechazar = async (id) => {
    await api.admin.rechazarRetiro(id);
    setList((l) => l.map((r) => (r.id === id ? { ...r, estado: 'rechazado' } : r)));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Retiros</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Monto</th>
              <th className="p-4 text-left">QR</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-4 text-sm text-gray-500">{r.id?.slice(0, 8)}</td>
                <td className="p-4 font-medium text-sav-accent">{r.monto} BOB</td>
                <td className="p-2">{r.qr_retiro ? <img src={r.qr_retiro} alt="QR" className="w-12 h-12 object-contain rounded" /> : '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    r.estado === 'pagado' ? 'bg-green-100 text-green-700' :
                    r.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
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
        {list.length === 0 && <p className="p-8 text-center text-gray-500">No hay retiros</p>}
      </div>
    </div>
  );
}
