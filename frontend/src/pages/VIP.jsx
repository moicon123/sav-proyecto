import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Logo from '../components/Logo';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function VIP() {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    api.levels.ganancias().then(setLevels).catch(() => setLevels([]));
  }, []);

  return (
    <Layout>
      <Header title="Ganancias" />
      <div className="bg-sav-dark rounded-b-3xl pb-8 -mb-4">
        <div className="flex flex-col items-center py-6">
          <div className="mb-2">
            <Logo variant="hero" />
          </div>
          <h2 className="text-sav-mint font-bold text-lg text-center px-4">
            DETALLES DE INGRESOS DE GRADO DE EMPLEADO (BOB)
          </h2>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-emerald-400">
          <thead>
            <tr className="bg-sav-dark text-white border-b-2 border-emerald-400">
              <th className="p-2 text-left">Nivel</th>
              <th className="p-2 text-right">Depósito</th>
              <th className="p-2 text-right">Ingreso diario</th>
              <th className="p-2 text-right">Tareas</th>
              <th className="p-2 text-right">Comisión</th>
              <th className="p-2 text-right">Mensual</th>
              <th className="p-2 text-right">Anual</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l, i) => (
              <tr key={l.id} className={`${i % 2 === 0 ? 'bg-emerald-50' : 'bg-white'} border-b border-emerald-200`}>
                <td className="p-2 font-medium">{l.nombre}</td>
                <td className="p-2 text-right">{l.deposito ? l.deposito.toFixed(2) : '—'}</td>
                <td className="p-2 text-right">{l.ingreso_diario?.toFixed(2) || '—'}</td>
                <td className="p-2 text-right">{l.num_tareas_diarias || '—'}</td>
                <td className="p-2 text-right">{l.comision_por_tarea?.toFixed(2) || '—'}</td>
                <td className="p-2 text-right">{l.ingreso_mensual ? l.ingreso_mensual.toFixed(2) : '—'}</td>
                <td className="p-2 text-right">{l.ingreso_anual ? l.ingreso_anual.toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
