import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { User, Shield, ArrowUpCircle } from 'lucide-react';

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [niveles, setNiveles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [u, n] = await Promise.all([api.admin.usuarios(), api.levels()]);
      setUsers(u);
      setNiveles(n);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeNivel = async (userId, nuevoNivelId) => {
    if (!confirm(`¿Estás seguro de cambiar el nivel del usuario a ${nuevoNivelId}?`)) return;
    try {
      await api.admin.updateUsuario(userId, { nivel_id: nuevoNivelId });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px] mt-1">Control total de miembros y niveles</p>
        </div>
        <div className="bg-sav-primary text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
          <User size={20} className="text-sav-accent" />
          <span className="font-bold">{users.length} Miembros</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Info Usuario</th>
                <th className="p-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Teléfono</th>
                <th className="p-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Nivel Actual</th>
                <th className="p-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Saldos</th>
                <th className="p-6 font-black text-gray-400 uppercase tracking-widest text-[10px] text-center">Acción Mecánica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sav-primary/5 flex items-center justify-center text-sav-primary font-black group-hover:bg-sav-primary group-hover:text-white transition-all">
                        {u.nombre_usuario?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-sm uppercase tracking-tighter">{u.nombre_usuario}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{u.rol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-bold text-gray-600">{u.telefono}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        u.nivel_id === 'l1' ? 'bg-slate-100 text-slate-600' : 'bg-sav-accent/20 text-sav-primary'
                      }`}>
                        {niveles.find(n => n.id === u.nivel_id)?.nombre || u.nivel_id}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <p className="text-[10px] font-black text-gray-700">Tareas: <span className="text-emerald-600">{(u.saldo_principal || 0).toFixed(2)}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <p className="text-[10px] font-black text-gray-700">Comis: <span className="text-blue-600">{(u.saldo_comisiones || 0).toFixed(2)}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-2">
                      <select 
                        value={u.nivel_id} 
                        onChange={(e) => handleChangeNivel(u.id, e.target.value)}
                        className="bg-gray-50 border-2 border-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2.5 focus:border-sav-accent outline-none transition-all cursor-pointer"
                      >
                        {niveles.map(n => (
                          <option key={n.id} value={n.id}>{n.nombre} ({n.costo} BOB)</option>
                        ))}
                      </select>
                      <div className="w-8 h-8 rounded-xl bg-sav-accent/10 flex items-center justify-center text-sav-primary">
                        <ArrowUpCircle size={18} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">No hay usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
