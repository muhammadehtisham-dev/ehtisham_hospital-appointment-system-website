import { motion } from 'framer-motion';
import { Activity, Calendar, LogOut, MessageSquare, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Medi<span className="text-teal-600">Care</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-600 font-medium hover:text-teal-600 transition-colors">Home</Link>
          <Link to="/doctors" className="text-slate-600 font-medium hover:text-teal-600 transition-colors">Doctors</Link>
          {user && <Link to="/dashboard" className="text-slate-600 font-medium hover:text-teal-600 transition-colors">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="text-slate-600 font-medium hover:text-teal-600 transition-colors">Admin</Link>}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="text-teal-600 w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-700">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-600 font-bold hover:text-teal-600 transition-colors">Login</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-all shadow-md shadow-teal-100">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
