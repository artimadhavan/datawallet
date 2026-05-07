import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import {
  AlertTriangle, TrendingDown, Info, Download, CheckCircle,
  PieChart as PieChartIcon, BarChart as BarChartIcon, Receipt, Upload, Image as ImageIcon
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Entertainment: '#8b5cf6',
  Shopping: '#f59e0b',
  Bills: '#10b981',
  Others: '#6b7280',
};

function getCategoryColor(cat: string, idx: number) {
  return CATEGORY_COLORS[cat] ?? COLORS[idx % COLORS.length];
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-3 w-24 bg-zinc-700/50 rounded mb-4" />
      <div className="h-9 w-32 bg-zinc-700/50 rounded mb-2" />
      <div className="h-2 w-20 bg-zinc-700/30 rounded" />
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();

  const [summary, setSummary]       = useState<any>(null);
  const [insights, setInsights]     = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [txPage, setTxPage]         = useState(1);
  const [txTotal, setTxTotal]       = useState(0);
  const TX_LIMIT = 10;

  // ─── Data Fetchers ───────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryRes, insightsRes, predictionRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.post('/analytics/detect-leaks'),
        api.get('/analytics/prediction'),
      ]);
      setSummary(summaryRes.data);
      setInsights(insightsRes.data ?? []);
      setPrediction(predictionRes.data);
      console.log('[Dashboard] summary:', summaryRes.data);
      console.log('[Dashboard] insights:', insightsRes.data);
    } catch (err) {
      console.error('[Dashboard] Failed to fetch analytics:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      const res = await api.get('/expenses', { params: { page, limit: TX_LIMIT } });
      console.log('[Dashboard] transactions:', res.data);
      setTransactions(res.data.expenses ?? []);
      setTxTotal(res.data.total ?? 0);
    } catch (err) {
      console.error('[Dashboard] Failed to fetch transactions:', err);
    }
  }, []);

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>, txId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/expenses/${txId}/bill`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchTransactions(txPage);
    } catch (err) {
      console.error('[Dashboard] Failed to upload bill:', err);
    }
  };

  const getImageUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    return `${baseUrl}${path}`;
  };

  // Re-fetch every time the dashboard is navigated to (catches post-upload refresh)
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboardData(), fetchTransactions(1)]).finally(() =>
      setLoading(false)
    );
    setTxPage(1);
  }, [location.key, fetchDashboardData, fetchTransactions]);

  // Pagination
  useEffect(() => {
    if (!loading) fetchTransactions(txPage);
  }, [txPage]);

  const downloadReport = async () => {
    try {
      const response = await api.get('/analytics/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Expense_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('[Dashboard] Report download failed:', err);
    }
  };

  // ─── Derived Chart Data ───────────────────────────────────────────────────────
  const pieData = summary?.categoryBreakdown
    ? Object.keys(summary.categoryBreakdown).map(key => ({
        name: key,
        value: summary.categoryBreakdown[key],
        percentage: summary.categoryPercentages?.[key] ?? '0',
      }))
    : [];

  const barData = summary?.dailyTrends
    ? Object.keys(summary.dailyTrends)
        .sort()
        .slice(-7)
        .map(date => ({ date: date.substring(5), amount: summary.dailyTrends[date] }))
    : [];

  const activeAlerts = insights.filter(i => i.isAlert);
  const topInsight   = insights.find(i => i.type === 'CRITICAL') || insights[0];
  const totalPages   = Math.ceil(txTotal / TX_LIMIT);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Student Insight Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Automated expense leak detection and financial forecasting.</p>
        </div>
        <button
          onClick={downloadReport}
          className="premium-button flex items-center px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" /> Export Financial Audit
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <div className="glass-card p-6 border-l-4 border-l-blue-600 hover:scale-[1.02] transition-transform cursor-default">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Expenditure</h3>
                <span className="p-1.5 bg-blue-500/10 rounded-lg"><TrendingDown className="w-4 h-4 text-blue-500" /></span>
              </div>
              <p className="text-4xl font-black mt-2 tracking-tighter">₹{(summary?.allTimeTotal ?? summary?.totalSpent ?? 0).toFixed(2)}</p>
              <div className="mt-2 flex items-center text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                <span className="text-green-500 mr-1">●</span> This month: ₹{(summary?.totalSpent ?? 0).toFixed(2)}
              </div>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-cyan-500 hover:scale-[1.02] transition-transform cursor-default relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Projected Burn</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black mt-2 tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-cyan-500">
                  ₹{prediction?.predictedAmount?.toFixed(2) ?? '0.00'}
                </p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${prediction?.confidence === 'HIGH' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {prediction?.confidence ?? 'N/A'} CONFIDENCE
                </span>
              </div>
              <p className="text-[10px] mt-2 text-zinc-400 font-medium italic opacity-80">{prediction?.message}</p>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-amber-500 hover:scale-[1.02] transition-transform cursor-default">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Critical Alerts</h3>
              <p className="text-4xl font-black mt-2 text-amber-500 tracking-tighter">{activeAlerts.length}</p>
              <div className="mt-2 flex items-center text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                {activeAlerts.length === 0 ? '✅ No active alerts' : 'Requires Immediate Attention'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Top Insight ── */}
      {!loading && topInsight && (
        <div className="glass-card p-1 shadow-2xl bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-transparent">
          <div className="p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
              <AlertTriangle className={`w-8 h-8 ${topInsight.type === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1 block">Top AI Insight</span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{topInsight.message}</h2>
            </div>
          </div>
        </div>
      )}

      {/* ── Leak Summary + Pie Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leak List */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold px-1">Leak Summary</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="glass-card p-6 animate-pulse"><div className="h-4 w-full bg-zinc-700/50 rounded" /></div>
            ) : insights.filter(i => i.category === 'LEAK').length > 0 ? (
              insights.filter(i => i.category === 'LEAK').map((leak, idx) => (
                <div key={idx} className="glass-card p-4 border-l-4 border-l-red-500">
                  <h4 className="text-xs font-bold text-red-500 uppercase mb-1">Financial Leak Detected</h4>
                  <p className="text-sm font-semibold">{leak.message}</p>
                </div>
              ))
            ) : (
              <div className="glass-card p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-500">No active leaks detected.</p>
              </div>
            )}

            {/* Behavioral Patterns */}
            {!loading && insights.filter(i => i.category === 'PATTERN').length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Behavioral Patterns</h3>
                <div className="space-y-3">
                  {insights.filter(i => i.category === 'PATTERN').map((p, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-700/50">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{p.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Category Distribution</h2>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Current Month</span>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} className="focus:outline-none hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'rgba(23,23,23,0.9)', borderRadius: '16px', border: 'none', color: '#fff' }}
                    formatter={(value: number, name: string, props: any) => [`₹${value.toFixed(2)} (${props.payload.percentage}%)`, name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px' }}
                    formatter={(value, entry: any) => (
                      <span className="text-xs font-bold text-zinc-500">{value} ({entry.payload.percentage}%)</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center flex-col text-zinc-500">
                <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-bold">No transaction data for this month</p>
                <p className="text-xs text-zinc-500 mt-1">Upload a CSV or add expenses to see breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bar Chart (7-day trend) ── */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Activity Pulse (7-Day Period)</h2>
          <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-500">REAL-TIME ANALYTICS</div>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} tickFormatter={v => `₹${v}`} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(37,99,235,0.05)', radius: 12 }}
                  contentStyle={{ backgroundColor: 'rgba(23,23,23,0.9)', borderRadius: '16px', border: 'none', color: '#fff' }}
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[10, 10, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center flex-col text-zinc-500">
              <BarChartIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold">No trends found for the last 7 days</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Transaction Table ── */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Receipt className="w-5 h-5 text-blue-500" /> Recent Transactions
          </h2>
          <span className="text-xs font-bold text-zinc-400">{txTotal} total records</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-zinc-800/30 animate-pulse" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <th className="text-left px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Method</th>
                    <th className="text-right px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
                    <th className="text-center px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/30">
                  {transactions.map((tx: any, idx: number) => (
                    <tr key={tx.id ?? idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-bold text-zinc-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 max-w-[200px] truncate">
                        {tx.description || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${getCategoryColor(tx.category, idx)}20`,
                            color: getCategoryColor(tx.category, idx),
                          }}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-zinc-500">{tx.paymentMethod || '—'}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-black text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        ₹{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {tx.billImageUrl ? (
                          <a
                            href={getImageUrl(tx.billImageUrl)}
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
                              onChange={(e) => handleBillUpload(e, tx.id)}
                            />
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-bold text-zinc-400">
                  Page {txPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setTxPage(p => Math.min(totalPages, p + 1))}
                    disabled={txPage === totalPages}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Receipt className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-bold">No transactions available</p>
            <p className="text-xs mt-1">Upload a CSV file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
