import React, { useState } from 'react';
import { 
  Search, Filter, ChevronRight, User, 
  MapPin, Calendar, Clock, AlertCircle,
  FileText, CheckCircle2, XCircle, MoreVertical,
  ChevronLeft, Info, ArrowUpRight, ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function ApplicationReview() {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  
  const cases = [
    { id: 'CASE-2024-04218', name: 'Maria Santos', type: 'Medical Assistance', date: 'May 16, 2024', status: 'For Decision', priority: 'High', color: 'orange' },
    { id: 'CASE-2024-04217', name: 'Pedro Reyes', type: 'Assistive Device', date: 'May 16, 2024', status: 'Pending Review', priority: 'Medium', color: 'blue' },
    { id: 'CASE-2024-04216', name: 'Juan Dela Cruz', type: 'Medical Assistance', date: 'May 16, 2024', status: 'Pending Review', priority: 'High', color: 'blue' },
    { id: 'CASE-2024-04215', name: 'Liza Martin', type: 'Transportation Support', date: 'May 16, 2024', status: 'Needs Revision', priority: 'Medium', color: 'orange' },
    { id: 'CASE-2024-04214', name: 'Rommel Garcia', type: 'Livelihood Support', date: 'May 16, 2024', status: 'Pending Review', priority: 'Low', color: 'blue' },
  ];

  const statusTabs = [
    { label: 'All Cases', count: 124 },
    { label: 'Pending Review', count: 36 },
    { label: 'Needs Revision', count: 18 },
    { label: 'For Decision', count: 22 },
    { label: 'Approved', count: 40 },
    { label: 'Rejected', count: 8 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Application Review</h2>
        <p className="text-slate-500 font-medium">Review, evaluate, and take action on submitted applications.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {statusTabs.map((tab, i) => (
          <button 
            key={tab.label}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-3",
              i === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
            )}
          >
            {tab.label}
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[8px]",
              i === 0 ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
            )}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-wrap items-center gap-6">
        <div className="flex-grow min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, case ID, or email..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-sans"
          />
        </div>
        
        <div className="flex items-center gap-4">
           <FilterSelect label="Program Type" options={["All Programs", "Medical", "Assistive", "Livelihood"]} />
           <FilterSelect label="Application Type" options={["All Types", "New", "Renewal"]} />
           <FilterSelect label="Location" options={["All Locations", "District I", "District II"]} />
           <button className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all">
             Apply Filters
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Review Queue */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Queue (36)</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Sort: Newest First</button>
          </div>
          <div className="space-y-3">
             {cases.map((c) => (
               <button 
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={cn(
                  "w-full text-left p-5 rounded-[25px] border transition-all duration-300 group",
                  selectedCase?.id === c.id 
                    ? "bg-blue-50 border-blue-200 ring-2 ring-blue-600/5 shadow-lg shadow-blue-200/50" 
                    : "bg-white border-slate-100 hover:border-blue-100 hover:shadow-md"
                )}
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter font-mono">{c.id}</span>
                       <span className={cn(
                         "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                         c.priority === 'High' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                       )}>
                         ● {c.priority} Priority
                       </span>
                    </div>
                 </div>
                 <h4 className="font-black text-slate-900 text-sm mb-1">{c.name}</h4>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{c.type}</p>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{c.date}</span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      c.color === 'orange' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    )}>{c.status}</span>
                 </div>
               </button>
             ))}
          </div>
          <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-dashed border-slate-200 rounded-[25px] hover:border-blue-200 hover:text-blue-600 transition-all">
             Load More Cases
          </button>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-3 space-y-8">
           {selectedCase ? (
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 p-12 lg:p-16 relative overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Case Top Bar */}
                <div className="flex flex-wrap justify-between items-start gap-8 mb-12 pb-12 border-b border-slate-50">
                   <div className="flex gap-8">
                      <div className="w-24 h-24 bg-slate-50 rounded-[30px] border border-slate-100 flex items-center justify-center shrink-0">
                         <User className="w-12 h-12 text-slate-300" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                           <h3 className="text-4xl font-black text-slate-900 tracking-tight">{selectedCase.name}</h3>
                           <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                             <CheckCircle2 className="w-3 h-3" /> Verified Member
                           </span>
                         </div>
                         <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 font-medium text-sm">
                            <span className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                              CASE ID: {selectedCase.id}
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Apr 12, 1985 (39 yrs)
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> Quezon City, NCR
                            </span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button className="p-3 border border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all">
                         <MoreVertical className="w-5 h-5" />
                      </button>
                      <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200">
                         Full Profile <ArrowUpRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                {/* Case Content Grid */}
                <div className="grid lg:grid-cols-5 gap-12">
                   {/* Left Panel: Request Info */}
                   <div className="lg:col-span-3 space-y-12">
                      <div className="space-y-8">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                           Request Summary
                         </h4>
                         <div className="grid grid-cols-2 gap-8">
                            <InfoField label="Program" value={selectedCase.type} />
                            <InfoField label="Application Type" value="Individual" />
                            <InfoField label="Assistance Type" value="Surgery / Procedure" />
                            <InfoField label="Amount Requested" value="₱ 85,000.00" />
                            <InfoField label="Date Submitted" value="May 16, 2024 10:24 AM" />
                            <InfoField label="Preferred Facility" value="Quezon City General Hospital" />
                         </div>
                         <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Medical Remarks</p>
                            <p className="text-slate-600 font-medium leading-relaxed">
                               The applicant is requesting financial assistance for knee replacement surgery to address severe osteoarthritis affecting daily mobility and quality of life. Attached medical reports confirm the necessity of the procedure.
                            </p>
                         </div>
                      </div>

                      {/* Documents Section */}
                      <div className="space-y-8">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                           Supporting Documents
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DocCard name="Medical Certificate" type="PDF" date="May 15" status="Verified" />
                            <DocCard name="Barangay Residency" type="JPG" date="May 14" status="Verified" />
                            <DocCard name="Clinical Abstract" type="PDF" date="May 15" status="Pending" />
                         </div>
                      </div>

                      {/* Case History Timeline */}
                      <div className="space-y-8">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                           Application History
                         </h4>
                         <div className="relative pl-8 space-y-10 border-l border-slate-100 ml-4">
                            <HistoryItem status="Application Submitted" date="May 16, 2024 10:24 AM" user="Maria Santos (Member)" isCurrent={false} />
                            <HistoryItem status="Initial Validation" date="May 16, 2024 10:25 AM" user="System Automator" isCurrent={false} />
                            <HistoryItem status="For Review" date="May 16, 2024 10:30 AM" user="Admin Marlene Bautista" isCurrent={true} />
                         </div>
                      </div>
                   </div>

                   {/* Right Panel: Decision & Assessment */}
                   <div className="lg:col-span-2 space-y-10">
                      <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/30 space-y-10">
                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Case Assessment</h5>
                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                                     <CheckCircle2 className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-emerald-900 uppercase tracking-tighter leading-none">Eligibility Match</p>
                                     <p className="text-[10px] font-bold text-emerald-700/70 mt-1">92% Criteria Met</p>
                                  </div>
                               </div>
                               <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Risk Flags</h5>
                               <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md font-black text-[9px] uppercase tracking-tighter">None Detected</span>
                            </div>
                            <div className="space-y-3">
                               <RiskItem type="No Other Funding" color="emerald" desc="Applicant has no other source of medical funding records." />
                               <RiskItem type="First-Time Requester" color="blue" desc="This is the first assistance request from this member." />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Decision Notes</h5>
                            <textarea 
                               placeholder="Write your review notes here..."
                               className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-medium text-sm text-slate-600 placeholder:text-slate-300 resize-none"
                            ></textarea>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-right">0 / 1000 characters</p>
                         </div>

                         <div className="space-y-4 pt-4">
                            <button className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all group/btn">
                               Forward for Final Approval
                               <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                               <button className="py-4 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-600 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                  Return for Revision
                               </button>
                               <button className="py-4 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                  Reject Application
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="bg-blue-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                         <div className="relative z-10 space-y-4">
                            <h5 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Eligibility Scorecard</h5>
                            <p className="text-sm font-medium leading-relaxed text-blue-100">Documents complete. Medical assessment confirms necessity of hardware procedure. Meets all eligibility requirements.</p>
                            <div className="pt-4">
                               <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest">Completeness</span>
                                  <span className="text-xl font-black">92%</span>
                               </div>
                               <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                  <div className="w-[92%] h-full bg-blue-400"></div>
                               </div>
                            </div>
                         </div>
                         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-[800px] bg-white rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-6 text-center p-12">
                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center">
                   <Search className="w-12 h-12 text-slate-200" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a case to review</h3>
                   <p className="text-slate-500 font-medium max-w-sm">Pick an application from the queue to view full details and make an eligibility decision.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="space-y-1.5">
       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <select className="px-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none pr-10 cursor-pointer">
          {options.map(opt => <option key={opt}>{opt}</option>)}
       </select>
    </div>
  )
}

function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1.5">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">{label}</p>
       <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

function DocCard({ name, type, date, status }: { name: string, type: string, date: string, status: 'Verified' | 'Pending' | 'Rejected' }) {
  return (
    <div className="bg-white p-5 rounded-[25px] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
       <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
             <FileText className="w-5 h-5" />
          </div>
          <span className={cn(
             "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
             status === 'Verified' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
          )}>{status}</span>
       </div>
       <h5 className="font-black text-slate-900 text-xs mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{name}</h5>
       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{type} • {date}</p>
    </div>
  )
}

function HistoryItem({ status, date, user, isCurrent }: { status: string, date: string, user: string, isCurrent: boolean }) {
  return (
    <div className="relative">
       <div className={cn(
          "absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-all",
          isCurrent ? "bg-blue-600 scale-125" : "bg-slate-200"
       )}></div>
       <div className="space-y-1">
          <p className={cn("text-xs font-black uppercase tracking-tight", isCurrent ? "text-blue-600" : "text-slate-900")}>{status}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{date}</p>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-1">
             <User className="w-3 h-3" /> {user}
          </p>
       </div>
    </div>
  )
}

function RiskItem({ type, color, desc }: { type: string, color: 'emerald' | 'blue' | 'red', desc: string }) {
  return (
    <div className="flex gap-4">
       <div className={cn(
          "shrink-0 w-1 rounded-full",
          color === 'emerald' ? "bg-emerald-500" : color === 'blue' ? "bg-blue-500" : "bg-red-500"
       )}></div>
       <div className="space-y-1">
          <p className={cn("text-[10px] font-black uppercase tracking-tight", color === 'emerald' ? "text-emerald-900" : "text-blue-900")}>{type}</p>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}
