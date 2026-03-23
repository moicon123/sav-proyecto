import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Lock, UserPlus } from 'lucide-react';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  const [data, setData] = useState({
    telefono: '+591',
    nombre_usuario: '',
    password: '',
    repeat_password: '',
    codigo_invitacion: refCode || '',
  });

  // Actualizar el código si cambia el parámetro de búsqueda
  useEffect(() => {
    if (refCode) {
      setData(prev => ({ ...prev, codigo_invitacion: refCode }));
    }
  }, [refCode]);

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (data.password !== data.repeat_password) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await register({
        telefono: data.telefono,
        nombre_usuario: data.nombre_usuario,
        password: data.password,
        codigo_invitacion: data.codigo_invitacion,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] -right-[10%] w-[100%] sm:w-[50%] h-[50%] bg-[#1a1f36]/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] -left-[10%] w-[100%] sm:w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 py-6">
        <div className="text-center mb-6 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] bg-white mb-4 sm:mb-6 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#1a1f36]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <img src="/imag/logo.jpeg" alt="SAV" className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg sm:rounded-xl shadow-inner transition-transform group-hover:scale-110 duration-500" />
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-6 h-6 sm:w-8 sm:h-8 bg-[#1a1f36] rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
              <UserPlus size={12} fill="currentColor" className="animate-pulse sm:w-4 sm:h-4" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1a1f36] uppercase tracking-tighter drop-shadow-sm">
            ÚNETE A <span className="text-[#1a1f36] underline decoration-4 decoration-[#1a1f36]/10 underline-offset-8">SAV</span>
          </h1>
          <p className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 sm:mt-3 opacity-60 px-4 leading-relaxed">Crea tu cuenta financiera</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.12)] border border-white/50 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="p-3 sm:p-4 rounded-xl bg-rose-50 text-rose-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-rose-100 animate-shake text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Teléfono Móvil</label>
              <input
                type="tel"
                value={data.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-gray-50/80 border-2 border-gray-50 text-[#1a1f36] font-black text-xs sm:text-sm focus:border-[#1a1f36]/20 transition-all outline-none placeholder:text-gray-300 shadow-inner"
                placeholder="+591 70000000"
                required
              />
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nombre de Usuario</label>
              <input
                type="text"
                value={data.nombre_usuario}
                onChange={(e) => handleChange('nombre_usuario', e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-gray-50/80 border-2 border-gray-50 text-[#1a1f36] font-black text-xs sm:text-sm focus:border-[#1a1f36]/20 transition-all outline-none placeholder:text-gray-300 shadow-inner"
                placeholder="Ej: usuario_pro"
                required
              />
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Contraseña</label>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-gray-50/80 border-2 border-gray-50 text-[#1a1f36] font-black text-xs sm:text-sm focus:border-[#1a1f36]/20 transition-all outline-none pr-12 sm:pr-14 placeholder:text-gray-300 shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1f36] transition-colors"
                >
                  {showPass ? <EyeOff size={18} sm:size={20} strokeWidth={2.5} /> : <Eye size={18} sm:size={20} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Repetir Contraseña</label>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={data.repeat_password}
                  onChange={(e) => handleChange('repeat_password', e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-gray-50/80 border-2 border-gray-50 text-[#1a1f36] font-black text-xs sm:text-sm focus:border-[#1a1f36]/20 transition-all outline-none pr-12 sm:pr-14 placeholder:text-gray-300 shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Código de Invitación</label>
              <div className="relative group">
                <input
                  type="text"
                  value={data.codigo_invitacion}
                  onChange={(e) => handleChange('codigo_invitacion', e.target.value)}
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 transition-all outline-none font-black text-xs sm:text-sm shadow-inner ${
                    refCode 
                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50/80 border-gray-50 text-[#1a1f36] focus:border-[#1a1f36]/20'
                  }`}
                  placeholder="CÓDIGO OBLIGATORIO"
                  required
                  readOnly={!!refCode}
                />
                {refCode && (
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#1a1f36]/40 flex items-center gap-1.5">
                    <Lock size={12} sm:size={14} />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter">Verificado</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 sm:py-5 mt-2 sm:mt-4 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#1a1f36] text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-lg shadow-[#1a1f36]/20 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              Crear Cuenta
            </button>
          </form>
        </div>

        <div className="mt-6 sm:mt-10 text-center animate-fade-in delay-500">
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            ¿Ya tienes una cuenta?
          </p>
          <Link 
            to="/login" 
            className="inline-block mt-2 sm:mt-3 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-[1rem] sm:rounded-[1.2rem] bg-white text-[#1a1f36] font-black uppercase tracking-[0.1em] text-[8px] sm:text-[9px] shadow-sm border border-gray-100 hover:border-[#1a1f36]/20 active:scale-95 transition-all"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
