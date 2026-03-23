import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Zap } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const PAISES = [
  { codigo: '+591', pais: '🇧🇴 Bolivia' },
  { codigo: '+52', pais: '🇲🇽 México' },
  { codigo: '+54', pais: '🇦🇷 Argentina' },
  { codigo: '+57', pais: '🇨🇴 Colombia' },
  { codigo: '+51', pais: '🇵🇪 Perú' },
  { codigo: '+56', pais: '🇨🇱 Chile' },
  { codigo: '+58', pais: '🇻🇪 Venezuela' },
  { codigo: '+593', pais: '🇪🇨 Ecuador' },
  { codigo: '+595', pais: '🇵🇾 Paraguay' },
  { codigo: '+598', pais: '🇺🇾 Uruguay' },
];

export default function Login() {
  const [pais, setPais] = useState('+591');
  const [numero, setNumero] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const telefono = pais + numero.replace(/\D/g, '').trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(telefono, password);
      navigate(user?.rol === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] -left-[10%] w-[100%] sm:w-[50%] h-[50%] bg-[#1a1f36]/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] -right-[10%] w-[100%] sm:w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 py-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-white mb-6 sm:mb-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#1a1f36]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <img src="/imag/logo.jpeg" alt="SAV" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl sm:rounded-2xl shadow-inner transition-transform group-hover:scale-110 duration-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#1a1f36] rounded-full flex items-center justify-center text-white border-2 sm:border-4 border-white shadow-lg">
              <Zap size={14} fill="currentColor" className="animate-pulse sm:w-4 sm:h-4" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1f36] uppercase tracking-tighter drop-shadow-sm">
            BIENVENIDO A <span className="text-[#1a1f36] underline decoration-4 decoration-[#1a1f36]/10 underline-offset-8">SAV</span>
          </h1>
          <p className="text-[9px] sm:text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-3 sm:mt-4 opacity-60 px-4 leading-relaxed">Sistema de Activos Virtuales</p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-white/50 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-500 text-[10px] sm:text-[11px] font-black uppercase tracking-widest border border-rose-100 animate-shake text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Teléfono Móvil</label>
              <div className="flex gap-2 sm:gap-3">
                <div className="relative group flex-shrink-0">
                  <select
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="appearance-none w-20 sm:w-24 px-4 sm:px-5 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-gray-50/50 border-2 border-gray-50 focus:border-[#1a1f36]/30 text-[#1a1f36] font-black text-xs sm:text-sm transition-all outline-none cursor-pointer"
                  >
                    {PAISES.map((p) => (
                      <option key={p.codigo} value={p.codigo} className="bg-white">{p.codigo}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[9px] sm:text-[10px] group-hover:text-[#1a1f36] transition-colors">▼</div>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-5 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-gray-50/50 border-2 border-gray-50 text-[#1a1f36] font-black text-xs sm:text-sm focus:border-[#1a1f36]/30 transition-all outline-none placeholder:text-gray-300 shadow-inner"
                  placeholder="70000000"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Contraseña</label>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-gray-50/50 border-2 border-gray-50 text-[#1a1f36] font-black text-xs sm:text-sm focus:border-[#1a1f36]/30 transition-all outline-none pr-14 sm:pr-16 placeholder:text-gray-300 shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1f36] transition-colors"
                >
                  {showPass ? <EyeOff size={20} sm:size={22} strokeWidth={2.5} /> : <Eye size={20} sm:size={22} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 sm:py-6 mt-4 sm:mt-6 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-[#1a1f36] to-[#2a2f46] text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs shadow-[0_15px_35px_-10px_rgba(26,31,54,0.4)] active:scale-[0.98] hover:shadow-[0_20px_45px_-12px_rgba(26,31,54,0.5)] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1500ms]" />
              <span className="relative z-10">Iniciar Sesión Segura</span>
            </button>
          </form>
        </div>

        <div className="mt-8 sm:mt-12 text-center animate-fade-in delay-500">
          <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            ¿Aún no eres miembro?
          </p>
          <Link 
            to="/registro" 
            className="inline-block mt-3 sm:mt-4 px-8 sm:px-10 py-3.5 sm:py-4 rounded-[1.2rem] sm:rounded-[1.5rem] bg-white text-[#1a1f36] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-[#1a1f36]/30 active:scale-95 transition-all"
          >
            Crear Nueva Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
