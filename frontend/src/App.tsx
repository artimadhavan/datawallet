/**
 * DataWallet Frontend Architecture
 * -------------------------------
 * Library: React 19 (SPA Architecture)
 * Styling: Tailwind CSS v4 (Utility-first with @theme)
 * Routing: React Router Dom (Declarative Navigation)
 * State Management: React Context API (Auth Provider)
 * Visualizations: Recharts (D3-based Data Viz)
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">Loading Intelligence...</div>;
  if (!token) return <Navigate to="/welcome" replace />;
  
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/welcome" element={token ? <Navigate to="/" replace /> : <Landing />} />
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      <Route path="*" element={<ProtectedRoute><div className="p-8 text-center"><h2 className="text-2xl font-bold">Coming Soon</h2><p className="text-zinc-500 mt-2">This page is under construction.</p></div></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
