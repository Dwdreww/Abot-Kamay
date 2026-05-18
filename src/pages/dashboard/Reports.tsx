import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Download, Filter, 
  ChevronRight, Calendar, Info, 
  TrendingUp, TrendingDown, Users,
  CheckCircle2, FileText, PieChart as PieIcon,
  Search, ArrowUpRight, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    total: 0,
    approved: 0,
    processingDays: 0,
    activeMembers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'applications'), orderBy('submittedAt', 'asc'));
      const snapshot = await getDocs(q);
      
      let total = 0;
      let approved = 0;
      let members = 0;
      
      // For charting
      const monthlyData: Record<string, number> = {};
      
      // For distribution
      const formTypes: Record<string, number> = {
        'DOH PRPWD Registry': 0,
        'PWD Burial Assistance': 0,
        'Barangay Certification': 0,
        'Membership Cancellation': 0
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'approved' || data.status === 'completed') approved++;
        
        if (data.formTitle) {
          if (data.formTitle.includes('DOH') || data.formTitle.includes('PRPWD')) formTypes['DOH PRPWD Registry']++;
          else if (data.formTitle.includes('Burial')) formTypes['PWD Burial Assistance']++;
          else if (data.formTitle.includes('Cert')) formTypes['Barangay Certification']++;
          else if (data.formTitle.includes('Cancel')) formTypes['Membership Cancellation']++;
        }

        if (data.submittedAt) {
          const date = data.submittedAt.toDate();
          const month = date.toLocaleString('en-US', { month: 'short' });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
      });

      // Query members (users collection)
      const usersSnap = await getDocs(query(collection(db, 'users')));
      usersSnap.forEach(doc => {
        if (doc.data().role === 'member') members++;
      });

      setStatsData({
        total,
        approved: total > 0 ? Math.round((approved / total) * 100) : 0,
        processingDays: 2.4, // Mocked for now
        activeMembers: members
      });

      // Format chart data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedChart = months.filter(m => monthlyData[m] !== undefined).map(m => ({
        name: m,
        value: monthlyData[m] || 0
      }));
      setChartData(formattedChart.length > 0 ? formattedChart : [{ name: 'N/A', value: 0 }]);

      // Format distribution
      setDistributionData([
        { name: 'PRPWD Registry', value: formTypes['DOH PRPWD Registry'] || 0, color: '#2563FF' },
        { name: 'Burial Asst', value: formTypes['PWD Burial Assistance'] || 0, color: '#10b981' },
        { name: 'Barangay Cert', value: formTypes['Barangay Certification'] || 0, color: '#8b5cf6' },
        { name: 'Cancellation', value: formTypes['Membership Cancellation'] || 0, color: '#ef4444' }
      ].filter(d => d.value > 0));

    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Applications', value: statsData.total.toString(), grow: 'Live', isUp: true, icon: FileText, color: 'blue' },
    { label: 'Approval Rate', value: `${statsData.approved}%`, grow: 'Live', isUp: true, icon: CheckCircle2, color: 'emerald' },
    { label: 'Average Processing', value: `${statsData.processingDays} Days`, grow: 'Estimated', isUp: true, icon: Calendar, color: 'purple' },
    { label: 'Active Members', value: statsData.activeMembers.toString(), grow: 'Live', isUp: true, icon: Users, color: 'blue' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Reports & Analytics</h2>
          <p className="text-slate-500 font-medium tracking-tight">System-wide data insights, application trends, and demographic analytics.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200/20 hover:bg-slate-50 transition-all">
             <Calendar className="w-5 h-5 text-blue-600" />
             Jan 01 - Jun 30, 2024
           </button>
           <button className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-500 transition-all">
             <Download className="w-5 h-5" />
             Export All Data
           </button>
        </div>
      </div>

      {/* Grid of Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {stats.map((stat, i) => {
           const Icon = stat.icon;
           return (
             <div key={i} className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                        stat.color === 'blue' ? "bg-blue-50 text-blue-600 shadow-blue-100" :
                        stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" :
                        "bg-purple-50 text-purple-600 shadow-purple-100"
                      )}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter",
                        stat.isUp ? "text-emerald-500" : "text-rose-500"
                      )}>
                         {stat.grow}
                         {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{stat.value}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
             </div>
           );
         })}
      </div>

      {/* Main Charts Architecture */}
      <div className="grid lg:grid-cols-3 gap-10">
         {/* Large Area Chart */}
         <div className="lg:col-span-2 bg-white p-12 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Application Trends</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Growth analysis of applications over time</p>
               </div>
               <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
                  {['Daily', 'Weekly', 'Monthly'].map((t) => (
                    <button 
                      key={t}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        t === 'Monthly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="h-[400px] w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563FF" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#2563FF" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                     />
                     <Tooltip 
                       contentStyle={{ 
                         borderRadius: '24px', 
                         border: 'none', 
                         boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                         fontSize: '11px',
                         fontWeight: 900,
                         textTransform: 'uppercase',
                         letterSpacing: '0.05em'
                       }}
                     />
                     <Area type="monotone" dataKey="value" stroke="#2563FF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Chart */}
         <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 flex flex-col">
            <div className="mb-10">
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Application Distribution</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Breakdown by form type</p>
            </div>
            <div className="flex-grow flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={distributionData}
                       cx="50%"
                       cy="50%"
                       innerRadius={85}
                       outerRadius={115}
                       paddingAngle={8}
                       dataKey="value"
                     >
                       {distributionData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                       ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{statsData.total}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
               </div>
            </div>
            <div className="mt-10 space-y-4">
               {distributionData.map((d, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{d.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{Math.round((d.value / Math.max(1, statsData.total)) * 100)}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Reports Table / Feed */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden">
         <div className="p-12 border-b border-slate-50 flex items-center justify-between">
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Detailed Report Logs</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Access specific metrics for historical data</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input type="text" placeholder="Search logs..." className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none text-[11px] font-black uppercase tracking-widest w-64 shadow-inner" />
               </div>
               <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                  <Filter className="w-5 h-5" />
               </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
               <thead className="bg-[#fcfdff]">
                  <tr>
                     <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Title</th>
                     <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author / Generetor</th>
                     <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</th>
                     <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Format</th>
                     <th className="px-12 py-6"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {[
                    { title: 'Quarterly Demographic Report', author: 'Admin Kamay', range: 'Jan - Mar 2024', format: 'PDF', color: 'rose' },
                    { title: 'Application Processing Audit', author: 'Staff Maria', range: 'May 01 - May 31, 2024', format: 'Excel', color: 'emerald' },
                    { title: 'Financial Assistance Summary', author: 'System Auto', range: 'Jun 2024', format: 'PDF', color: 'rose' },
                    { title: 'PWD Registry Export', author: 'Admin Kamay', range: 'Full Database', format: 'CSV', color: 'blue' },
                  ].map((row, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-12 py-8 flex items-center gap-5">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                             <FileText className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{row.title}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Historical Data</p>
                          </div>
                       </td>
                       <td className="px-12 py-8">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-black text-[9px] text-slate-400">AK</div>
                             <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{row.author}</p>
                          </div>
                       </td>
                       <td className="px-12 py-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {row.range}
                       </td>
                       <td className="px-12 py-8 text-center">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                            row.color === 'rose' ? "bg-rose-50 text-rose-600" :
                            row.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                            "bg-blue-50 text-blue-600"
                          )}>
                             {row.format}
                          </span>
                       </td>
                       <td className="px-12 py-8 text-right">
                          <button className="p-3 rounded-xl border border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-200 transition-all">
                             <Download className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
