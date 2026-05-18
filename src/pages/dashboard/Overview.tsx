import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, 
  ArrowUpRight, ArrowDownRight,
  Shield, Search, Download, Calendar,
  FileText, ClipboardList, RefreshCw, BarChart2,
  ChevronRight, ArrowRight, UserPlus, FileSearch, HelpCircle, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../App';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

export default function Overview() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    total: 0,
    approved: 0,
    forReview: 0,
    returned: 0
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // For a real production app with thousands of records, we would use aggregations.
      // Since this is a smaller system, we can fetch the recent ones and do basic counting.
      // But let's at least get all for stats and just latest 5 for recent.
      const q = query(collection(db, 'applications'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      let total = 0;
      let approved = 0;
      let forReview = 0;
      let returned = 0;
      const recents: any[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'approved' || data.status === 'completed') approved++;
        if (data.status === 'pending' || data.status === 'for_review' || data.status === 'draft') forReview++;
        if (data.status === 'returned') returned++;

        if (recents.length < 5) {
          recents.push({
            id: doc.id,
            name: data.applicantName || 'Unknown',
            service: data.formTitle || data.formType,
            date: data.submittedAt ? data.submittedAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A',
            status: data.status,
            color: (data.status === 'approved' || data.status === 'completed') ? 'emerald' : 
                   (data.status === 'returned') ? 'purple' : 'orange'
          });
        }
      });

      setStatsData({ total, approved, forReview, returned });
      setRecentApps(recents);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Applications', value: statsData.total.toString(), sub: 'All time', icon: Users, color: 'blue' },
    { label: 'Approved', value: statsData.approved.toString(), sub: 'All time', icon: CheckCircle2, color: 'emerald' },
    { label: 'For Review', value: statsData.forReview.toString(), sub: 'All time', icon: FileSearch, color: 'orange' },
    { label: 'Returned', value: statsData.returned.toString(), sub: 'All time', icon: RefreshCw, color: 'purple' },
    { label: 'On-time Processing', value: '92%', sub: 'This month', icon: BarChart2, color: 'blue' },
  ];

  const quickAccess = [
    { title: 'PWD ID Application', desc: 'Create a new PWD ID application for a resident.', icon: FileText, color: 'orange' },
    { title: 'DOH PhilHealth Registry (PDS)', desc: 'Register or lookup PWD in the DOH PDS portal.', icon: UserPlus, color: 'purple' },
    { title: 'Barangay Certification', desc: 'Request or issue barangay certification.', icon: UserPlus, color: 'emerald' },
    { title: 'Other Requests', desc: 'File other PWD-related requests and services.', icon: FileText, color: 'blue' },
    { title: 'View All Applications', desc: 'Browse and manage all applications.', icon: FileSearch, color: 'purple' },
    { title: 'Generate Reports', desc: 'Create reports and export application data.', icon: BarChart2, color: 'emerald' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Welcome back, {user?.name || 'Member'} 👋
        </h2>
        <p className="text-slate-500 font-medium tracking-tight">Here's what's happening in PWD services in your barangay.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:-translate-y-1 transition-all duration-300">
               <div className="flex items-center justify-between mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600 shadow-blue-100" :
                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" :
                    stat.color === 'orange' ? "bg-orange-50 text-orange-600 shadow-orange-100" :
                    "bg-purple-50 text-purple-600 shadow-purple-100"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
               </div>
               <div className="space-y-1">
                 <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">{stat.value}</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">{stat.sub}</p>
               </div>
               <button className="mt-6 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group/btn">
                 {stat.label === 'On-time Processing' ? 'View Reports' : 'View Details'}
                 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
               </button>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
         {/* Recent Applications Left column */}
         <div className="lg:col-span-3 bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 flex flex-col overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Applications</h3>
               <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="flex-grow">
               <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                       <tr>
                         <td colSpan={3} className="p-10 text-center">
                           <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                         </td>
                       </tr>
                     ) : recentApps.length > 0 ? (
                       recentApps.map((app, i) => (
                         <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="p-10 flex gap-5">
                               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                  <ClipboardList className="w-6 h-6" />
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{app.name}</p>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{app.service}</p>
                               </div>
                            </td>
                            <td className="p-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                               {app.date}
                            </td>
                            <td className="p-10 text-right">
                               <span className={cn(
                                 "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                 app.color === 'orange' ? "bg-orange-50 text-orange-600" : 
                                 app.color === 'purple' ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                               )}>
                                  {app.status === 'approved' || app.status === 'completed' ? 'Inaprubahan' :
                                   app.status === 'returned' ? 'Ibalik' :
                                   app.status === 'rejected' ? 'Tinanggihan' : 'Sinusuri'}
                               </span>
                            </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={3} className="p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                           Walang aplikasyon
                         </td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
            <div className="p-10 border-t border-slate-50 bg-[#fcfdff] text-center">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Showing {recentApps.length} of {statsData.total} applications</p>
            </div>
         </div>

         {/* Quick Access Right column */}
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 p-12 space-y-10">
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Quick Access</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {quickAccess.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="group cursor-pointer space-y-4">
                         <div className={cn(
                           "p-4 rounded-2xl w-fit transition-all group-hover:scale-110 shadow-lg",
                           item.color === 'orange' ? "bg-orange-50 text-orange-600 shadow-orange-100" :
                           item.color === 'purple' ? "bg-purple-50 text-purple-600 shadow-purple-100" :
                           "bg-emerald-50 text-emerald-600 shadow-emerald-100"
                         )}>
                            <Icon className="w-6 h-6" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                         </div>
                         <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>
      </div>

      {/* Community Banner */}
      <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="w-64 h-32 bg-blue-50 rounded-3xl overflow-hidden relative shadow-inner">
                  <img src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop" alt="Community" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-blue-900/10"></div>
               </div>
               <div className="space-y-3 text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">We're here to help our PWD community.</h3>
                  <p className="text-slate-400 font-medium max-w-lg leading-snug">
                    Every application you process helps build a more inclusive and compassionate barangay. Need tools or documentation?
                  </p>
               </div>
            </div>
            <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
               <HelpCircle className="w-5 h-5" />
               Visit Help Center
            </button>
         </div>
         {/* Background Watermark */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 transition-all duration-1000 group-hover:scale-110"></div>
      </div>

      {/* Footer Branding */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">© 2025 Abot-Kamay. All rights reserved.</p>
         <div className="flex items-center gap-8">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Privacy Policy</button>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Terms of Service</button>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Data Privacy Notice</button>
         </div>
      </div>
    </div>
  );
}
