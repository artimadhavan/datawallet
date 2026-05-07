import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, Edit, Filter, ChevronLeft, ChevronRight, Search, Calendar, Wallet, Upload, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    amount: '', category: '', date: '', description: '', paymentMethod: ''
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (categoryFilter) params.append('category', categoryFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.expenses);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, categoryFilter, startDate, endDate]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Failed to delete expense', error);
      }
    }
  };

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>, txId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/expenses/${txId}/bill`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchExpenses();
    } catch (err) {
      console.error('Failed to upload bill:', err);
    }
  };

  const getImageUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    return `${baseUrl}${path}`;
  };

  const openEditModal = (expense: any) => {
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split('T')[0],
      description: expense.description,
      paymentMethod: expense.paymentMethod
    });
    setEditingId(expense.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({ amount: '', category: '', date: '', description: '', paymentMethod: '' });
    setEditingId(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
        await api.put(`/expenses/${editingId}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Failed to save expense', error);
    }
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Transaction Ledger</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Audit and manage your financial records with precision.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="premium-button flex items-center px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card p-6 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
            <Search className="w-3 h-3 mr-1.5" /> Filter Category
          </label>
          <input 
            type="text" 
            value={categoryFilter} 
            onChange={(e) => {setCategoryFilter(e.target.value); setPage(1);}} 
            placeholder="e.g. Food, SaaS" 
            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
            <Calendar className="w-3 h-3 mr-1.5" /> Start Date
          </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => {setStartDate(e.target.value); setPage(1);}} 
            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
            <Calendar className="w-3 h-3 mr-1.5" /> End Date
          </label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => {setEndDate(e.target.value); setPage(1);}} 
            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
        </div>
        {(categoryFilter || startDate || endDate) && (
          <button 
            onClick={() => {setCategoryFilter(''); setStartDate(''); setEndDate('');}} 
            className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
          >
            Reset
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <th className="p-5">Date</th>
                <th className="p-5">Description</th>
                <th className="p-5">Category</th>
                <th className="p-5">Method</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5 text-center">Bill</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan={7} className="p-20 text-center"><div className="animate-pulse flex flex-col items-center"><div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" /> <span className="text-sm font-bold text-zinc-400">Syncing Ledger...</span></div></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} className="p-20 text-center text-zinc-500"><Wallet className="w-12 h-12 mx-auto mb-4 opacity-10" /> <p className="text-sm font-bold">No records found matching your filters.</p></td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-zinc-50 dark:hover:bg-blue-500/5 transition-all group">
                    <td className="p-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{expense.description || '-'}</p>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                         <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-tighter">{expense.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-black text-right text-zinc-900 dark:text-zinc-100 tracking-tight">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="p-5 text-center">
                      {expense.billImageUrl ? (
                        <a
                          href={getImageUrl(expense.billImageUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                          title="View Bill"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <label className="inline-flex items-center justify-center p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer" title="Upload Bill">
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBillUpload(e, expense.id)}
                          />
                        </label>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(expense)} className="p-2 text-zinc-400 hover:text-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 p-6 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Page <span className="text-zinc-900 dark:text-zinc-200">{page}</span> of <span className="text-zinc-900 dark:text-zinc-200">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page >= totalPages || totalPages === 0} 
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md p-8 shadow-2xl scale-in-95 animate-in duration-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black tracking-tight mb-6 gradient-text">{isEditMode ? 'Modify Record' : 'Log New Transaction'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Amount (₹)</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                  <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Food..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                  <input type="text" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Card..." />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Lunch at..." />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase tracking-widest">Cancel</button>
                <button type="submit" className="premium-button px-8 py-2.5 rounded-xl text-xs font-bold shadow-lg">
                  {isEditMode ? 'Update Entry' : 'Log Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
