import React, { useState } from 'react';
import { 
  UserCog, Shield, User, Mail, Search, Plus, 
  MoreVertical, ShieldCheck, ShieldAlert, 
  Lock, Unlock, Eye, Trash2, Edit3, 
  History, Settings, Key, Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const systemUsers = [
    { id: 'USR-001', name: 'Marlene Garcia', email: 'm.garcia@sadp.gov.ph', role: 'System Admin', status: 'Active', lastLogin: '12 mins ago', permissions: ['all'] },
    { id: 'USR-002', name: 'Ricardo Santos', email: 'r.santos@sadp.gov.ph', role: 'Barangay Staff', status: 'Active', lastLogin: '2 hours ago', permissions: ['read', 'write', 'verify'] },
    { id: 'USR-003', name: 'Elena Guerrero', email: 'e.guerrero@email.com', role: 'PWD Member', status: 'Active', lastLogin: '1 day ago', permissions: ['read', 'apply'] },
    { id: 'USR-004', name: 'Mateo Rizal', email: 'm.rizal@sadp.gov.ph', role: 'Barangay Staff', status: 'Inactive', lastLogin: '5 days ago', permissions: ['read', 'write'] },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Access Control</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage system users, assigned roles, and granular security permissions.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200/40 hover:bg-slate-50 transition-all">
             <History className="w-5 h-5 text-blue-600" />
             Audit Logs
           </button>
           <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-blue-500 active:scale-95">
             <Plus className="w-5 h-5" />
             New System User
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-6 gap-10">
         {/* User List Table */}
         <div className={cn(
           "transition-all duration-500",
           selectedUser ? "lg:col-span-3" : "lg:col-span-6"
         )}>
            <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
               <div className="p-10 border-b border-slate-50 bg-white">
                  <div className="flex items-center gap-4 relative">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="text" 
                       placeholder="Search by name, email, or role..."
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-300"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-[#fcfdff]">
                        <tr>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System User</th>
                           {!selectedUser && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Role</th>}
                           {!selectedUser && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Status</th>}
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {systemUsers.map((u) => (
                          <tr 
                            key={u.id} 
                            onClick={() => setSelectedUser(u)}
                            className={cn(
                              "group transition-all cursor-pointer",
                              selectedUser?.id === u.id ? "bg-blue-50/50" : "hover:bg-blue-50/30"
                            )}
                          >
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-50 rounded-[18px] flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-all font-black text-slate-300 text-xs">
                                      {u.name.split(' ').map(n => n[0]).join('')}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none mb-1.5">{u.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 lowercase tracking-tight leading-none">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             {!selectedUser && (
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-2">
                                     <Shield className={cn(
                                       "w-4 h-4",
                                       u.role === 'System Admin' ? "text-purple-600" : "text-blue-600"
                                     )} />
                                     <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{u.role}</span>
                                  </div>
                               </td>
                             )}
                             {!selectedUser && (
                               <td className="px-10 py-8">
                                  <span className={cn(
                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                    u.status === 'Active' ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-600 border border-red-100"
                                  )}>
                                     {u.status}
                                  </span>
                               </td>
                             )}
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-2">
                                   <button className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-xl hover:shadow-blue-200/50 transition-all">
                                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Detailed User & Permission Panel */}
         <AnimatePresence>
            {selectedUser && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-3 space-y-10"
              >
                 <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/40 p-12 lg:p-16 relative overflow-hidden flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12 pb-12 border-b border-slate-50">
                       <div className="space-y-1">
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Security Profile</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editing User ID: {selectedUser.id}</p>
                       </div>
                       <button 
                        onClick={() => setSelectedUser(null)}
                        className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                       >
                          <ShieldAlert className="w-6 h-6" />
                       </button>
                    </div>

                    {/* Role Identity Card */}
                    <div className="bg-[#0b1a38] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden mb-12">
                       <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                          <div className="flex items-center gap-6">
                             <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center border border-white/10 shrink-0">
                                <ShieldCheck className="w-10 h-10 text-blue-400" />
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-2xl font-black tracking-tight leading-none uppercase">{selectedUser.name}</h4>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedUser.role}</p>
                             </div>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Network Status</span>
                             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{selectedUser.status}</span>
                             </div>
                          </div>
                       </div>
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-10 mb-16">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                             <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                             Granular Permissions
                          </h4>
                          <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Reset Default</button>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <PermissionToggle label="Document Verification" description="Allow approving/rejecting submitted docs" checked />
                          <PermissionToggle label="Member Enrollment" description="Add or edit PWD member records" checked />
                          <PermissionToggle label="System Configuration" description="Modify site settings and announcements" />
                          <PermissionToggle label="Financial Management" description="Process assistance grants and payments" />
                          <PermissionToggle label="Network Audit Access" description="View system-wide activity and audit logs" checked />
                          <PermissionToggle label="Application Overrides" description="Bypass standard validation protocols" />
                       </div>
                    </div>

                    {/* Meta Data */}
                    <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 grid md:grid-cols-2 gap-10 mb-16">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Authorized Login</p>
                          <div className="flex items-center gap-3 text-slate-900">
                             <History className="w-4 h-4 text-slate-400" />
                             <span className="text-sm font-black tracking-tight">{selectedUser.lastLogin}</span>
                          </div>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Access Node</p>
                          <div className="flex items-center gap-3 text-slate-900">
                             <Globe className="w-4 h-4 text-slate-400" />
                             <span className="text-sm font-black tracking-tight tracking-widest uppercase">Barangay Hall Terminal 04</span>
                          </div>
                       </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-10 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                       <div className="flex gap-4">
                          <button className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 border border-slate-100 rounded-3xl group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-100 w-24">
                             <Key className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                             <span className="text-[8px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">PWD Reset</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 border border-slate-100 rounded-3xl group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-100 w-24">
                             <Lock className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
                             <span className="text-[8px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Suspend</span>
                          </button>
                       </div>
                       <div className="flex gap-4 flex-grow lg:flex-grow-0">
                          <button className="flex-grow lg:flex-none px-12 py-5 bg-slate-900 text-white rounded-[25px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-slate-200/50 transition-all active:scale-95">
                             Update Policy
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function PermissionToggle({ label, description, checked = false }: { label: string, description: string, checked?: boolean }) {
  const [active, setActive] = useState(checked);
  
  return (
    <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[30px] hover:shadow-lg hover:shadow-blue-100/50 shadow-sm transition-all group">
       <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{label}</p>
          <p className="text-[9px] font-medium text-slate-400 leading-none">{description}</p>
       </div>
       <button 
        onClick={() => setActive(!active)}
        className={cn(
          "w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner border",
          active ? "bg-blue-600 border-blue-600 shadow-blue-200" : "bg-slate-100 border-slate-200 shadow-slate-200"
        )}
       >
          <div className={cn(
            "w-5 h-5 bg-white rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 shadow-md",
            active ? "right-1" : "left-1"
          )}></div>
       </button>
    </div>
  )
}
