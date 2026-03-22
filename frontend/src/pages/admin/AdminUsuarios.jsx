import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.admin.usuarios().then(setUsers).catch(() => []);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Usuario</th>
              <th className="p-4 text-left">Teléfono</th>
              <th className="p-4 text-left">Nivel</th>
              <th className="p-4 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{u.nombre_usuario}</td>
                <td className="p-4">{u.telefono}</td>
                <td className="p-4">{u.nivel}</td>
                <td className="p-4 text-right font-medium">{(u.saldo_principal || 0).toFixed(2)} BOB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
