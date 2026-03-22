import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function Raffle() {
  const [premios, setPremios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [oportunidades, setOportunidades] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [ganador, setGanador] = useState(null);

  useEffect(() => {
    api.sorteo.premios().then(setPremios).catch(() => []);
    api.sorteo.historial().then(setHistorial).catch(() => []);
    api.sorteo.oportunidades().then((r) => setOportunidades(r.oportunidades)).catch(() => setOportunidades(0));
  }, []);

  const girar = async () => {
    if (spinning || oportunidades <= 0) return;
    setSpinning(true);
    setGanador(null);
    try {
      const { premio, indice, oportunidades_restantes } = await api.sorteo.girar();
      setOportunidades(oportunidades_restantes);
      setHistorial((h) => [{ premio_nombre: premio.nombre, premio_valor: premio.valor, premio_color: premio.color, created_at: new Date().toISOString() }, ...h]);
      const total = premios.reduce((s, p) => s + (p.probabilidad || 0.1), 0) || 1;
      let prevAngle = 0;
      for (let i = 0; i < indice; i++) prevAngle += 360 * (premios[i]?.probabilidad || 0.1) / total;
      const segAngle = 360 * (premios[indice]?.probabilidad || 0.1) / total;
      const centerAngle = prevAngle + segAngle / 2;
      const destino = 360 * (5 + Math.random() * 2) + (360 - centerAngle);
      setRotation((r) => r + destino);
      setTimeout(() => {
        setSpinning(false);
        setGanador(premio);
      }, 4000);
    } catch (e) {
      setSpinning(false);
      setOportunidades((o) => Math.max(0, o - 1));
      alert(e.message || 'Error al girar');
    }
  };

  const totalProb = premios.reduce((s, p) => s + (p.probabilidad || 0.1), 0) || 1;

  return (
    <Layout>
      <Header title="Sorteo" rightAction={<span className="text-sav-accent text-sm font-medium">Reglas</span>} />
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-center mb-4 shadow-sm">
              <p className="text-amber-800 font-semibold">Oportunidades Restantes</p>
              <p className="text-2xl font-bold text-amber-600">{oportunidades}</p>
            </div>

            <div className="relative w-64 h-64 mx-auto mb-4">
              <div
                className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  boxShadow: '0 0 0 6px #fbbf24, 0 0 40px rgba(251,191,36,0.4)',
                }}
              >
                {premios.length > 0 && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {premios.map((s, i) => {
                      const prevAngle = premios.slice(0, i).reduce((a, p) => a + (360 * (p.probabilidad || 0.1) / totalProb), 0);
                      const segAngle = 360 * (s.probabilidad || 0.1) / totalProb;
                      const startAngle = prevAngle;
                      const endAngle = prevAngle + segAngle;
                      const r = 50;
                      const x1 = 50 + r * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 - r * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + r * Math.cos((endAngle * Math.PI) / 180);
                      const y2 = 50 - r * Math.sin((endAngle * Math.PI) / 180);
                      const big = segAngle > 180 ? 1 : 0;
                      const d = `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 ${big} 1 ${x2} ${y2} Z`;
                      return <path key={s.id} d={d} fill={s.color || '#999'} stroke="#fff" strokeWidth="1" />;
                    })}
                  </svg>
                )}
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-500 z-10" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <button
                  onClick={girar}
                  disabled={spinning || oportunidades <= 0}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white font-bold text-sm shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-4 border-amber-300"
                >
                  {spinning ? '...' : 'GO'}
                </button>
              </div>
            </div>

            {ganador && (
              <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-center mb-4">
                <p className="text-emerald-800 font-bold text-lg">¡Felicidades!</p>
                <p className="text-2xl font-bold text-emerald-600">{ganador.nombre} BOB</p>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <p className="font-bold text-gray-800 mb-3">Ganancias por color</p>
              <div className="space-y-2">
                {premios.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: p.color }} />
                      <span className="text-sm">{p.nombre}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{(p.probabilidad * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-bold text-gray-800 mb-3">Historial de sorteos</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historial.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: h.premio_color || '#999' }} />
                      <div>
                        <p className="font-medium text-sm">Felicitaciones {h.usuario_masked || '****' + (i + 1000)}</p>
                        <p className="text-xs text-gray-500">Recibir Premios</p>
                      </div>
                    </div>
                    <span className="font-bold text-orange-500">{h.premio_valor?.toFixed(2)} BOB</span>
                  </div>
                ))}
              </div>
              {historial.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No hay sorteos aún</p>}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 font-medium py-4">
          ¡EMPIEZA A GENERAR INGRESOS SOLO CON VER VIDEOS! 100% REAL
        </p>
      </div>
    </Layout>
  );
}
