import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function Ganancias() {
  const [tab, setTab] = useState('recargas');
  const [recargas, setRecargas] = useState([]);
  const [retiros, setRetiros] = useState([]);

  useEffect(() => {
    api.recharges.list().then(setRecargas).catch(() => []);
    api.withdrawals.list().then(setRetiros).catch(() => []);
  }, []);

  const items = tab === 'recargas' ? recargas : retiros;
  const agruparPorAno = (lista) => {
    const porAno = {};
    lista.forEach((i) => {
      const ano = new Date(i.created_at).getFullYear();
      if (!porAno[ano]) porAno[ano] = [];
      porAno[ano].push(i);
    });
    return Object.entries(porAno).sort((a, b) => Number(b[0]) - Number(a[0]));
  };
  const grupos = agruparPorAno(items);

  const formatearEstado = (e) => {
    const map = { pendiente: '🟡 En revisión', aprobada: '🟢 Completado', rechazada: '🔴 Rechazado', pagado: '🟢 Pagado', rechazado: '🔴 Rechazado' };
    return map[e] || e;
  };

  return (
    <Layout>
      <Header title="Ganancias - Historial" />
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setTab('recargas')}
          className={`flex-1 py-4 font-medium ${tab === 'recargas' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
        >
          Recargas
        </button>
        <button
          onClick={() => setTab('retiros')}
          className={`flex-1 py-4 font-medium ${tab === 'retiros' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
        >
          Retiros
        </button>
      </div>
      <div className="p-4 space-y-6">
        {grupos.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No hay datos</p>
        ) : (
          grupos.map(([ano, lista]) => (
            <div key={ano}>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Año {ano}</h3>
              <div className="space-y-3">
                {lista.map((i) => (
                  <div key={i.id} className="flex justify-between items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-xs text-gray-500 font-mono">{i.id?.slice(0, 16)}</p>
                      <p className={`font-bold text-lg ${tab === 'retiros' ? 'text-orange-500' : 'text-sav-accent'}`}>
                        {tab === 'retiros' ? '-' : '+'}{i.monto?.toFixed(2)} BOB
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        {tab === 'recargas' ? 'Hacia Saldo Comisiones' : (i.tipo_billetera === 'comisiones' ? 'Desde Saldo Comisiones' : 'Desde Saldo Tareas')}
                      </p>
                      <p className="text-sm text-gray-500">{formatearEstado(i.estado)}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      {i.created_at ? new Date(i.created_at).toLocaleString('es') : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <p className="text-center text-gray-400 py-6 text-sm">No hay más datos</p>
      </div>
    </Layout>
  );
}
