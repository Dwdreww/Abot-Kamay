import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Search, Megaphone, User,
  LogOut, Menu, Bell, ChevronDown,
  Settings, Info, Users
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { SystemNotification } from '../types';

// View Components
import Overview from './dashboard/Overview';
import PWDProfiles from './dashboard/PWDProfiles';
import DigitalForms from './dashboard/DigitalForms';
import ApplicationTracking from './dashboard/ApplicationTracking';
import RequirementsVerification from './dashboard/RequirementsVerification';
import ApplicationReview from './dashboard/ApplicationReview';
import Reports from './dashboard/Reports';
import Announcements from './dashboard/Announcements';
import UserManagement from './dashboard/UserManagement';
import AuditLogs from './dashboard/AuditLogs';
import SettingsView from './dashboard/Settings';
import Profile from './dashboard/Profile';
type ViewType = 'overview' | 'pwd' | 'forms' | 'tracking' | 'verification' | 'review' | 'reports' | 'announcements' | 'users' | 'audit' | 'settings' | 'profile';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [trackingFilter, setTrackingFilter] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigateTo = (view: ViewType, filter?: string) => {
    setTrackingFilter(view === 'tracking' ? filter : undefined);
    setActiveView(view);
  };
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: SystemNotification[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as SystemNotification);
      });
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleReadNotif = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    signOut();
  };

  const sections = [
    {
      label: 'Pangunahing Menu',
      items: [
        { id: 'forms', label: 'Mga Digital Form', icon: FileText, roles: ['admin', 'staff', 'member'] },
      ]
    },
    {
      label: 'Mga Serbisyo',
      items: [
        { id: 'tracking', label: 'Mga Aplikasyon', icon: Search, roles: ['admin', 'staff', 'member'] },
        { id: 'announcements', label: 'Mga Anunsyo', icon: Megaphone, roles: ['admin', 'staff', 'member'] },
        { id: 'profile', label: 'Profile / Account', icon: User, roles: ['admin', 'staff', 'member'] },
      ]
    }
  ];

  const adminTools = {
    label: 'Mga Tool ng Admin',
    items: [
      { id: 'overview', label: 'Dashboard', icon: Info, roles: ['admin', 'staff'] },
      { id: 'forms', label: 'Mga Digital Form', icon: FileText, roles: ['admin', 'staff'] },
      { id: 'tracking', label: 'Mga Aplikasyon', icon: Search, roles: ['admin', 'staff'] },
      { id: 'announcements', label: 'Mga Anunsyo', icon: Megaphone, roles: ['admin', 'staff'] },
      { id: 'pwd', label: 'PWD Member Directory', icon: User, roles: ['admin', 'staff'] },
      { id: 'reports', label: 'Mga Report', icon: Info, roles: ['admin', 'staff'] },
    ]
  };

  const systemTools = {
    label: 'Sistema',
    items: [
      { id: 'settings', label: 'Edit Profile', icon: Settings, roles: ['admin', 'staff'] },
      { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    ]
  };

  const filteredAdminTools = adminTools.items.filter(item => item.roles.includes(user?.role || 'member'));
  const filteredSystemTools = systemTools.items.filter(item => item.roles.includes(user?.role || 'member'));

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user?.role || 'member'))
  })).filter(section => section.items.length > 0);

  // Default to forms for members, overview for staff/admin
  useEffect(() => {
    if (user?.role === 'member' && activeView === 'overview') {
      setActiveView('forms');
    }
  }, [user]);

  return (
    <div className="flex h-screen w-full bg-[#f8faff] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <motion.nav
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={cn(
          "flex flex-col shrink-0 z-20 relative text-white transition-colors duration-500",
          user?.role === 'member'
            ? "bg-gradient-to-b from-[#2563FF] to-[#1d4ed8]"
            : "bg-[#0b1a38]"
        )}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <img src="/logoAbotKamay.png" alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-lg font-black leading-none uppercase tracking-tight">Abot-Kamay</h1>
              <p className="text-[8px] text-white/70 font-bold uppercase tracking-widest mt-1">Barangay PWD Platform</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-8">
          {user?.role === 'member' && filteredSections.map((section) => (
            <div key={section.label} className="space-y-2">
              {isSidebarOpen && (
                <label className="text-[10px] font-black text-white/50 uppercase px-4 mb-2 block tracking-[0.2em]">
                  {section.label}
                </label>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id as ViewType)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3.5 transition-all rounded-xl relative group font-bold",
                      isActive
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-white/60")} />
                    {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Admin Section if applicable */}
          {user?.role !== 'member' && filteredAdminTools.length > 0 && (
            <div className="space-y-2">
              {isSidebarOpen && (
                <label className="text-[10px] font-black text-white/50 uppercase px-4 mb-2 block tracking-[0.2em]">
                  PANGUNAHING MENU
                </label>
              )}
              {filteredAdminTools.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id as ViewType)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3.5 transition-all rounded-xl relative group font-bold",
                      isActive
                        ? (user?.role === 'member' ? "bg-white/20" : "bg-blue-600 shadow-xl shadow-blue-900/20")
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-white/60")} />
                    {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* System Section */}
          {filteredSystemTools.length > 0 && (
            <div className="space-y-2 pt-4">
              {isSidebarOpen && (
                <label className="text-[10px] font-black text-white/50 uppercase px-4 mb-2 block tracking-[0.2em]">
                  SISTEMA
                </label>
              )}
              {filteredSystemTools.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id as ViewType)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3.5 transition-all rounded-xl relative group font-bold",
                      isActive
                        ? (user?.role === 'member' ? "bg-white/20 text-white" : "bg-blue-600 text-white shadow-xl shadow-blue-900/20")
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-white/60")} />
                    {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="p-6 space-y-6">
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors font-bold text-xs uppercase tracking-widest",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Mag-Log Out</span>}
          </button>

          {isSidebarOpen && (
            <div className="pt-2 text-[8px] font-bold text-white/30 uppercase tracking-widest text-center">
              Abot-Kamay v1.2.0 <br /> Brgy. San Antonio de Padua I
            </div>
          )}
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-400" />
          </button>

          <div className="flex items-center gap-8 relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute top-12 right-40 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mga Notipikasyon</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Wala pang notipikasyon</div>
                  ) : (
                    notifications.map(n => (
                      <button 
                        key={n.id}
                        onClick={() => { if(!n.isRead) handleReadNotif(n.id!); setIsNotifOpen(false); if(user?.role === 'member') navigateTo('tracking'); }}
                        className={cn("w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors", !n.isRead && "bg-blue-50/30")}
                      >
                        <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", n.type === 'success' ? 'text-emerald-600' : n.type === 'error' ? 'text-red-600' : n.type === 'warning' ? 'text-amber-600' : 'text-blue-600')}>{n.title}</p>
                        <p className={cn("text-sm", !n.isRead ? "font-bold text-slate-900" : "text-slate-600")}>{n.message}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                          {n.createdAt ? n.createdAt.toDate().toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ngayon'}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-slate-900">{user?.name}</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  System Active
                </span>
              </div>
              <div className="relative group">
                <button 
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                  className="flex items-center gap-2"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute top-12 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
                    <button 
                      onClick={() => { setActiveView('profile'); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-widest flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      Aking Profile
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 uppercase tracking-widest flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Mag-Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-10 bg-[#f8faff]">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeView === 'overview' && <Overview onNavigate={navigateTo} />}
                {activeView === 'pwd' && <PWDProfiles />}
                {activeView === 'forms' && <DigitalForms />}
                {activeView === 'tracking' && <ApplicationTracking initialFilter={trackingFilter} />}
                {activeView === 'verification' && <RequirementsVerification />}
                {activeView === 'review' && <ApplicationReview />}
                {activeView === 'reports' && <Reports />}
                {activeView === 'announcements' && <Announcements />}
                {activeView === 'users' && <UserManagement />}
                {activeView === 'audit' && <AuditLogs />}
                {activeView === 'settings' && <SettingsView />}
                {activeView === 'profile' && <Profile />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

