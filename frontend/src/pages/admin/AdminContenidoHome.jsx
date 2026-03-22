import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

function defaultHorario() {
  return {
    enabled: false,
    dias_semana: [1, 2, 3, 4, 5, 6, 0],
    hora_inicio: '09:00',
    hora_fin: '18:00',
  };
}

function HorarioEditor({ label, value, onChange }) {
  const days = [
    { v: 0, l: 'Do' },
    { v: 1, l: 'Lu' },
    { v: 2, l: 'Ma' },
    { v: 3, l: 'Mi' },
    { v: 4, l: 'Ju' },
    { v: 5, l: 'Vi' },
    { v: 6, l: 'Sá' },
  ];
  const toggle = (v) => {
    const cur = new Set(value?.dias_semana || []);
    if (cur.has(v)) cur.delete(v);
    else cur.add(v);
    onChange({ ...(value || defaultHorario()), dias_semana: [...cur].sort((a, b) => a - b) });
  };
  const v = value || defaultHorario();
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!v.enabled}
          onChange={(e) => onChange({ ...v, enabled: e.target.checked })}
        />
        <span className="font-medium text-gray-800">{label}</span>
      </label>
      <p className="text-xs text-gray-600">
        Si está desactivado, no hay restricción de horario para esta operación.
      </p>
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.v}
            type="button"
            onClick={() => toggle(d.v)}
            className={`px-2 py-1 rounded-lg text-sm border ${
              (v.dias_semana || []).includes(d.v)
                ? 'bg-sav-primary text-white border-sav-primary'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {d.l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Desde (hora local)</label>
          <input
            type="time"
            value={v.hora_inicio || '09:00'}
            onChange={(e) => onChange({ ...v, hora_inicio: e.target.value })}
            className="rounded-lg border border-gray-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Hasta</label>
          <input
            type="time"
            value={v.hora_fin || '18:00'}
            onChange={(e) => onChange({ ...v, hora_fin: e.target.value })}
            className="rounded-lg border border-gray-300 px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminContenidoHome() {
  const [form, setForm] = useState({
    home_guide: '',
    popup_title: '',
    popup_message: '',
    popup_enabled: true,
    conferencia_title: '',
    conferencia_noticias: '',
    horario_recarga: defaultHorario(),
    horario_retiro: defaultHorario(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.admin.publicContent().then(setForm).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.admin.updatePublicContent(form);
      setForm(updated);
      alert('Contenido actualizado');
    } catch (e) {
      alert(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Contenido Home, notificaciones y horarios</h1>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guia (bloque azul en Home)</label>
          <textarea
            rows={4}
            value={form.home_guide || ''}
            onChange={(e) => setForm((f) => ({ ...f, home_guide: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Texto de guia para principiantes"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titulo de notificacion</label>
          <input
            type="text"
            value={form.popup_title || ''}
            onChange={(e) => setForm((f) => ({ ...f, popup_title: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de notificacion</label>
          <textarea
            rows={4}
            value={form.popup_message || ''}
            onChange={(e) => setForm((f) => ({ ...f, popup_message: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!form.popup_enabled}
            onChange={(e) => setForm((f) => ({ ...f, popup_enabled: e.target.checked }))}
          />
          Mostrar notificacion al entrar
        </label>

        <div className="pt-4 border-t border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-800">Horarios de recarga y retiro</h2>
          <p className="text-sm text-gray-600">
            Fuera de estos horarios el usuario verá un mensaje al intentar recargar o retirar (validación en servidor).
          </p>
          <HorarioEditor
            label="Restringir recargas"
            value={form.horario_recarga}
            onChange={(h) => setForm((f) => ({ ...f, horario_recarga: h }))}
          />
          <HorarioEditor
            label="Restringir retiros"
            value={form.horario_retiro}
            onChange={(h) => setForm((f) => ({ ...f, horario_retiro: h }))}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h2 className="font-semibold text-gray-800 mb-3">Noticias de conferencia (reuniones)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Lo que ve el usuario en &quot;Noticias de Conferencia&quot; del home. Una línea por tema o usa viñetas.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={form.conferencia_title || ''}
                onChange={(e) => setForm((f) => ({ ...f, conferencia_title: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                placeholder="Noticias de conferencia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido (temas de la reunión)</label>
              <textarea
                rows={8}
                value={form.conferencia_noticias || ''}
                onChange={(e) => setForm((f) => ({ ...f, conferencia_noticias: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono text-sm"
                placeholder={'• Reunión sábado 10:00\n• Tema: niveles\n• Enlace Zoom: ...'}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-sav-primary text-white font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
