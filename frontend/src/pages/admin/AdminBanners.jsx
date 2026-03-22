import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Upload } from 'lucide-react';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [orden, setOrden] = useState(0);

  useEffect(() => {
    api.admin.banners().then(setBanners).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!url) return alert('Ingresa la URL de la imagen');
    try {
      const b = await api.admin.crearBanner({ imagen_url: url, orden });
      setBanners((prev) => [...prev, b].sort((a, b) => a.orden - b.orden));
      setUrl('');
      setOrden(0);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      await api.admin.eliminarBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Cargando banners...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Banners (Carrusel)</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
        <h2 className="font-semibold mb-4">Agregar nuevo banner</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="url"
            placeholder="URL de la imagen"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            type="number"
            placeholder="Orden"
            className="w-24 px-4 py-2 rounded-xl border border-gray-200"
            value={orden}
            onChange={(e) => setOrden(parseInt(e.target.value))}
          />
          <button onClick={handleAdd} className="bg-sav-accent text-sav-primary font-bold px-6 py-2 rounded-xl flex items-center gap-2">
            <Plus size={20} /> Agregar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group">
            <img src={b.imagen_url} alt="" className="w-full aspect-video object-cover" />
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Orden: {b.orden}</span>
              <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {banners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400">No hay banners configurados.</p>
        </div>
      )}
    </div>
  );
}
