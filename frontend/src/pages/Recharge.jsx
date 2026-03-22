import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { isScheduleOpen } from '../lib/schedule';
import { Upload, CheckCircle2 } from 'lucide-react';

export default function Recharge() {
  const { user } = useAuth();
  const location = useLocation();
  const fileRef = useRef(null);
  const [metodos, setMetodos] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [monto, setMonto] = useState('');
  const [modo, setModo] = useState('Recarga Saldo');
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pc, setPc] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.recharges.metodos().then(setMetodos).catch(() => setMetodos([]));
    api.levels.list().then(setNiveles).catch(() => []);
    api.publicContent().then(setPc).catch(() => {});

    // Si viene de VIP, pre-llenar monto y modo
    if (location.state?.monto) {
      setMonto(location.state.monto.toString());
    }
    if (location.state?.modo) {
      setModo(location.state.modo);
    }
  }, [location.state]);

  const selectLevel = (nivel) => {
    setMonto((nivel.deposito || nivel.costo).toString());
    setModo('Compra VIP');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setComprobante(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comprobante) {
      setError('Por favor sube el comprobante de pago');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.recharges.create({
        monto: parseFloat(monto) || 0,
        comprobante_url: comprobante,
        modo: modo,
      });
      setSuccess(true);
      setMonto('');
      setComprobante(null);
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <Header title="Recargar" />
        <div className="p-8 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">¡Solicitud Enviada!</h2>
          <p className="text-gray-600">Tu recarga está siendo procesada. El saldo se reflejará una vez aprobada por el administrador.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="mt-4 w-full py-4 rounded-full bg-sav-primary text-white font-bold"
          >
            Hacer otra recarga
          </button>
          <Link to="/ganancias" className="text-sav-accent font-medium">Ver mis registros</Link>
        </div>
      </Layout>
    );
  }

  const saldo = (user?.saldo_principal ?? 0) + (user?.saldo_comisiones ?? 0);
  const horarioRec = pc?.horario_recharge; // Nota: en queries.js se usa horario_recarga, verificar consistencia
  const schedRec = horarioRec ? isScheduleOpen(horarioRec) : { ok: true };
  const fueraHorario = horarioRec?.enabled && !schedRec.ok;
  const msgHorario = !schedRec.ok ? schedRec.message : '';

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

        <div className="bg-sav-primary text-white rounded-[2rem] p-6 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Saldo Actual</p>
          <p className="text-3xl font-black relative z-10">{saldo.toFixed(2)} <span className="text-sm font-normal opacity-60">BOB</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tighter">Monto a Recargar (BOB)</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => {
                setMonto(e.target.value);
                setModo('Recarga Saldo');
              }}
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-sav-accent focus:outline-none transition-colors text-lg font-bold"
              placeholder="Ej: 200"
              required
            />
            
            <div className="mt-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">O selecciona un nivel:</p>
              <div className="grid grid-cols-3 gap-2">
                {niveles.length > 0 ? (
                  niveles
                    .filter(n => ['S1', 'S2', 'S3'].includes(n.codigo))
                    .map((nivel) => {
                      const valor = nivel.deposito || nivel.costo;
                      const isSelected = monto === valor.toString();
                      return (
                        <button
                          key={nivel.id}
                          type="button"
                          onClick={() => selectLevel(nivel)}
                          className={`py-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected 
                              ? 'border-sav-accent bg-sav-accent/10 text-sav-primary' 
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-sav-accent/30'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-tighter">{nivel.nombre}</span>
                          <span className="text-[10px] font-bold">{valor} BS</span>
                        </button>
                      );
                    })
                ) : (
                  // Fallback si no cargan los niveles
                  [
                    { id: 's1', nombre: 'S1', valor: 200 },
                    { id: 's2', nombre: 'S2', valor: 720 },
                    { id: 's3', nombre: 'S3', valor: 2830 },
                  ].map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => { setMonto(n.valor.toString()); setModo('Compra VIP'); }}
                      className={`py-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        monto === n.valor.toString()
                          ? 'border-sav-accent bg-sav-accent/10 text-sav-primary' 
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-sav-accent/30'
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-tighter">{n.nombre}</span>
                      <span className="text-[10px] font-bold">{n.valor} BS</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-tighter">Pasos para recargar:</p>
            {metodos.length > 0 ? (
              <div className="space-y-4">
                {metodos.map((m) => (
                  <div key={m.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sav-accent/20 flex items-center justify-center text-sav-primary font-bold text-sm">1</div>
                      <p className="text-sm font-medium text-gray-600">Escanea el QR de {m.nombre_titular}</p>
                    </div>
                    {(m.imagen_base64 || m.imagen_qr_url) && (
                      <div className="bg-gray-50 p-4 rounded-2xl flex justify-center">
                        <img src={m.imagen_base64 || m.imagen_qr_url} alt="QR" className="w-48 h-48 object-contain shadow-sm rounded-lg" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Cargando métodos de pago...</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-sav-accent/20 flex items-center justify-center text-sav-primary font-bold text-sm">2</div>
              <p className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Sube tu comprobante:</p>
            </div>
            
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center gap-3 ${
                comprobante ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-sav-accent text-gray-400'
              }`}
            >
              {comprobante ? (
                <>
                  <img src={comprobante} alt="Comprobante" className="max-h-40 object-contain rounded-xl shadow-md" />
                  <span className="text-xs font-bold text-green-600 uppercase">¡Imagen cargada correctamente!</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload size={24} />
                  </div>
                  <span className="text-sm font-medium">Toca para subir captura de pantalla</span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || (horarioRec?.enabled && fueraHorario)}
            className="w-full py-5 rounded-[2rem] bg-sav-accent text-sav-primary font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? 'Procesando...' : 'Confirmar Recarga'}
          </button>
        </form>

        <p className="text-[10px] text-gray-400 mt-8 text-center uppercase font-bold tracking-widest">
          <Link to="/seguridad" className="text-sav-accent">Centro de Seguridad</Link>
          {' · '}
          {horarioRec?.enabled ? `Atención: ${horarioRec.hora_inicio} – ${horarioRec.hora_fin}` : 'Disponible 24/7'}
        </p>
      </div>
    </Layout>
  );
}
