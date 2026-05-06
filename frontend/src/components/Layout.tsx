import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, PieChart, Upload, Settings, DollarSign } from 'lucide-react';
import Logo from './Logo';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/expenses', label: 'Transaction Ledger', icon: PieChart },
    { path: '/upload', label: 'Bulk Data Ingestion', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-50 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Sidebar */}
      <aside className="w-68 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col hidden md:flex z-50">
        <div className="h-20 flex items-center px-8">
          <Logo showText size={36} />
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Platform Modules</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
          
          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">User Settings</p>
            <Link 
              to="/settings" 
              className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 group ${
                location.pathname === '/settings'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Settings className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${location.pathname === '/settings' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              Account Preferences
            </Link>
          </div>
        </nav>

        <div className="p-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center p-3 mb-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/30">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold mr-3 shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {user?.name === 'MCA Project Lead' ? 'Premium Student' : user?.name}
              </p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Verified Account</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-200 active:scale-95"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header could go here */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
