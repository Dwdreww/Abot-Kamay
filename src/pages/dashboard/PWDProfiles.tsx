import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, Plus, 
  MoreVertical, Mail, Phone, MapPin, 
  UserCheck, ShieldAlert, ChevronLeft, 
  ChevronRight, ArrowRight, Eye, Edit2, Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { PWDProfile } from '../../types';
import PWDProfileModal from '../../components/PWDProfileModal';
import PWDViewModal from '../../components/PWDViewModal';

export default function PWDProfiles() {
  const [activeTab, setActiveTab] = useState('All Records');
  const tabs = ['All Records', 'Verified', 'Pending', 'In Review', 'Deceased'];

  const [members, setMembers] = useState<PWDProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PWDProfile | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'pwd_profiles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: PWDProfile[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as PWDProfile);
      });
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}'s record? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'pwd_profiles', id));
      } catch (error) {
        console.error("Error deleting profile:", error);
        alert("Failed to delete record.");
      }
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) {
      alert("No records to export.");
      return;
    }
    const headers = ['PWD ID', 'First Name', 'Last Name', 'Disability Type', 'Contact Number', 'Barangay', 'Status'];
    const rows = members.map(m => [
      m.pwdNumber,
      m.firstName,
      m.lastName,
      m.disabilityType,
      m.contactNumber,
      m.barangay,
      m.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(item => `"${item || ''}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PWD_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived state
  const filteredMembers = members.filter(member => {
    const matchesTab = activeTab === 'All Records' || member.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.pwdNumber?.toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">PWD Member Directory</h2>
          <p className="text-slate-500 font-medium tracking-tight">Access, manage and verify records of Persons with Disabilities in your barangay.</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleExportCSV}
             className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200/20 hover:bg-slate-50 transition-all active:scale-95"
           >
             <Download className="w-5 h-5 text-blue-600" />
             Export Directory
           </button>
           <button 
             onClick={() => { setSelectedProfile(null); setIsFormModalOpen(true); }}
             className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-500 transition-all active:scale-95"
           >
             <Plus className="w-5 h-5" />
             Add PWD Record
           </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={cn(
                  "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-slate-900 text-white shadow-xl" 
                    : "bg-white text-slate-400 border border-slate-50 hover:bg-slate-50"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-blue-600" />
               <input 
                type="text" 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by Name or PWD ID..." 
                className="pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-3xl outline-none text-xs font-bold w-full md:w-80 shadow-inner group-focus-within:border-blue-200 group-focus-within:ring-4 group-focus-within:ring-blue-50 transition-all"
               />
            </div>
         </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto flex-1">
             {loading ? (
                <div className="h-full flex items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
             ) : paginatedMembers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-20 text-slate-400">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">No records found</p>
                </div>
             ) : (
             <table className="w-full text-left font-sans">
                <thead className="bg-[#fcfdff]">
                   <tr>
                      <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">PWD Member</th>
                      <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">PWD ID Number</th>
                      <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Disability Type</th>
                      <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone / Mobile</th>
                      <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-12 py-8"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {paginatedMembers.map((member) => (
                     <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-12 py-8 flex items-center gap-5">
                           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-tighter shrink-0 border border-blue-100 shadow-sm transition-transform group-hover:scale-110">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                           </div>
                           <div className="space-y-1">
                              <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {member.barangay || 'San Antonio de Padua 1'}
                              </p>
                           </div>
                        </td>
                        <td className="px-12 py-8 text-[11px] font-black font-mono text-slate-400 tracking-tighter uppercase">{member.pwdNumber || 'N/A'}</td>
                        <td className="px-12 py-8 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{member.disabilityType || 'Not specified'}</td>
                        <td className="px-12 py-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest tracking-tighter">{member.contactNumber || 'N/A'}</td>
                        <td className="px-12 py-8 text-center">
                           <span className={cn(
                             "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap",
                             member.status === 'Verified' ? "bg-emerald-50 text-emerald-600" :
                             member.status === 'Pending' ? "bg-orange-50 text-orange-600" :
                             member.status === 'Deceased' ? "bg-slate-100 text-slate-600" :
                             "bg-blue-50 text-blue-600"
                           )}>
                              {member.status}
                           </span>
                        </td>
                        <td className="px-12 py-8 text-right">
                           <div className="flex items-center justify-end gap-2 transition-opacity">
                              <button 
                                onClick={() => { setSelectedProfile(member); setIsViewModalOpen(true); }}
                                className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all min-h-[38px] whitespace-nowrap" 
                                title="Tingnan ang Profile"
                              >
                                 <Eye className="w-3.5 h-3.5 shrink-0" />
                                 <span>Tingnan</span>
                              </button>
                              <button 
                                onClick={() => { setSelectedProfile(member); setIsFormModalOpen(true); }}
                                className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all min-h-[38px] whitespace-nowrap" 
                                title="I-edit ang Rekord"
                              >
                                 <Edit2 className="w-3.5 h-3.5 shrink-0" />
                                 <span>I-edit</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(member.id!, `${member.firstName} ${member.lastName}`)}
                                className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white hover:border-red-600 transition-all min-h-[38px] whitespace-nowrap" 
                                title="Burahin ang Rekord"
                              >
                                 <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                 <span>Burahin</span>
                              </button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             )}
          </div>

          {/* Footer Controls */}
          {!loading && filteredMembers.length > 0 && (
          <div className="p-10 border-t border-slate-50 bg-[#fcfdff] flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredMembers.length)} to {Math.min(currentPage * rowsPerPage, filteredMembers.length)} of {filteredMembers.length} records
                </p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page:</span>
                   <select 
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-transparent text-[10px] font-black text-slate-900 border-none outline-none cursor-pointer"
                   >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                   </select>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-30 shadow-sm"
                >
                   <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                   {Array.from({ length: totalPages }).map((_, i) => {
                     const p = i + 1;
                     return (
                       <button 
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={cn(
                          "w-10 h-10 rounded-2xl text-[10px] font-black transition-all",
                          p === currentPage ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "text-slate-400 hover:bg-slate-50"
                        )}
                       >
                         {p}
                       </button>
                     );
                   })}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm disabled:opacity-30"
                >
                   <ChevronRight className="w-5 h-5" />
                </button>
             </div>
          </div>
          )}
      </div>

      <PWDProfileModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        profile={selectedProfile}
      />
      
      <PWDViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        profile={selectedProfile}
      />

    </div>
  );
}
