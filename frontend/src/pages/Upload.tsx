import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Upload as UploadIcon, FileUp, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function BulkUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/expenses/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60s timeout for large files
      });
      const count = response.data.count ?? '';
      setStatus({ type: 'success', message: `${count ? count + ' transactions' : 'Data'} ingested & categorized successfully.` });
      setFile(null);
      // Redirect to dashboard after short delay so user sees the success message
      setTimeout(() => navigate('/', { state: { refreshed: true } }), 1500);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Bulk Data Ingestion</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Scale your financial auditing by importing multi-transaction datasets in CSV format.</p>
      </div>

      <div className="glass-card p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Sparkles className="w-24 h-24 text-blue-500" />
        </div>

        <div className="border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-[2.5rem] p-16 text-center bg-blue-50/20 dark:bg-blue-500/5 transition-all hover:bg-blue-50/40 dark:hover:bg-blue-500/10 relative overflow-hidden">
          <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-xl shadow-blue-500/10 flex items-center justify-center mx-auto mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <FileUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Select Audit Statement</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 mb-10 max-w-sm mx-auto leading-relaxed font-medium">
            Upload your CSV dataset and our intelligence engine will automatically categorize transactions using keyword pattern matching.
          </p>
          
          <label className="cursor-pointer inline-flex items-center px-10 py-3.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold rounded-2xl transition-all border border-zinc-200 dark:border-zinc-700 shadow-md active:scale-95 group-hover:shadow-blue-500/10">
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            Browse Dataset
          </label>
          
          {file && (
            <div className="mt-8 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl inline-flex items-center text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 animate-in zoom-in-95">
              <CheckCircle className="w-3.5 h-3.5 mr-2" />
              {file.name}
            </div>
          )}
        </div>

        {status && (
          <div className={`mt-8 p-5 rounded-2xl flex items-center border animate-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-green-50/50 text-green-800 border-green-200/50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50' : 'bg-red-50/50 text-red-800 border-red-200/50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-4 ${status.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <span className="font-bold text-sm tracking-tight">{status.message}</span>
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`flex items-center px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl ${!file || uploading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600' : 'premium-button'}`}
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-3" />
                Ingesting — please wait...
              </div>
            ) : (
              <>
                <UploadIcon className="w-4 h-4 mr-3" />
                Ingest Data
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Help Card */}
      <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 flex items-start gap-4">
        <div className="p-2 bg-blue-500/10 rounded-xl">
           <AlertCircle className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dataset Formatting</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Ensure your CSV contains exactly these columns: <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">amount, category, date, description, paymentMethod</code>. Date format should be <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">YYYY-MM-DD</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
