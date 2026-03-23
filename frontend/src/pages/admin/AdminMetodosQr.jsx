import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Upload } from 'lucide-react';

export default function AdminMetodosQr() {
  const [metodos, setMetodos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.admin.metodosQr().then(setMetodos).catch(() => []);
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setImagen(reader.result);
    reader.readAsDataURL(file);
  };

  const agregar = async () => {
    if (!nombre.trim()) return alert('Ingresa el nombre del titular');
    if (!imagen) return alert('Sube una imagen QR');
    try {
      const m = await api.admin.crearMetodoQr({ nombre_titular: nombre, imagen_base64: imagen });
      setMetodos((prev) => [...prev, m]);
      setNombre('');
      setImagen(null);
    } catch (e) {
      alert(e.message || 'Error');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este método?')) return;
    await api.admin.eliminarMetodoQr(id);
    setMetodos((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Imágenes de Recarga (QR)</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="font-semibold mb-4">Agregar método de recarga</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del titular"
            className="flex-1 px-4 py-2 rounded-xl border"
          />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed hover:border-[#1a1f36] transition-colors"
          >
            <Upload size={20} />
            {imagen ? 'Cambiar imagen' : 'Subir imagen QR'}
          </button>
          {imagen && <img src={imagen} alt="Preview" className="w-24 h-24 object-contain rounded" />}
          <button onClick={agregar} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#1a1f36] text-white font-bold shadow-lg active:scale-95 transition-all">
            <Plus size={20} /> Agregar
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {metodos.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              {(m.imagen_base64 || m.imagen_qr_url) ? (
                <img src={m.imagen_base64 || m.imagen_qr_url} alt="" className="w-20 h-20 object-contain rounded" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">Sin imagen</div>
              )}
              <div>
                <p className="font-medium">{m.nombre_titular}</p>
                <p className="text-sm text-gray-500">{m.activo ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
            <button onClick={() => eliminar(m.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      {metodos.length === 0 && <p className="text-gray-500 py-8">No hay métodos de recarga. Agrega uno arriba.</p>}
    </div>
  );
}
