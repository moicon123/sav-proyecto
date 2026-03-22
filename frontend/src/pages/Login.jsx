import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F9F9F5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-black mb-4 shadow-lg">
            <Logo variant="auth" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Iniciar sesión</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
            <div className="flex gap-2">
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-28 px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sav-accent"
              >
                {PAISES.map((p) => (
                  <option key={p.codigo} value={p.codigo}>{p.codigo}</option>
                ))}
              </select>
              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sav-accent"
                placeholder="70000000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sav-accent pr-12"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-sav-accent text-sav-primary font-semibold hover:opacity-90 transition">
            Iniciar sesión ahora
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-sav-accent font-medium">Regístrate ahora</Link>
        </p>
      </div>
    </div>
  );
}
