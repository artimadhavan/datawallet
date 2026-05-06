import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Save, Shield, CreditCard, Bell, User, Moon, Sun, CheckCircle, AlertCircle } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'budget' | 'profile' | 'theme' | 'security'>('profile');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await api.get('/budgets');
        if (response.data && response.data.length > 0) {
          setMonthlyLimit(response.data[0].monthlyLimit.toString());
        }
      } catch (error) {}
    };
    fetchBudget();
  }, []);

  const handleBudgetSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const now = new Date();
      await api.post('/budgets', {
        monthlyLimit: Number(monthlyLimit),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      setStatus({ type: 'success', message: 'Budget architecture updated successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to synchronize preferences.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await api.put('/auth/update-profile', {
        name: profileName,
        email: profileEmail
      });
      updateUser(response.data.user);
      setStatus({ type: 'success', message: 'User profile updated successfully.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setStatus({ type: 'success', message: 'Security protocols updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to update security protocols.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">System Preferences</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account identity, theme, and financial intelligence constraints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
           <button 
             onClick={() => { setActiveTab('profile'); setStatus(null); }}
             className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
           >
             <User className="w-4 h-4 mr-3" /> User Account
           </button>
           <button 
             onClick={() => { setActiveTab('budget'); setStatus(null); }}
             className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'budget' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
           >
             <CreditCard className="w-4 h-4 mr-3" /> Budget Limits
           </button>
           <button 
             onClick={() => { setActiveTab('theme'); setStatus(null); }}
             className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'theme' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
           >
             <Sun className="w-4 h-4 mr-3" /> Appearance
           </button>
           <button 
             onClick={() => { setActiveTab('security'); setStatus(null); }}
             className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
           >
             <Shield className="w-4 h-4 mr-3" /> Security
           </button>
        </div>

        <div className="md:col-span-3 glass-card p-8 min-h-[400px] flex flex-col">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                     <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">User Account</h2>
                     <p className="text-xs text-zinc-500 font-medium mt-1">Manage your platform identity and contact details.</p>
                  </div>
               </div>
               
               <form onSubmit={handleProfileSave} className="space-y-6 max-w-sm">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="premium-button flex items-center justify-center w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                  >
                    {loading ? 'Synchronizing...' : <><Save className="w-4 h-4 mr-3" /> Save Changes</>}
                  </button>
               </form>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Financial Constraints</h2>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Define your monthly burn rate for AI analysis.</p>
                 </div>
              </div>
              
              <form onSubmit={handleBudgetSave} className="space-y-8 max-w-sm">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Monthly Spending Limit (₹)</label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    className="w-full px-5 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button flex items-center justify-center w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                >
                   {loading ? 'Processing...' : <><Save className="w-4 h-4 mr-3" /> Commit Preferences</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                     <Sun className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Appearance</h2>
                     <p className="text-xs text-zinc-500 font-medium mt-1">Customize the visual architecture of the platform.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 shadow-lg' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                  >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        <Sun className="w-6 h-6" />
                     </div>
                     <div className="text-center">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Light Mode</h4>
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">Crisp and clean white design.</p>
                     </div>
                  </button>

                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                  >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        <Moon className="w-6 h-6" />
                     </div>
                     <div className="text-center">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Dark Mode</h4>
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">Deep and sophisticated indigo design.</p>
                     </div>
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                     <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Security Protocols</h2>
                     <p className="text-xs text-zinc-500 font-medium mt-1">Enhance your account defense with modern cryptography.</p>
                  </div>
               </div>
               
               <form onSubmit={handleSecuritySave} className="space-y-6 max-w-sm">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="premium-button flex items-center justify-center w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                  >
                    {loading ? 'Encrypting...' : <><Save className="w-4 h-4 mr-3" /> Update Credentials</>}
                  </button>
               </form>
            </div>
          )}

          <div className="mt-auto pt-8">
            {status && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center border animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-green-50/50 text-green-700 border-green-200/50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50' : 'bg-red-50/50 text-red-700 border-red-200/50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 ${status.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                </div>
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
