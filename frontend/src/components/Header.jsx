import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Header({ title, rightAction }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <button onClick={() => navigate(-1)} className="p-1 -ml-1">
        <ArrowLeft size={24} className="text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-lg capitalize">{title}</h1>
      <div className="w-10 flex justify-end">{rightAction}</div>
    </header>
  );
}
