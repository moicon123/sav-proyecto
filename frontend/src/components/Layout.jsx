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
    <div className="min-h-screen pb-20">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 safe-area-pb">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-sav-primary font-semibold' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-xs">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
