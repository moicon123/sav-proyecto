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
    // Forzar recarga de métodos cada vez que se entra a la página
    const loadData = async () => {
      try {
        const list = await api.recharges.metodos();
        setMetodos(list);
      } catch (err) {
        console.error('Error cargando métodos:', err);
        setMetodos([]);
      }
    };

    loadData();
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
    
    // Limitar tamaño a 2MB para evitar errores de red en móviles
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen es muy pesada. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setComprobante(reader.result);
      setError('');
    };
    reader.onerror = () => setError('Error al leer el archivo');
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
        <div className="p-8 text-center flex flex-col items-center gap-6 bg-white min-h-screen">
          <div className="w-24 h-24 bg-[#00C853]/10 text-[#00C853] rounded-[2.5rem] flex items-center justify-center shadow-xl border border-[#00C853]/20 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#1a1f36] uppercase tracking-tighter">¡Solicitud Enviada!</h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
              Tu recarga está siendo procesada. El saldo se reflejará una vez aprobada por el administrador.
            </p>
          </div>
          <div className="w-full space-y-3">
            <button 
              onClick={() => setSuccess(false)}
              className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-[#1a1f36]/20 active:scale-95 transition-all"
            >
              Hacer otra recarga
            </button>
            <Link 
              to="/ganancias" 
              className="block w-full py-5 rounded-2xl bg-gray-50 text-[#1a1f36] font-black uppercase tracking-widest text-xs border border-gray-100 active:scale-95 transition-all text-center"
            >
              Ver mis registros
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const saldo = (user?.saldo_principal ?? 0) + (user?.saldo_comisiones ?? 0);
  const horarioRec = pc?.horario_recharge;
  const schedRec = horarioRec ? isScheduleOpen(horarioRec) : { ok: true };
  const fueraHorario = horarioRec?.enabled && !schedRec.ok;

  return (
    <Layout>
      <Header title="Recargar" />
      <div className="p-4 space-y-4 pb-24 bg-white min-h-screen">
        {/* Banner de Saldo White/Navy */}
        <div className="bg-[#1a1f36] rounded-[2rem] p-8 text-white shadow-xl border border-white/10 relative overflow-hidden group text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Saldo Disponible</p>
            <h2 className="text-4xl font-black tracking-tighter text-white">
              {saldo.toFixed(2)} <span className="text-sm font-bold text-white/40 ml-1">BOB</span>
            </h2>
          </div>
        </div>

        {fueraHorario && (
          <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-center animate-pulse shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Horario Cerrado</p>
            <p className="text-xs font-bold leading-relaxed">{schedRec.message || 'El sistema de recargas no está disponible ahora.'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest ml-1">Monto a Recargar (BOB)</label>
            <div className="relative">
              <input
                type="number"
                value={monto}
                onChange={(e) => {
                  setMonto(e.target.value);
                  setModo('Recarga Saldo');
                }}
                className="w-full bg-gray-50 px-5 py-5 rounded-2xl border border-gray-100 focus:border-[#1a1f36]/50 focus:outline-none transition-all text-xl font-black text-[#1a1f36] placeholder:text-gray-300 shadow-inner"
                placeholder="Ej: 200"
                required
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs uppercase tracking-widest">BOB</span>
            </div>
            
            <div className="mt-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">O selecciona un nivel:</p>
              <div className="grid grid-cols-3 gap-3">
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
                          className={`py-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${
                            isSelected 
                              ? 'border-[#1a1f36] bg-[#1a1f36] text-white shadow-lg' 
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-[#1a1f36]/30'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-tighter">{nivel.nombre}</span>
                          <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-[#1a1f36]'}`}>{valor} BOB</span>
                        </button>
                      );
                    })
                ) : (
                  [
                    { id: 's1', nombre: 'S1', valor: 200 },
                    { id: 's2', nombre: 'S2', valor: 720 },
                    { id: 's3', nombre: 'S3', valor: 2830 },
                  ].map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => { setMonto(n.valor.toString()); setModo('Compra VIP'); }}
                      className={`py-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${
                        monto === n.valor.toString()
                          ? 'border-[#1a1f36] bg-[#1a1f36] text-white shadow-lg' 
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-[#1a1f36]/30'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter">{n.nombre}</span>
                      <span className={`text-xs font-black ${monto === n.valor.toString() ? 'text-white' : 'text-[#1a1f36]'}`}>{n.valor} BOB</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 mb-5 uppercase tracking-widest ml-1">Paso 1: Escanea el QR</p>
            {metodos.length > 0 ? (
              <div className="space-y-6">
                {metodos.map((m) => (
                  <div key={m.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a1f36]/5 flex items-center justify-center text-[#1a1f36] font-black text-xs border border-gray-100 shadow-inner">1</div>
                      <p className="text-sm font-black text-[#1a1f36] uppercase tracking-tight">{m.nombre_titular}</p>
                    </div>
                    {/* Contenedor del QR dinámico */}
                    <div className="bg-gray-50 p-6 rounded-[2rem] flex flex-col items-center justify-center border border-gray-100 shadow-inner min-h-[16rem]">
                      {(m.imagen_base64 || m.imagen_qr_url) ? (
                        <img 
                          src={m.imagen_base64 || m.imagen_qr_url} 
                          alt={`QR de ${m.nombre_titular}`} 
                          className="w-64 h-64 object-contain rounded-xl shadow-lg border border-white" 
                          onError={(e) => {
                            console.error("Error cargando imagen QR:", m.imagen_qr_url);
                            e.target.src = 'https://placehold.co/200x200?text=QR+No+Disponible';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse flex items-center justify-center">
                            <Upload className="text-gray-300" size={24} />
                          </div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Esperando imagen QR del administrador...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-4">Cargando métodos de pago...</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1a1f36]/5 flex items-center justify-center text-[#1a1f36] font-black text-xs border border-gray-100 shadow-inner">2</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paso 2: Sube el comprobante</p>
            </div>
            
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full min-h-[12rem] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden group ${
                comprobante ? 'border-[#00C853] bg-[#00C853]/5' : 'border-gray-100 bg-gray-50 hover:border-[#1a1f36]/50'
              }`}
            >
              {comprobante ? (
                <>
                  <img src={comprobante} alt="Comprobante" className="max-h-40 object-contain rounded-xl shadow-lg" />
                  <span className="text-[10px] font-black text-[#00C853] uppercase tracking-widest animate-pulse">¡Captura lista!</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-[#1a1f36] group-hover:scale-110 transition-transform border border-gray-100 shadow-sm">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#1a1f36] transition-colors">Sube tu captura de pantalla</p>
                    <p className="text-[8px] text-gray-300 font-bold uppercase mt-1">Máximo 5MB • Formatos JPG, PNG</p>
                  </div>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || (horarioRec?.enabled && fueraHorario)}
            className="w-full py-5 rounded-2xl bg-[#1a1f36] text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-[#1a1f36]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Subiendo Comprobante...' : 'Enviar Recarga para Revisión'}
          </button>
        </form>

        <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 text-center">
          <p className="text-[9px] text-[#1a1f36] font-black leading-relaxed uppercase tracking-[0.15em]">
            Tu recarga será verificada por nuestro equipo en un plazo de 15 a 30 minutos. 
            Asegúrate de que el monto y la captura coincidan.
          </p>
        </div>
      </div>
    </Layout>
  );
}
