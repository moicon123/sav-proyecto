import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Gem, Wallet, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/equipo', icon: Users, label: 'Equipo' },
  { to: '/vip', icon: Gem, label: 'VIP' },
  { to: '/ganancias', icon: Wallet, label: 'Ganancias' },
  { to: '/usuario', icon: User, label: 'Usuario' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen pb-24 bg-[#F9F9F5] flex flex-col items-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative page-transition">
        {children}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around py-3 safe-area-pb z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-sav-primary scale-110' : 'text-gray-400'
                }`}
              >
                <div className={`p-1 rounded-xl ${isActive ? 'bg-sav-accent/20' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
