import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';
import { ClipboardList, TrendingUp, Bell, HandCoins, Wallet, Users, Gift, UserCircle } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const gridItems = [
  { to: '/tareas', icon: ClipboardList, label: 'Tarea' },
  { to: '/vip', icon: TrendingUp, label: 'Fondo de Riqueza' },
  { to: '/noticias-conferencia', icon: Bell, label: 'Noticias de Conferencia' },
  { to: '/retiro', icon: HandCoins, label: 'Retirada' },
  { to: '/recargar', icon: Wallet, label: 'Recargar' },
  { to: '/equipo', icon: Users, label: 'Equipo' },
  { to: '/usuario', icon: UserCircle, label: 'Invitación' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [slide, setSlide] = useState(0);
  const [guideText, setGuideText] = useState('GUIA PARA PRINCIPIANTES. LIDERANDO EL FUTURO. ALCANZA TUS SUENOS.');
  const [popup, setPopup] = useState({ popup_enabled: false, popup_title: '', popup_message: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    api.banners().then(setBanners).catch(() => setBanners([]));
    api.publicContent()
      .then((data) => {
        setGuideText(data.home_guide || guideText);
        setPopup(data);
        if (data.popup_enabled) setShowPopup(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const imgUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/')) return url;
    return url;
  };

  const onInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }
    alert('Para instalar la app, abre el menu del navegador y selecciona "Instalar aplicacion" o "Agregar a pantalla de inicio".');
  };

  return (
    <Layout>
      <header className="bg-sav-primary text-white px-4 py-3 flex items-center justify-between">
        <Logo variant="header" />
        <div className="flex items-center gap-2">
          <span className="text-xs">BO</span>
          <button
            type="button"
            onClick={onInstallApp}
            className="px-3 py-1.5 rounded-lg bg-white/20 text-sm"
          >
            ↓ App
          </button>
        </div>
      </header>

      <div className="relative h-52 bg-sav-primary overflow-hidden">
        {banners.length > 0 ? (
          <img
            src={imgUrl(banners[slide]?.imagen_url)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full bg-sav-primary" />
        )}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition ${i === slide ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 grid grid-cols-3 gap-4">
        {gridItems.map(({ to, icon: Icon, label }) => {
          if (to === '/usuario' && user?.nivel_id === 'l1') return null;
          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-sav-accent/30 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-sav-primary/10 flex items-center justify-center">
                <Icon className="text-sav-primary" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        to="/sorteo"
        className="fixed right-4 top-56 z-20 w-14 h-14 rounded-full bg-sav-accent flex items-center justify-center shadow-lg"
      >
        <Gift className="text-sav-primary" size={28} />
      </Link>

      <div className="mx-4 mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <p className="text-lg font-bold whitespace-pre-line">{guideText}</p>
      </div>

      <Link
        to="/vip"
        className="mx-4 mb-6 block p-4 rounded-xl bg-sav-primary text-white font-medium text-center"
      >
        Posición de Miembro →
      </Link>

      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{popup.popup_title || 'Aviso'}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{popup.popup_message || ''}</p>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-sav-primary text-white font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
