import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2,
  FileText, ClipboardList, RefreshCw, BarChart2,
  ChevronRight, FileSearch, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../App';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

interface Props {
  onNavigate: (view: string, filter?: string) => void;
}

export default function Overview({ onNavigate }: Props) {
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

  const approvalRate = statsData.total > 0 ? Math.round((statsData.approved / statsData.total) * 100) : 0;

  const stats = [
    { label: 'Mga Aplikasyon', value: statsData.total.toString(), sub: 'Lahat ng oras', icon: Users, color: 'blue', view: 'tracking', filter: undefined },
    { label: 'Mga Inaprubahan', value: statsData.approved.toString(), sub: 'Lahat ng oras', icon: CheckCircle2, color: 'emerald', view: 'tracking', filter: 'Inaprubahan' },
    { label: 'Para Sa Paglilinaw', value: statsData.forReview.toString(), sub: 'Lahat ng oras', icon: FileSearch, color: 'orange', view: 'tracking', filter: 'Para sa Paglilinaw' },
    { label: 'Ibinalik', value: statsData.returned.toString(), sub: 'Lahat ng oras', icon: RefreshCw, color: 'purple', view: 'tracking', filter: 'Ibinalik' },
    { label: 'Approval Rate', value: `${approvalRate}%`, sub: 'Lahat ng oras', icon: BarChart2, color: 'teal', view: 'reports', filter: undefined },
  ];

  const cardBg: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 shadow-blue-100/30',
    emerald: 'bg-emerald-50 border-emerald-100 shadow-emerald-100/30',
    orange: 'bg-orange-50 border-orange-100 shadow-orange-100/30',
    purple: 'bg-purple-50 border-purple-100 shadow-purple-100/30',
    teal: 'bg-teal-50 border-teal-100 shadow-teal-100/30',
  };

  const iconBg: Record<string, string> = {
    blue: 'bg-blue-600 text-white shadow-blue-300',
    emerald: 'bg-emerald-600 text-white shadow-emerald-300',
    orange: 'bg-orange-500 text-white shadow-orange-300',
    purple: 'bg-purple-600 text-white shadow-purple-300',
    teal: 'bg-teal-600 text-white shadow-teal-300',
  };

  const valueColor: Record<string, string> = {
    blue: 'text-blue-900',
    emerald: 'text-emerald-900',
    orange: 'text-orange-900',
    purple: 'text-purple-900',
    teal: 'text-teal-900',
  };

  const labelColor: Record<string, string> = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    teal: 'text-teal-500',
  };

  const btnColor: Record<string, string> = {
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    orange: 'text-orange-700',
    purple: 'text-purple-700',
    teal: 'text-teal-700',
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Welcome back, {user?.name || 'Member'} 👋
        </h2>
        <p className="text-slate-500 font-medium tracking-tight">Here's what's happening in PWD services in your barangay.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <button
              key={i}
              onClick={() => onNavigate(stat.view, stat.filter)}
              className={cn(
                "p-5 md:p-8 rounded-[40px] border shadow-xl text-left group hover:-translate-y-1 transition-all duration-300 w-full",
                cardBg[stat.color]
              )}
            >
               <div className="flex items-center justify-between mb-5 md:mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                    iconBg[stat.color]
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
               </div>
               <div className="space-y-1">
                 <h4 className={cn("text-2xl md:text-3xl font-black tracking-tight leading-none uppercase", valueColor[stat.color])}>{stat.value}</h4>
                 <p className={cn("text-[10px] font-black uppercase tracking-widest", labelColor[stat.color])}>{stat.label}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.sub}</p>
               </div>
               <div className={cn("mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group/btn", btnColor[stat.color])}>
                 {stat.view === 'reports' ? 'Buksan ang Ulat' : 'Tingnan Lahat'}
                 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
               </div>
            </button>
          );
        })}
      </div>

      {/* Recent Applications — full width */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 flex flex-col overflow-hidden">
        <div className="p-5 md:p-10 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight uppercase">Recent Applications</h3>
          <button
            onClick={() => onNavigate('tracking')}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
          >
            View All
          </button>
        </div>
        <div className="flex-grow">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-6 md:p-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : recentApps.length > 0 ? (
                recentApps.map((app, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 md:p-10 flex gap-3 md:gap-5">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{app.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{app.service}</p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-4 md:p-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      {app.date}
                    </td>
                    <td className="p-4 md:p-10 text-right">
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
                  <td colSpan={3} className="p-6 md:p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Walang aplikasyon
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-5 md:p-10 border-t border-slate-50 bg-[#fcfdff] text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Showing {recentApps.length} of {statsData.total} applications</p>
        </div>
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
