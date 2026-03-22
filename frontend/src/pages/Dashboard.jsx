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
  { to: '/invitar', icon: UserCircle, label: 'Invitación' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [slide, setSlide] = useState(0);
  const [stats, setStats] = useState(null);
  const [guideText, setGuideText] = useState('GUIA PARA PRINCIPIANTES. LIDERANDO EL FUTURO. ALCANZA TUS SUENOS.');
  const [popup, setPopup] = useState({ popup_enabled: false, popup_title: '', popup_message: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    api.banners().then(setBanners).catch(() => setBanners([]));
    api.users.stats().then(setStats).catch(() => {});
    api.publicContent()
      .then((data) => {
        setGuideText(g => data.home_guide || g);
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
      <header className="bg-sav-primary text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <Logo variant="header" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <span className="text-sm">🇧🇴</span>
            <span className="text-xs font-bold">BOB</span>
          </div>
          <button
            type="button"
            onClick={onInstallApp}
            className="w-10 h-10 rounded-full bg-sav-accent/20 flex items-center justify-center border border-sav-accent/30 active:scale-90 transition-transform"
          >
            <span className="text-lg">↓</span>
          </button>
        </div>
      </header>

      <div className="relative h-60 bg-sav-primary overflow-hidden shadow-inner">
        {banners.length > 0 ? (
          <img
            src={imgUrl(banners[slide]?.imagen_url)}
            alt=""
            className="w-full h-full object-cover animate-fade-in"
            onError={(e) => {
              e.target.src = 'https://placehold.co/800x400?text=SAV+Plataforma';
              console.warn('Error cargando banner:', banners[slide]?.imagen_url);
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Logo variant="hero" className="opacity-20 grayscale" />
          </div>
        )}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-sav-accent' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5 grid grid-cols-3 gap-3 -mt-8 relative z-10">
        {gridItems.map((item) => {
          const { to, icon: GridIcon, label } = item;
          if (to === '/usuario' && user?.nivel_codigo === 'internar') return null;
          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-50 active:scale-95 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sav-primary/5 flex items-center justify-center group-hover:bg-sav-primary/10 transition-colors">
                <GridIcon className="text-sav-primary" size={28} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold text-gray-800 text-center leading-tight uppercase tracking-tighter">
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        to="/sorteo"
        className="fixed right-6 bottom-32 z-40 w-16 h-16 rounded-full bg-sav-accent flex items-center justify-center shadow-[0_8px_30px_rgb(212,175,55,0.4)] border-4 border-white active:scale-90 transition-transform"
      >
        <Gift className="text-sav-primary animate-bounce" size={32} />
      </Link>

      <div className="mx-5 mb-6 p-6 rounded-3xl bg-gradient-to-br from-sav-primary to-slate-800 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-sav-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <p className="text-base font-medium leading-relaxed italic opacity-90">{guideText}</p>
      </div>

      {/* Alerta de Límite de Pasante */}
      {stats?.pasante_limit_reached && (
        <div className="mx-5 mb-8 p-6 bg-gradient-to-r from-rose-500 to-rose-600 rounded-[2rem] text-white shadow-lg shadow-rose-500/30 animate-pulse relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-100">Prueba Finalizada</p>
              <p className="text-sm font-black leading-tight">Tus 3 días de pasantía han terminado. Sube de nivel para seguir ganando.</p>
            </div>
          </div>
          <Link 
            to="/vip"
            className="mt-4 w-full py-3 bg-white text-rose-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Subir a VIP Ahora
          </Link>
        </div>
      )}

      <div className="px-5 pb-8">
        <Link
          to="/vip"
          className="w-full py-4 rounded-2xl bg-sav-accent text-sav-primary font-black text-center shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
        >
          Mejorar Posición de Miembro →
        </Link>
      </div>

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
