import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const [data, setData] = useState({
    telefono: '+591',
    nombre_usuario: '',
    password: '',
    repeat_password: '',
    codigo_invitacion: '',
  });
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
    <div className="min-h-screen bg-[#F9F9F5] flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-black mb-4 shadow-lg">
            <Logo variant="auth" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Registrarse</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={data.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="+591 70000000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
            <input
              type="text"
              value={data.nombre_usuario}
              onChange={(e) => handleChange('nombre_usuario', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 pr-12"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repetir contraseña</label>
            <input
              type="password"
              value={data.repeat_password}
              onChange={(e) => handleChange('repeat_password', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de invitación</label>
            <input
              type="text"
              value={data.codigo_invitacion}
              onChange={(e) => handleChange('codigo_invitacion', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
              placeholder="Código obligatorio"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sav-accent text-sav-primary font-semibold"
          >
            Registrarse ahora
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sav-accent font-medium">
            Iniciar sesión ahora
          </Link>
        </p>
      </div>
    </div>
  );
}
