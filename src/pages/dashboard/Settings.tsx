import React from 'react';
import { 
  User, Bell, Shield, 
  ChevronRight, Globe, Moon,
  LogOut, Camera, Mail, Phone,
  MapPin, Lock, CreditCard, HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../App';

export default function Settings() {
  const { user, signOut } = useAuth();

  const settingsGroups = [
    {
      title: 'Profile Settings',
      desc: 'Information about the staff member and account identity.',
      items: [
        { label: 'Edit Profile Information', icon: User, desc: 'Update your name, designation and info.' },
        { label: 'Notification Preferences', icon: Bell, desc: 'Manage how you receive alerts and subscritions.' },
        { label: 'Language & Region', icon: Globe, desc: 'Select your preferred language and time zone.' },
      ]
    },
    {
      title: 'Security & Access',
      desc: 'Secure your account and manage validation access.',
      items: [
        { label: 'Change Password', icon: Lock, desc: 'Keep your account secure with regular updates.' },
        { label: 'Two-Factor Authentication', icon: Shield, desc: 'Add an extra layer of security to your login.' },
        { label: 'Login History & Active Sessions', icon: CreditCard, desc: 'Monitor where and when you logged in.' },
      ]
    },
    {
      title: 'Support & About',
      desc: 'Get help and information about Abot-Kamay.',
      items: [
        { label: 'Help Center & Documentation', icon: HelpCircle, desc: 'Find answers and learn how to use the system.' },
        { label: 'Terms of Service', icon: HelpCircle, desc: 'Review the terms and conditions of usage.' },
        { label: 'Privacy Policy', icon: Shield, desc: 'Learn how we protect your personal data.' },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl">
       {/* Header */}
       <div className="space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Settings</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage your account preferences, security settings, and system configurations.</p>
       </div>

       {/* User Profile Card */}
       <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 p-12 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
             <div className="relative group/avatar">
                <div className="w-32 h-32 rounded-[45px] bg-[#0b1a38] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform group-hover/avatar:scale-105">
                   {user?.name?.split(' ').map(n => n[0]).join('') || 'AK'}
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all">
                   <Camera className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex-grow text-center md:text-left space-y-4">
                <div className="space-y-1">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">{user?.name || 'Admin User'}</h3>
                   <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">{user?.role === 'admin' ? 'Administrator' : 'Barangay Staff'}</p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                   <div className="flex items-center gap-2 text-slate-400 font-bold transition-colors hover:text-blue-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-widest">{user?.email || 'admin@abotkamay.ph'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400 font-bold transition-colors hover:text-blue-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-widest">Available / Online</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400 font-bold transition-colors hover:text-blue-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-widest">San Lorenzo Barangay</span>
                   </div>
                </div>
             </div>

             <button className="px-10 py-5 bg-slate-50 hover:bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                Update Info
             </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
       </div>

       {/* Settings Groups */}
       <div className="space-y-10">
          {settingsGroups.map((group, i) => (
            <div key={i} className="space-y-6">
               <div className="pl-4">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{group.title}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">{group.desc}</p>
               </div>
               
               <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl shadow-slate-200/10 overflow-hidden divide-y divide-slate-50">
                  {group.items.map((item, j) => {
                    const Icon = item.icon;
                    return (
                      <button key={j} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors group/item">
                         <div className="flex items-center gap-6 text-left">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all shadow-sm">
                               <Icon className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1 group-hover/item:text-blue-600 transition-colors">{item.label}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.desc}</p>
                            </div>
                         </div>
                         <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover/item:text-blue-600 transition-colors">
                            <ChevronRight className="w-6 h-6 group-hover/item:translate-x-1 transition-all" />
                         </div>
                      </button>
                    );
                  })}
               </div>
            </div>
          ))}
       </div>

       {/* Sign Out Section */}
       <div className="pt-10 flex items-center justify-between border-t border-slate-100">
          <div>
             <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Security Sign Out</h4>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Log out of your account on this device safely.</p>
          </div>
          <button 
           onClick={signOut}
           className="px-10 py-5 bg-rose-50 text-rose-600 border border-rose-100 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100/50 flex items-center gap-3 active:scale-95"
          >
             <LogOut className="w-5 h-5" />
             Sign Out Account
          </button>
       </div>
    </div>
  );
}
