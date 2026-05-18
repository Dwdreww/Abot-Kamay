import React, { useState } from 'react';
import { 
  Search, Filter, ChevronRight, User, 
  Settings, Clock, Shield, Database,
  Download, Filter as FilterIcon, Info, 
  CheckCircle2, XCircle, AlertTriangle,
  Monitor, Smartphone, Globe, ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AuditLogs() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const logs = [
    { id: 'EVT-2024-083451', user: 'Juan Dela Cruz', email: 'juan.delacruz@abotkamay.gov.ph', role: 'Validator', module: 'Application Review', action: 'Updated Application', recordId: 'APP-2024-00128', ip: '192.168.1.45', device: 'Chrome 124 / Windows 11', time: 'May 10, 2024 10:21:45 AM', result: 'Success', color: 'emerald' },
    { id: 'EVT-2024-083450', user: 'Maria Santos', email: 'maria.santos@abotkamay.gov.ph', role: 'Reviewer', module: 'Member Records', action: 'Viewed Record', recordId: 'MEM-2024-00477', ip: '172.16.5.22', device: 'Edge 124 / Windows 11', time: 'May 10, 2024 10:19:02 AM', result: 'Success', color: 'emerald' },
    { id: 'EVT-2024-083449', user: 'Pedro Reyes', email: 'pedro.reyes@abotkamay.gov.ph', role: 'Admin', module: 'User Management', action: 'Created User', recordId: 'USR-2024-00156', ip: '192.168.1.12', device: 'Chrome 124 / Windows', time: 'May 10, 2024 10:17:33 AM', result: 'Success', color: 'emerald' },
    { id: 'EVT-2024-083448', user: 'Liza Martin', email: 'liza.martin@abotkamay.gov.ph', role: 'Validator', module: 'Document Validation', action: 'Rejected Document', recordId: 'DOC-2024-00988', ip: '192.168.1.45', device: 'Chrome 124 / Windows', time: 'May 10, 2024 10:15:11 AM', result: 'Failed', color: 'red' },
    { id: 'EVT-2024-083447', user: 'Ramon Garcia', email: 'ramon.garcia@abotkamay.gov.ph', role: 'Staff', module: 'Announcements', action: 'Published Announcement', recordId: 'ANN-2024-00034', ip: '10.0.0.18', device: 'Firefox 125 / Windows', time: 'May 10, 2024 10:12:44 AM', result: 'Success', color: 'emerald' },
  ];

  const stats = [
    { label: 'Total Events', value: '12,845', growth: '+18.6%', icon: Database, color: 'blue' },
    { label: 'Successful Actions', value: '11,247', growth: '87.6%', icon: CheckCircle2, color: 'emerald' },
    { label: 'Failed Actions', value: '1,204', growth: '9.4%', icon: XCircle, color: 'orange' },
    { label: 'Unique Users', value: '156', growth: '+6.3%', icon: User, color: 'blue' },
    { label: 'High Severity', value: '342', growth: '+14.7%', icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Audit Logs</h2>
        <p className="text-slate-500 font-medium">Track system activity, data changes, and administrative actions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:-translate-y-1 transition-all duration-300">
               <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                    stat.color === 'orange' ? "bg-orange-50 text-orange-600" :
                    "bg-red-50 text-red-600"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    stat.growth.startsWith('+') ? "text-emerald-500" : "text-slate-400"
                  )}>{stat.growth} {stat.growth.includes('%') && i === 0 && "vs yesterday"}</span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h4 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{stat.value}</h4>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Advanced Filters
            </h3>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600">Clear All Filters</button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            <FilterField label="User" options={["All Users", "Marlene Bautista", "Juan Dela Cruz"]} />
            <FilterField label="Module" options={["All Modules", "Application Review", "Member Records", "Settings"]} />
            <FilterField label="Action Type" options={["All Actions", "Create", "Update", "Delete", "View"]} />
            <FilterField label="Severity" options={["All Severities", "Low", "Medium", "High", "Critical"]} />
         </div>

         <div className="flex justify-end pt-4">
            <button className="px-12 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95">
               Apply Filters
            </button>
         </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Database className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">System Audit Logs</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">12,845 results found</p>
               </div>
            </div>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
               <Download className="w-4 h-4 text-blue-600" />
               Export Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fcfdff]">
                <tr>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Module / Action</th>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedEvent(log)}
                    className={cn(
                      "group hover:bg-blue-50/50 transition-all cursor-pointer relative",
                      selectedEvent?.id === log.id && "bg-blue-50"
                    )}
                  >
                    <td className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-tight">{log.time}</td>
                    <td className="px-10 py-6">
                       <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{log.user}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{log.role}</p>
                    </td>
                    <td className="px-10 py-6">
                       <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight mb-1">{log.module}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.action}</p>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em]",
                         log.color === 'emerald' ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-600"
                       )}>
                          {log.result}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/40 p-10 flex flex-col h-full sticky top-8">
              <h4 className="text-xl font-black text-slate-900 tracking-tight mb-10">Event Details</h4>
              {selectedEvent ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <DetailField label="Timestamp" value={selectedEvent.time} />
                   <DetailField label="User" value={selectedEvent.user} />
                   <DetailField label="Action" value={selectedEvent.action} />
                   <DetailField label="IP / Device" value={selectedEvent.ip} />
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 overflow-hidden">
                      <pre className="text-[9px] font-mono text-slate-500 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify({ field: 'status', old: 'Pending', new: 'Approved' }, null, 2)}
                      </pre>
                   </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center space-y-4 text-center opacity-40">
                   <Search className="w-12 h-12 text-slate-200" />
                   <p className="text-xs font-bold uppercase tracking-widest">Select entry to view</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none pr-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat">
          {options.map(opt => <option key={opt}>{opt}</option>)}
       </select>
    </div>
  );
}

function DetailField({ label, value }: { label: string, value: string }) {
  return (
     <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-black text-slate-900 leading-tight tracking-tight">{value}</p>
     </div>
  )
}
