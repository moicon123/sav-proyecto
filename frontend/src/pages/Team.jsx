import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function TreeNode({ node, level = 0 }) {
  return (
    <div className="ml-2">
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs font-bold text-gray-500 w-8">{node.nivel_red}</span>
        <span className="text-sm font-medium">{node.nombre}</span>
        {node.nivel_red !== 'TU' && (
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
            {node.porcentaje_comision}%
          </span>
        )}
      </div>
      {node.children?.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-3">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.nivel_codigo !== 'internar') {
      api.users.team().then(setData).catch(() => setData(null));
    }
  }, [user]);

  if (user?.nivel_codigo === 'internar') {
    return (
      <Layout>
        <Header title="Informe del equipo" />
        <div className="p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Función no disponible</h2>
          <p className="text-gray-600">Como Pasante, aún no puedes invitar a otras personas. Por favor sube a S1 o superior para desbloquear esta función y empezar a ganar comisiones por equipo.</p>
        </div>
      </Layout>
    );
  }

  const resumen = data?.resumen || {};
  const analisis = data?.analisis || {};
  const niveles = data?.niveles || [];

  const totalAnalisis = (analisis.tarea || 0) + (analisis.invitacion || 0) + (analisis.inversion || 0) || 1;
  const p1 = ((analisis.tarea || 0) / totalAnalisis) * 100;
  const p2 = ((analisis.invitacion || 0) / totalAnalisis) * 100;
  const p3 = ((analisis.inversion || 0) / totalAnalisis) * 100;

  return (
    <Layout>
      <Header title="Informe del equipo" />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-green-600 text-white">
            <p className="text-sm opacity-90">Ingresos totales</p>
            <p className="text-2xl font-bold">{(resumen.ingresos_totales || 0).toFixed(2)} BOB</p>
          </div>
          <div className="p-5 rounded-2xl bg-green-600 text-white">
            <p className="text-sm opacity-90">Ingresos de hoy</p>
            <p className="text-2xl font-bold">{(resumen.ingresos_hoy || 0).toFixed(2)} BOB</p>
          </div>
        </div>

        <div className="bg-green-600 rounded-2xl p-4 text-white">
          <p className="font-semibold mb-3">Análisis de ingresos</p>
          <div className="h-4 w-full rounded-full overflow-hidden bg-white/20 flex">
            <div className="h-full bg-[#ff7a45]" style={{ width: `${p1}%` }} />
            <div className="h-full bg-[#ffd666]" style={{ width: `${p2}%` }} />
            <div className="h-full bg-[#ff4d4f]" style={{ width: `${p3}%` }} />
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span>Tarea</span>
            <span>Invitacion</span>
            <span>Inversion</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-medium text-green-700 mb-2">Número total de miembros del equipo: {resumen.total_miembros || 0}</p>
          <p className="text-gray-600 text-sm">Nuevos Miembros del Equipo: {resumen.nuevos_miembros || 0}</p>
          <div className="mt-4 space-y-2">
            {niveles.map((n) => (
              <div key={n.nivel} className="p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Datos de nivel {n.nivel}</span>
                  <span className="text-emerald-700 font-medium">{n.porcentaje}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                  <span>Miembros: {n.total_miembros}</span>
                  <span>Monto recarga: {n.monto_recarga.toFixed(2)}</span>
                  <span>Comisión: {n.porcentaje}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-semibold text-gray-800 mb-3">Árbol de invitados (por código de invitación)</p>
          {data?.tree ? <TreeNode node={data.tree} /> : <p className="text-sm text-gray-500">Sin datos</p>}
        </div>
      </div>
    </Layout>
  );
}
