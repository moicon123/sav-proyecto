import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Check, Upload } from 'lucide-react';
import { isScheduleOpen } from '../lib/schedule';

export default function Withdrawal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [montos, setMontos] = useState([25, 100, 500, 1500, 5000, 10000]);
  const [tarjetas, setTarjetas] = useState([]);
  const [tarjetaId, setTarjetaId] = useState('');
  const [tipoBilletera, setTipoBilletera] = useState('principal');
  const [monto, setMonto] = useState(500);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pc, setPc] = useState(null);

  useEffect(() => {
    api.withdrawals.montos().then(setMontos).catch(() => {});
    api.users.tarjetas().then((list) => {
      setTarjetas(list);
      if (list[0]) setTarjetaId(list[0].id);
    }).catch(() => setTarjetas([]));
    api.publicContent().then(setPc).catch(() => {});
  }, []);

  const saldoPrincipal = user?.saldo_principal ?? 0;
  const saldoComisiones = user?.saldo_comisiones ?? 0;
  const horarioRet = pc?.horario_retiro;
  const schedRet = horarioRet ? isScheduleOpen(horarioRet) : { ok: true };
  const fueraHorario = horarioRet?.enabled && !schedRet.ok;
  const msgHorario = !schedRet.ok ? schedRet.message : '';

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setQrImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (tarjetas.length === 0) {
      setError('Agrega una cuenta bancaria en Seguridad de la cuenta antes de retirar.');
      return;
    }
    setLoading(true);
    try {
      await api.withdrawals.create({
        monto,
        tipo_billetera: tipoBilletera,
        password_fondo: password,
        qr_retiro: qrImage,
        tarjeta_id: tarjetaId || undefined,
      });
      navigate('/ganancias');
    } catch (err) {
      setError(err.message || 'Error al solicitar retiro');
    } finally {
      setLoading(false);
    }
  };

  const horarioTxt =
    horarioRet?.enabled &&
    `Horario permitido: ${(horarioRet.dias_semana || []).length ? 'días marcados por admin' : '—'} · ${horarioRet.hora_inicio || ''} – ${horarioRet.hora_fin || ''}`;

  return (
    <Layout>
      <Header title="Retiro" rightAction={<Link to="/ganancias" className="text-sav-accent text-sm font-medium">registro</Link>} />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <div className="p-3 rounded-xl bg-gray-800 text-white text-sm">{error}</div>}
        {horarioRet?.enabled && fueraHorario && (
          <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-sm">
            <strong>Intento de retiro fuera del horario.</strong> {msgHorario}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-medium text-gray-800 mb-3">Selecciona el Monedero</p>
          <div className="space-y-2">
            <label className="block p-3 rounded-xl border cursor-pointer transition-colors hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">
                  Saldo de Comisiones{' '}
                  <span className="text-sav-accent ml-1">{saldoComisiones.toFixed(2)} BOB</span>
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tipoBilletera === 'comisiones' ? 'border-sav-primary bg-sav-primary' : 'border-gray-300'}`}>
                  {tipoBilletera === 'comisiones' && <Check className="text-white" size={16} />}
                </div>
                <input type="radio" name="billetera" value="comisiones" checked={tipoBilletera === 'comisiones'} onChange={() => setTipoBilletera('comisiones')} className="sr-only" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Ganancias por tu red de invitados</p>
            </label>
            <label className="block p-3 rounded-xl border cursor-pointer transition-colors hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">
                  Saldo de Tareas{' '}
                  <span className="text-sav-accent ml-1">{saldoPrincipal.toFixed(2)} BOB</span>
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tipoBilletera === 'principal' ? 'border-sav-primary bg-sav-primary' : 'border-gray-300'}`}>
                  {tipoBilletera === 'principal' && <Check className="text-white" size={16} />}
                </div>
                <input type="radio" name="billetera" value="principal" checked={tipoBilletera === 'principal'} onChange={() => setTipoBilletera('principal')} className="sr-only" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Ganancias por tareas completadas</p>
            </label>
          </div>
        </div>

        {tarjetas.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-medium text-gray-800 mb-2">Cuenta para el retiro</p>
            <select
              value={tarjetaId}
              onChange={(e) => setTarjetaId(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            >
              {tarjetas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_banco} ···{t.numero_masked}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-medium text-gray-800 mb-2">Sube tu QR para el retiro</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-sav-accent flex flex-col items-center gap-2 text-gray-500 hover:text-sav-accent transition"
          >
            {qrImage ? (
              <img src={qrImage} alt="QR" className="max-h-32 object-contain rounded" />
            ) : (
              <>
                <Upload size={40} />
                <span>Sube tu QR para el retiro</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-medium text-gray-800 mb-3">Monto de retiro</p>
          <div className="grid grid-cols-3 gap-2">
            {montos.map((m) => (
              <label key={m} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer ${monto === m ? 'border-sav-accent bg-sav-accent/20' : ''}`}>
                <input type="radio" name="monto" value={m} checked={monto === m} onChange={() => setMonto(m)} className="sr-only" />
                <span className="font-bold">{m.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-medium text-gray-800 mb-2">Contraseña del fondo</p>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border pr-12" required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Tarifa de manejo (10%)</span>
          <span className="text-rose-500 font-bold">{(monto * 0.1).toFixed(2)} BOB</span>
        </div>
        <div className="flex justify-between text-sm text-gray-800 font-black border-t pt-2">
          <span>Recibirás aproximadamente</span>
          <span className="text-sav-primary font-black">{(monto * 0.9).toFixed(2)} BOB</span>
        </div>
        {horarioRet?.enabled ? (
          <p className="text-sm text-gray-600">{horarioTxt}</p>
        ) : (
          <p className="text-sm text-gray-500">Horario de retiros: sin restricción (admin puede activar días y horas).</p>
        )}

        {tarjetas.length === 0 && (
          <Link to="/vincular-tarjeta" className="block text-center text-sav-accent font-medium text-sm">
            Agregar cuenta bancaria →
          </Link>
        )}

        <button
          type="submit"
          disabled={loading || !qrImage || tarjetas.length === 0 || (horarioRet?.enabled && fueraHorario)}
          className="w-full py-4 rounded-full bg-sav-accent text-white font-bold text-lg disabled:opacity-50"
        >
          Retirar inmediatamente
        </button>
      </form>
    </Layout>
  );
}
