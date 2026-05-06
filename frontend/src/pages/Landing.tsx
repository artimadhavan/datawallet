import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Shield, Zap, BarChart3, PieChart, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Logo showText size={32} />
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Features</a>
          <a href="#intelligence" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Intelligence</a>
          <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup" className="premium-button px-6 py-2 rounded-xl text-sm font-black shadow-xl shadow-blue-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Zap className="w-3 h-3" /> Next-Gen Financial Intelligence
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          Sync your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-500 to-cyan-400">Wealth</span>,<br />
          Master your <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">Expenses</span>.
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          DataWallet is the autonomous student expense leak detector that uses behavioral patterns and predictive AI to optimize your financial burn rate.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <Link to="/signup" className="premium-button px-10 py-4 rounded-2xl text-base font-black shadow-2xl shadow-blue-500/40 flex items-center group">
            Start Free Audit <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/login" className="px-10 py-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-all font-bold text-base backdrop-blur-xl">
            Live Preview
          </Link>
        </div>

        {/* Dashboard Preview Mockup — fully inline, no external image needed */}
        <div className="mt-24 relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full scale-75" />
          <div className="relative rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden" style={{background:'#0d0d14'}}>
            {/* --- Top Bar --- */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5" style={{background:'#0a0a10'}}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center"><Wallet className="w-3 h-3 text-white" /></div>
                <span className="text-xs font-black text-white">DataWallet</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 rounded-full bg-white/5" />
                <div className="w-12 h-2 rounded-full bg-white/5" />
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30" />
              </div>
            </div>

            <div className="flex" style={{minHeight:'340px'}}>
              {/* --- Sidebar --- */}
              <div className="flex flex-col gap-4 px-3 py-5 border-r border-white/5" style={{background:'#09090f', minWidth:'48px'}}>
                {[BarChart3, PieChart, Wallet, Shield].map((Icon, i) => (
                  <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center ${i===0 ? 'bg-blue-500/20' : 'bg-white/3 hover:bg-white/5'}`}>
                    <Icon className={`w-4 h-4 ${i===0 ? 'text-blue-400' : 'text-zinc-600'}`} />
                  </div>
                ))}
              </div>

              {/* --- Main Content --- */}
              <div className="flex-1 p-5 space-y-4 overflow-hidden">
                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label:'Total Spent', val:'₹24,350', sub:'+8% this month', color:'text-blue-400', bg:'bg-blue-500/10' },
                    { label:'Remaining', val:'₹5,650', sub:'Budget: ₹30K', color:'text-emerald-400', bg:'bg-emerald-500/10' },
                    { label:'Leaks Found', val:'3', sub:'Action needed', color:'text-red-400', bg:'bg-red-500/10' },
                    { label:'Predicted', val:'₹28K', sub:'Next month', color:'text-amber-400', bg:'bg-amber-500/10' },
                  ].map((c, i) => (
                    <div key={i} className={`rounded-2xl p-3 border border-white/5 ${c.bg}`}>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{c.label}</div>
                      <div className={`text-base font-black ${c.color}`}>{c.val}</div>
                      <div className="text-[9px] text-zinc-600 font-medium mt-1">{c.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Chart + Categories Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Spending Trend Chart */}
                  <div className="col-span-2 rounded-2xl border border-white/5 p-4" style={{background:'#111118'}}>
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3">Monthly Spend Trend</div>
                    <svg viewBox="0 0 260 80" className="w-full" style={{height:'72px'}}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,65 C30,55 50,45 80,40 C110,35 130,50 160,35 C185,22 210,30 260,18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M0,65 C30,55 50,45 80,40 C110,35 130,50 160,35 C185,22 210,30 260,18 L260,80 L0,80 Z" fill="url(#cg)"/>
                      {[0,1,2,3,4,5].map(i => <line key={i} x1="0" y1={i*16} x2="260" y2={i*16} stroke="white" strokeOpacity="0.03" strokeWidth="1"/>)}
                    </svg>
                  </div>
                  {/* Category Bars */}
                  <div className="rounded-2xl border border-white/5 p-4" style={{background:'#111118'}}>
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3">By Category</div>
                    <div className="space-y-2.5">
                      {[
                        { cat:'Food', pct:42, color:'bg-red-500' },
                        { cat:'Transport', pct:28, color:'bg-blue-500' },
                        { cat:'Shopping', pct:18, color:'bg-purple-500' },
                        { cat:'Other', pct:12, color:'bg-zinc-500' },
                      ].map((b,i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[8px] font-bold text-zinc-500 mb-1"><span>{b.cat}</span><span>{b.pct}%</span></div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className={`h-full rounded-full ${b.color}`} style={{width:`${b.pct}%`}} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spending Leaks */}
                <div className="rounded-2xl border border-red-500/15 p-3" style={{background:'rgba(239,68,68,0.05)'}}>
                  <div className="text-[9px] font-black text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3"/>Top Spending Leaks</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name:'Food Delivery', amt:'₹4,200', tag:'Impulse' },
                      { name:'Subscriptions', amt:'₹1,890', tag:'Recurring' },
                      { name:'Late-Night Orders', amt:'₹3,100', tag:'Behavioural' },
                    ].map((l,i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/3 border border-white/5">
                        <div>
                          <div className="text-[9px] font-black text-zinc-300">{l.name}</div>
                          <div className="text-[8px] text-red-400 font-bold">{l.amt}</div>
                        </div>
                        <div className="text-[7px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">{l.tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom fade overlay */}
            <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none" style={{background:'linear-gradient(to top, #0d0d14, transparent)'}} />
          </div>
        </div>
      </section>

      {/* Features Grid - Precision Engineering Revamp */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="text-blue-500 text-xs font-black uppercase tracking-widest mb-4">Core Architecture</div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Precision Engineering</h2>
          <p className="text-zinc-500 font-medium max-w-xl mx-auto text-lg">Built for students who demand clarity and control. Our engine processes thousands of data points to secure your financial future.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { 
               title: 'Leak Detection', 
               desc: 'Identify food, subscription, and impulse leaks automatically with 99.4% precision.', 
               icon: Shield,
               metric: '99.4%',
               metricLabel: 'Accuracy'
             },
             { 
               title: 'Predictive Burn', 
               desc: 'Forecast next month’s expenses using recursive neural patterns and historical flow.', 
               icon: BarChart3,
               metric: '< 2ms',
               metricLabel: 'Latency'
             },
             { 
               title: 'Bulk Ingestion', 
               desc: 'Sync entire bank statements in seconds via CSV with automated category mapping.', 
               icon: Wallet,
               metric: '500+',
               metricLabel: 'TPS'
             }
           ].map((feat, i) => (
             <div key={i} className="glass-card p-10 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <feat.icon className="w-32 h-32 -mr-16 -mt-16" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                   <feat.icon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-medium">{feat.desc}</p>
                <div className="pt-6 border-t border-white/5 flex items-end justify-between">
                   <div>
                      <div className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-1">{feat.metricLabel}</div>
                      <div className="text-xl font-black text-white">{feat.metric}</div>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Trust Section */}
      <section id="intelligence" className="relative z-10 py-32 px-6 bg-zinc-900/50 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
           <div className="flex-1">
              <h2 className="text-5xl font-black mb-8 leading-tight">Advanced behavioral <br /><span className="text-blue-500">intelligence.</span></h2>
              <ul className="space-y-6">
                 {[
                   'Automated category pattern matching',
                   'Late-night impulse purchase detection',
                   'Confidence-scored spending forecasts',
                   'One-click financial audit reports'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 text-zinc-400 font-bold">
                      <CheckCircle2 className="w-6 h-6 text-cyan-500" /> {item}
                   </li>
                 ))}
              </ul>
           </div>
           <div className="flex-1 glass-card p-8">
              <div className="space-y-6">
                 <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Critical Insight</h4>
                    <p className="text-sm font-bold">High spending on food detected! (42% of total)</p>
                 </div>
                 <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Predictive Model</h4>
                    <p className="text-sm font-bold">Projected Burn: ₹18,450 (High Confidence)</p>
                 </div>
                 <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Behavioral Pulse</h4>
                    <p className="text-sm font-bold">Frequent small transactions detected this week.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-32 px-6 max-w-7xl mx-auto text-center">
         <h2 className="text-5xl font-black mb-8">Ready to audit your future?</h2>
         <Link to="/signup" className="premium-button px-12 py-5 rounded-3xl text-xl font-black shadow-2xl shadow-blue-500/40 inline-flex items-center group">
            Create Verified Account <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
         </Link>
         <div className="mt-20 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm font-bold">
            <Logo showText size={24} />
            <div className="flex gap-8">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <Link to="/settings" className="hover:text-white transition-colors">Security</Link>
            </div>
            <p>© 2026 DataWallet Platform. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
