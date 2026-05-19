import React, { useEffect, useMemo, useState } from 'react';
import {
  UserCog, Shield, User, Mail, Search, Plus,
  MoreVertical, ShieldCheck, ShieldAlert,
  Lock, Unlock, Eye, Trash2, Edit3,
  History, Settings, Key, Globe,
  X, CheckCircle, Loader2, EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import firebaseConfig from '../../../firebase-applet-config.json';

// ─── New User Modal ───────────────────────────────────────────────────────────

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  rawRole: string;
  status: string;
  lastLogin: string;
  permissions: string[];
  contactNumber?: string;
};

function roleLabel(role: string) {
  if (role === 'admin') return 'System Admin';
  if (role === 'staff') return 'Kawani ng Barangay';
  return 'Miyembro ng PWD';
}

function statusLabel(status?: string) {
  return status === 'deactivated' ? 'Hindi Aktibo' : 'Aktibo';
}

function permissionsForRole(role: string) {
  if (role === 'admin') return ['all'];
  if (role === 'staff') return ['read', 'write', 'verify'];
  return ['read', 'apply'];
}

function formatLastLogin(value: any) {
  const date = value?.toDate?.() || value;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('fil-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return 'Hindi pa nakakapag-login';
}

function NewUserModal({ isOpen, onClose }: NewUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as 'admin' | 'staff' | '',
    contactNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    if (creating) return;
    setFormData({ name: '', email: '', password: '', role: '', contactNumber: '' });
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.role) {
      setError('Pakikumpleto ang lahat ng kinakailangang fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Ang password ay dapat hindi bababa sa 6 na karakter.');
      return;
    }

    setCreating(true);
    setError(null);

    // Use a uniquely named secondary app so the admin's session is untouched
    const secondaryAppName = `new-user-${Date.now()}`;
    let secondaryApp: any = null;

    try {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email.trim(),
        formData.password
      );

      const uid = credential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        contactNumber: formData.contactNumber.trim(),
        address: '',
        age: '',
        gender: '',
        birthdate: '',
        avatarUrl: '',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Ang email na ito ay ginagamit na ng ibang account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Hindi valid ang format ng email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Masyadong mahina ang password. Gumamit ng mas mahabang kombinasyon.');
      } else {
        setError(`Hindi nagawa ang account: ${err.message}`);
      }
    } finally {
      if (secondaryApp) {
        try { await deleteApp(secondaryApp); } catch (_) {}
      }
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-6 sm:py-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative my-auto w-full max-w-lg max-h-[calc(100vh-3rem)] bg-white rounded-[40px] shadow-2xl shadow-slate-900/20 overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-10 pt-10 pb-8 border-b border-slate-50">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Bagong Gumagamit</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Magdagdag ng bagong admin o kawani ng barangay</p>
          </div>
          <button
            onClick={handleClose}
            disabled={creating}
            className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className="px-10 py-12 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Account Nagawa na!</h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Ang account ni <strong className="text-slate-900">{formData.name}</strong> bilang{' '}
                <strong className="text-blue-600">
                  {formData.role === 'admin' ? 'System Admin' : 'Kawani ng Barangay'}
                </strong>{' '}
                ay matagumpay na nalikha. Maaari na silang mag-login gamit ang kanilang email at password.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Isara
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6">
            {/* Role selector — shown first so intent is clear */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Itinalagang Papel <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'admin', label: 'System Admin', desc: 'Buong access sa lahat ng feature', color: 'purple' },
                  { value: 'staff', label: 'Kawani ng Barangay', desc: 'Access sa mga aplikasyon at miyembro', color: 'blue' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: opt.value as 'admin' | 'staff' })}
                    className={cn(
                      "p-5 rounded-2xl border-2 text-left transition-all",
                      formData.role === opt.value
                        ? opt.color === 'purple'
                          ? "border-purple-500 bg-purple-50"
                          : "border-blue-500 bg-blue-50"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={cn(
                        "w-4 h-4",
                        formData.role === opt.value
                          ? opt.color === 'purple' ? "text-purple-600" : "text-blue-600"
                          : "text-slate-400"
                      )} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        formData.role === opt.value
                          ? opt.color === 'purple' ? "text-purple-700" : "text-blue-700"
                          : "text-slate-500"
                      )}>{opt.label}</span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-400 leading-snug">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Buong Pangalan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Hal. Juan dela Cruz"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-300 placeholder:font-medium"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="email@sadp.gov.ph"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-300 placeholder:font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Pansamantalang Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Hindi bababa sa 6 na karakter"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 pr-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[9px] font-medium text-slate-400">Ipabago ito sa gumagamit pagkatapos ng unang login.</p>
            </div>

            {/* Contact Number (optional) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Numero sa Telepono <span className="text-slate-300">(opsyonal)</span>
              </label>
              <input
                type="tel"
                placeholder="09XX-XXX-XXXX"
                value={formData.contactNumber}
                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-300 placeholder:font-medium"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={creating}
                className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-40"
              >
                Kanselahin
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-60 shadow-xl"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ginagawa ang Account...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Gumawa ng Account
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemUsers, setSystemUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const users = snapshot.docs
          .map((userDoc) => {
            const data = userDoc.data();
            const rawRole = data.role || 'member';
            return {
              id: data.uid || userDoc.id,
              name: data.name || 'Walang pangalan',
              email: data.email || 'Walang email',
              role: roleLabel(rawRole),
              rawRole,
              status: statusLabel(data.status),
              lastLogin: formatLastLogin(data.lastLogin),
              permissions: permissionsForRole(rawRole),
              contactNumber: data.contactNumber || '',
              createdAt: data.createdAt?.toMillis?.() || 0,
            };
          })
          .sort((a, b) => b.createdAt - a.createdAt)
          .map(({ createdAt, ...user }) => user);

        setSystemUsers(users);
        setUsersError(null);
        setLoadingUsers(false);
      },
      (error) => {
        console.error('Failed to load users:', error);
        setUsersError('Hindi makuha ang listahan ng gumagamit.');
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const latestUser = systemUsers.find(user => user.id === selectedUser.id);
    if (latestUser) {
      setSelectedUser(latestUser);
    }
  }, [systemUsers, selectedUser?.id]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return systemUsers;
    return systemUsers.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }, [searchTerm, systemUsers]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* New User Modal */}
      <AnimatePresence>
        {isNewUserModalOpen && (
          <NewUserModal
            isOpen={isNewUserModalOpen}
            onClose={() => setIsNewUserModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Pamamahala ng Access</h2>
          <p className="text-slate-500 font-medium tracking-tight">Pamahalaan ang mga gumagamit ng sistema, itinalagang papel, at mga pahintulot sa seguridad.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200/40 hover:bg-slate-50 transition-all">
             <History className="w-5 h-5 text-blue-600" />
             Talaan ng Aktibidad
           </button>
           <button
             onClick={() => setIsNewUserModalOpen(true)}
             className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-blue-500 active:scale-95"
           >
             <Plus className="w-5 h-5" />
             Bagong Gumagamit
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
                       placeholder="Maghanap ayon sa pangalan, email, o papel..."
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-300"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-[#fcfdff]">
                        <tr>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gumagamit</th>
                           {!selectedUser && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Itinalagang Papel</th>}
                           {!selectedUser && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Katayuan</th>}
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksyon</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan={selectedUser ? 2 : 4} className="px-10 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Nilo-load ang mga gumagamit...</span>
                              </div>
                            </td>
                          </tr>
                        ) : usersError ? (
                          <tr>
                            <td colSpan={selectedUser ? 2 : 4} className="px-10 py-16 text-center text-red-500 text-xs font-black uppercase tracking-widest">
                              {usersError}
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={selectedUser ? 2 : 4} className="px-10 py-16 text-center text-slate-400 text-xs font-black uppercase tracking-widest">
                              Walang gumagamit na tumutugma sa paghahanap.
                            </td>
                          </tr>
                        ) : filteredUsers.map((u) => (
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
                                    u.status === 'Aktibo' ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-600 border border-red-100"
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

         {/* Security Profile Panel */}
         <AnimatePresence>
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-3 space-y-6"
              >
                 {/* Identity Card */}
                 <div className="bg-[#0b1a38] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex items-start justify-between gap-6">
                       <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-white/10 rounded-[22px] flex items-center justify-center border border-white/10 shrink-0">
                             <ShieldCheck className="w-8 h-8 text-blue-400" />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-xl font-black tracking-tight leading-none uppercase">{selectedUser.name}</h4>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedUser.role}</p>
                             <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ID: {selectedUser.id}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Katayuan</span>
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full border",
                            selectedUser.status === 'Aktibo'
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          )}>
                             <div className={cn(
                               "w-2 h-2 rounded-full",
                               selectedUser.status === 'Aktibo' ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                             )}></div>
                             <span className="text-[10px] font-black uppercase tracking-widest">{selectedUser.status}</span>
                          </div>
                       </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                 </div>

                 {/* Permissions Section */}
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          Mga Pahintulot
                       </h4>
                       <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all">
                         I-reset ang Default
                       </button>
                    </div>
                    <div className="space-y-3">
                       <PermissionToggle label="Pagpapatunay ng Dokumento" description="Pahintulutan ang pag-apruba o pagtanggi ng mga naipasang dokumento" checked />
                       <PermissionToggle label="Pagpapatala ng Miyembro" description="Magdagdag o mag-edit ng rekord ng miyembro ng PWD" checked />
                       <PermissionToggle label="Pagsasaayos ng Sistema" description="Baguhin ang mga setting ng site at mga anunsyo" />
                       <PermissionToggle label="Pamamahala ng Pananalapi" description="Prosesuhan ang mga tulong at bayad na pinansyal" />
                       <PermissionToggle label="Access sa Talaan ng Aktibidad" description="Tingnan ang aktibidad at talaan ng buong sistema" checked />
                       <PermissionToggle label="Override ng Aplikasyon" description="Laktawan ang mga pamantayang protokol sa pagpapatunay" />
                    </div>
                 </div>

                 {/* Meta Data */}
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-10 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                       <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                       Impormasyon ng Account
                    </h4>
                    <div className="space-y-5">
                       <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                             <History className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Huling Login</p>
                             <p className="text-sm font-black text-slate-900 tracking-tight">{selectedUser.lastLogin}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                             <Globe className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pangunahing Terminal</p>
                             <p className="text-sm font-black text-slate-900 tracking-tight uppercase">Terminal 04 ng Barangay Hall</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                       <div className="flex gap-3">
                          <button className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 border border-slate-100 rounded-3xl group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-100 w-28">
                             <Key className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                             <span className="text-[8px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest text-center leading-tight">I-reset ang Password</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 border border-slate-100 rounded-3xl group transition-all hover:bg-white hover:shadow-xl hover:shadow-red-200/50 hover:border-red-100 w-28">
                             <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                             <span className="text-[8px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest text-center leading-tight">Delete</span>
                          </button>
                       </div>
                       <div className="flex gap-3 flex-grow lg:flex-grow-0">
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="px-6 py-4 bg-slate-100 text-slate-500 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                          >
                            Isara
                          </button>
                          <button className="flex-grow lg:flex-none px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-slate-200/50 transition-all active:scale-95">
                             I-save ang Pagbabago
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

// ─── Permission Toggle ────────────────────────────────────────────────────────

function PermissionToggle({ label, description, checked = false }: { label: string, description: string, checked?: boolean }) {
  const [active, setActive] = useState(checked);

  return (
    <div className={cn(
      "flex items-center justify-between p-5 rounded-2xl border transition-all group",
      active
        ? "bg-blue-50/60 border-blue-100 shadow-sm shadow-blue-100"
        : "bg-slate-50 border-slate-100 hover:border-slate-200"
    )}>
       <div className="space-y-1 pr-4">
          <p className={cn(
            "text-xs font-black uppercase tracking-tight transition-colors",
            active ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"
          )}>{label}</p>
          <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{description}</p>
       </div>
       <button
        onClick={() => setActive(!active)}
        className={cn(
          "w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner border shrink-0",
          active ? "bg-blue-600 border-blue-600 shadow-blue-200" : "bg-slate-200 border-slate-300 shadow-slate-200"
        )}
       >
          <div className={cn(
            "w-5 h-5 bg-white rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 shadow-md",
            active ? "right-1" : "left-1"
          )}></div>
       </button>
    </div>
  );
}
