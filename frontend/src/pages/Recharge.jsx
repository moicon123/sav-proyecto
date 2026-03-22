import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { isScheduleOpen } from '../lib/schedule';

export default function Recharge() {
  const { user } = useAuth();
  const [metodos, setMetodos] = useState([]);
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pc, setPc] = useState(null);

  useEffect(() => {
    api.recharges.metodos().then(setMetodos).catch(() => setMetodos([]));
    api.publicContent().then(setPc).catch(() => {});
  }, []);

  const saldo = (user?.saldo_principal ?? 0) + (user?.saldo_comisiones ?? 0);
  const horarioRec = pc?.horario_recarga;
  const schedRec = horarioRec ? isScheduleOpen(horarioRec) : { ok: true };
  const fueraHorario = horarioRec?.enabled && !schedRec.ok;
  const msgHorario = !schedRec.ok ? schedRec.message : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.recharges.create({
        monto: parseFloat(monto) || 0,
        modo: 'Compra VIP',
      });
      alert('Solicitud enviada. Pendiente de aprobación.');
      setMonto('');
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Recargar" />
      <div className="p-4">
        {error && <div className="mb-4 p-3 rounded-xl bg-gray-800 text-white text-sm">{error}</div>}
        {horarioRec?.enabled && fueraHorario && (
          <div className="mb-4 p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-sm">
            <strong>Intento de recargar fuera del horario.</strong> {msgHorario}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-gray-600">Saldo visible (tareas + comisiones)</p>
          <p className="text-2xl font-bold text-sav-accent">{saldo.toFixed(2)} BOB</p>
          <p className="text-xs text-gray-500 mt-2">
            El monedero principal solo suma ganancias de tareas; el de comisiones, invitados. La recarga VIP no suma al principal.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Monto (BOB)</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
              placeholder="200"
              required
            />
          </div>
          {metodos.length > 0 && (
            <div>
              <p className="font-medium mb-2">Método de pago</p>
              {metodos.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border mb-2">
                  <p className="font-medium">{m.nombre_titular}</p>
                  {(m.imagen_base64 || m.imagen_qr_url) && (
                    <img src={m.imagen_base64 || m.imagen_qr_url} alt="QR" className="mt-2 w-32 h-32 object-contain" />
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || (horarioRec?.enabled && fueraHorario)}
            className="w-full py-4 rounded-full bg-sav-accent text-white font-bold disabled:opacity-50"
          >
            Enviar solicitud
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          <Link to="/seguridad" className="text-sav-accent">Seguridad</Link>
          {' · '}
          Horarios: {horarioRec?.enabled ? `${horarioRec.hora_inicio} – ${horarioRec.hora_fin}` : 'sin restricción'}
        </p>
      </div>
    </Layout>
  );
}
