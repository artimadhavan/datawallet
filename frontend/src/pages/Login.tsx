import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 overflow-hidden relative selection:bg-blue-500/30 text-white">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md p-8 space-y-6 glass-card relative z-10 border-white/10 shadow-2xl">
        <div className="text-center">
          <Logo size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl font-black tracking-tight gradient-text">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 font-medium">Access your financial intelligence engine</p>
        </div>
        
        {error && <div className="p-3 bg-red-100/80 dark:bg-red-900/30 border border-red-400/50 text-red-700 dark:text-red-400 rounded-xl text-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-1">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full premium-button py-3 px-4 rounded-xl text-sm font-bold mt-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Logging In (Waking Server)...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
