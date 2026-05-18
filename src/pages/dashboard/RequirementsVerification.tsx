import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, AlertCircle, Search, User, 
  FileText, Shield, MapPin, Calendar, Clock, 
  ArrowUpRight, Eye, MoreVertical, CheckCheck,
  AlertTriangle, Info, Download, Trash2, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../../App';

export default function RequirementsVerification() {
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    setLoading(true);
    try {
      // Fetch all pending, for_review, returned applications
      const q = query(
        collection(db, 'applications'),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const results: any[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === 'pending' || data.status === 'for_review' || data.status === 'returned') {
          results.push({
            id: docSnap.id,
            refNo: data.referenceNumber,
            claimant: data.applicantName || 'Unknown',
            type: data.formTitle || data.formType,
            date: data.submittedAt ? data.submittedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            status: data.status === 'pending' ? 'Pending' : data.status === 'for_review' ? 'Reviewing' : 'Returned',
            color: data.status === 'returned' ? 'amber' : data.status === 'for_review' ? 'blue' : 'orange',
            documents: data.requirements ? Object.keys(data.requirements).length : 3,
            verified: 0,
            rawData: data
          });
        }
      });
      
      setApplications(results);
    } catch (error) {
      console.error("Error fetching validation queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string, actionLabel: string) => {
    if (!selectedApp || !user?.uid) return;
    
    const confirmAction = window.confirm(`Are you sure you want to mark this application as ${actionLabel}?`);
    if (!confirmAction) return;

    setActionLoading(true);
    try {
      const appRef = doc(db, 'applications', selectedApp.id);
      
      await updateDoc(appRef, {
        status: status,
        updatedAt: serverTimestamp(),
        reviewedBy: user.name,
        reviewedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'audit_logs'), {
        action: `Application ${actionLabel}`,
        userId: user.uid,
        userName: user.name,
        targetId: selectedApp.id,
        targetType: 'applications',
        timestamp: serverTimestamp()
      });

      // Send Notification to User
      if (selectedApp.rawData?.userId) {
        let notifMessage = '';
        let notifType = 'info';
        
        if (status === 'approved') {
          notifMessage = `Ang iyong aplikasyon para sa ${selectedApp.type} ay Naaprubahan!`;
          notifType = 'success';
        } else if (status === 'returned') {
          notifMessage = `Ang iyong aplikasyon para sa ${selectedApp.type} ay Ibinabalik para sa rebisyon.`;
          notifType = 'warning';
        } else if (status === 'rejected') {
          notifMessage = `Ikinalulungkot naming ipaalam na ang iyong aplikasyon para sa ${selectedApp.type} ay Na-reject.`;
          notifType = 'error';
        }

        await addDoc(collection(db, 'notifications'), {
          userId: selectedApp.rawData.userId,
          title: `Status ng Aplikasyon: ${actionLabel}`,
          message: notifMessage,
          type: notifType,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

      // Update UI and remove from queue
      setApplications(prev => prev.filter(app => app.id !== selectedApp.id));
      setSelectedApp(null);
      alert(`Application marked as ${actionLabel}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 p-4 lg:p-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Validation Queue</h2>
          <p className="text-slate-500 font-medium tracking-tight">Verify documents, cross-check records, and validate eligibility requirements.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(v => (
                <div key={v} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                   V{v}
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center font-black text-[10px] text-white">
                 +12
              </div>
           </div>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Active Validators</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-10">
         <div className={cn(
           "transition-all duration-500 space-y-6",
           selectedApp ? "lg:col-span-1" : "lg:col-span-4"
         )}>
            <div className="flex items-center justify-between px-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Queue List ({applications.length})</h3>
               <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Sort: Priority</button>
            </div>
            
            <div className={cn(
               "grid gap-6",
               selectedApp ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}>
               {applications.map((app) => (
                 <button 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className={cn(
                    "group text-left p-8 rounded-[40px] border transition-all duration-300 relative overflow-hidden",
                    selectedApp?.id === app.id 
                      ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200" 
                      : "bg-white border-slate-100 hover:border-blue-100 shadow-xl shadow-slate-200/20"
                  )}
                 >
                    <div className="flex justify-between items-start mb-10 relative z-10">
                       <div className={cn(
                         "w-14 h-14 rounded-[22px] flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                         selectedApp?.id === app.id ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"
                       )}>
                          <FileText className="w-7 h-7" />
                       </div>
                       <div className="flex flex-col items-end gap-1.5">
                          <span className={cn(
                             "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                             selectedApp?.id === app.id 
                                ? "bg-white/20 text-white" 
                                : app.color === 'rose' ? "bg-rose-50 text-rose-600" :
                                  app.color === 'orange' ? "bg-orange-50 text-orange-600" :
                                  "bg-amber-50 text-amber-600"
                          )}>
                             {app.status}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black font-mono tracking-tighter uppercase",
                            selectedApp?.id === app.id ? "text-blue-200" : "text-slate-300"
                          )}>{app.refNo}</span>
                       </div>
                    </div>

                    <div className="space-y-1.5 relative z-10">
                       <h4 className={cn(
                         "text-xl font-black tracking-tight leading-none uppercase",
                         selectedApp?.id === app.id ? "text-white" : "text-slate-900 group-hover:text-blue-600"
                       )}>{app.claimant}</h4>
                       <p className={cn(
                         "text-[10px] font-black uppercase tracking-[0.2em]",
                         selectedApp?.id === app.id ? "text-blue-200" : "text-slate-400"
                       )}>{app.type}</p>
                    </div>

                    <div className="mt-8 pt-8 border-t relative z-10" style={{ borderColor: selectedApp?.id === app.id ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
                       <div className="flex items-center justify-between mb-4">
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedApp?.id === app.id ? "text-blue-200" : "text-slate-400")}>Documents Verified</span>
                          <span className="text-[10px] font-black">{app.verified} / {app.documents}</span>
                       </div>
                       <div className={cn("w-full h-1.5 rounded-full overflow-hidden", selectedApp?.id === app.id ? "bg-white/10" : "bg-slate-100")}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(app.verified / app.documents) * 100}%` }}
                            className={cn("h-full rounded-full transition-all duration-1000", selectedApp?.id === app.id ? "bg-white" : "bg-blue-600")}
                          />
                       </div>
                    </div>
                    
                    {/* Background decoration */}
                    {selectedApp?.id === app.id && (
                       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl -z-0"></div>
                    )}
                 </button>
               ))}
            </div>
         </div>

         {/* Detailed Verification Panel */}
         <AnimatePresence mode="wait">
            {selectedApp && (
              <motion.div 
                key="detail-panel"
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="lg:col-span-3 space-y-10 h-full"
              >
                 <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200/40 p-12 lg:p-16 relative overflow-hidden flex flex-col h-full">
                    <div className="flex flex-wrap items-center justify-between gap-10 mb-12 pb-12 border-b border-slate-50">
                       <div className="flex items-center gap-10">
                          <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center border border-slate-100 shrink-0">
                             <User className="w-10 h-10 text-slate-300" />
                          </div>
                          <div className="space-y-1">
                             <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedApp.claimant}</h3>
                             <div className="flex items-center gap-6 text-slate-400">
                                <span className="flex items-center gap-2">
                                   <Shield className="w-4 h-4" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">{selectedApp.refNo}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                   <Clock className="w-4 h-4" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Submitted 2 days ago</span>
                                </span>
                             </div>
                          </div>
                       </div>
                       <button 
                        onClick={() => setSelectedApp(null)}
                        className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
                       >
                          <XCircle className="w-6 h-6" />
                       </button>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-12 flex-grow overflow-hidden">
                       {/* Left Panel: Document List & Checklist */}
                       <div className="lg:col-span-2 space-y-10 overflow-y-auto pr-4 scrollbar-hide">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                Document Repository
                             </h4>
                             <div className="space-y-3">
                                <DocumentRow name="National ID / PWD ID" status="Verified" date="Oct 12" />
                                <DocumentRow name="Barangay Residency Certificate" status="Verified" date="Oct 11" />
                                <DocumentRow name="Medical Certificate / Abstract" status="Reviewing" date="Oct 12" />
                                <DocumentRow name="Proof of Income / 12A" status="Pending" date="Oct 12" />
                                <DocumentRow name="Member Photo (2x2)" status="Verified" date="Oct 10" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                Verification Checklist
                             </h4>
                             <div className="space-y-3 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                                <CheckItem label="Identity authenticated via PSA" checked />
                                <CheckItem label="Resident of San Antonio De Padua I" checked />
                                <CheckItem label="Disability type matches medical context" checked />
                                <CheckItem label="Verification of document signatures" />
                                <CheckItem label="Global duplicate scan: Passed" checked />
                             </div>
                          </div>
                       </div>

                       {/* Right Panel: Preview & Decision */}
                       <div className="lg:col-span-3 flex flex-col gap-8 h-full">
                          <div className="bg-slate-900 rounded-[45px] flex-grow flex items-center justify-center relative overflow-hidden shadow-2xl group cursor-zoom-in min-h-[300px]">
                             <img 
                                src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                                alt="Document Preview" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                                <div className="flex items-center justify-between">
                                   <div>
                                      <p className="text-xs font-black text-white uppercase tracking-tight">Medical Certificate.pdf</p>
                                      <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Uploaded May 10, 2024</p>
                                   </div>
                                   <div className="flex gap-2">
                                      <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                                         <Search className="w-4 h-4" />
                                      </button>
                                      <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                                         <Download className="w-4 h-4" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <button 
                                disabled={actionLoading}
                                onClick={() => handleUpdateStatus('approved', 'Approved')}
                                className="flex items-center justify-center gap-3 py-5 bg-emerald-500 text-white rounded-[25px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 hover:-translate-y-1 transition-all disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve
                             </button>
                             <button 
                                disabled={actionLoading}
                                onClick={() => handleUpdateStatus('returned', 'Returned')}
                                className="flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 text-slate-600 rounded-[25px] font-black text-xs uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 transition-all disabled:opacity-50"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                Return
                             </button>
                             <button 
                                disabled={actionLoading}
                                onClick={() => handleUpdateStatus('rejected', 'Rejected')}
                                className="flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 text-slate-600 rounded-[25px] font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                             </button>
                          </div>
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

function DocumentRow({ name, status, date }: { name: string, status: string, date: string }) {
  return (
    <div className="p-5 bg-white border border-slate-100 rounded-[25px] flex items-center justify-between group hover:shadow-xl hover:shadow-blue-100 hover:border-blue-100 transition-all cursor-pointer">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
             <FileText className="w-5 h-5" />
          </div>
          <div>
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none mb-1">{name}</p>
             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">{date}</p>
          </div>
       </div>
       <span className={cn(
          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
          status === 'Verified' ? "bg-emerald-50 text-emerald-600" :
          status === 'Reviewing' ? "bg-blue-50 text-blue-600" :
          "bg-orange-50 text-orange-600"
       )}>
          {status}
       </span>
    </div>
  )
}

function CheckItem({ label, checked = false }: { label: string, checked?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-0.5">
       <div className={cn(
          "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
          checked ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200"
       )}>
          {checked && <CheckCircle2 className="w-3 h-3" />}
       </div>
       <span className={cn(
          "text-[9px] font-black uppercase tracking-tight",
          checked ? "text-slate-900" : "text-slate-400"
       )}>
          {label}
       </span>
    </div>
  )
}
