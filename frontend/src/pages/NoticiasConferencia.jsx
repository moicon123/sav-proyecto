import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { api } from '../lib/api';
import { Bell } from 'lucide-react';

export default function NoticiasConferencia() {
  const [title, setTitle] = useState('Noticias de conferencia');
  const [body, setBody] = useState('');

  useEffect(() => {
    api
      .publicContent()
      .then((d) => {
        setTitle(d.conferencia_title || 'Noticias de conferencia');
        setBody(d.conferencia_noticias || '');
      })
      .catch(() => {});
  }, []);

  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <Layout>
      <Header title="Noticias" />
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Bell className="text-white" size={22} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{title}</p>
            <p className="text-xs text-amber-800 mt-1">Todo lo que se tratará en las reuniones (editado por administración)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {lines.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay noticias publicadas.</p>
          ) : (
            <ul className="space-y-3">
              {lines.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-gray-800 border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                >
                  <span className="text-sav-accent font-bold">•</span>
                  <span className="flex-1 whitespace-pre-wrap">{line.replace(/^[•\-*]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
