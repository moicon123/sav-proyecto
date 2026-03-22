import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function VincularTarjeta() {
  const navigate = useNavigate();
  const [nombreBanco, setNombreBanco] = useState('');
  const [tipo, setTipo] = useState('yape');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.users.addTarjeta({
        nombre_banco: nombreBanco,
        tipo,
        numero_cuenta: numero,
      });
      navigate('/seguridad');
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Agregar cuenta" />
      <form onSubmit={submit} className="p-4 space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-800 text-sm">{error}</div>}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco / app (ej. Yape, Banco Unión)</label>
            <input
              value={nombreBanco}
              onChange={(e) => setNombreBanco(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
              placeholder="Yape"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-xl border px-3 py-2">
              <option value="yape">Yape</option>
              <option value="banco">Cuenta bancaria</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuenta o celular</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
              placeholder="Mínimo 4 dígitos"
            />
            <p className="text-xs text-gray-500 mt-1">Solo guardamos los últimos 4 dígitos para mostrar.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-sav-accent text-white font-bold disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar cuenta'}
        </button>
      </form>
    </Layout>
  );
}
